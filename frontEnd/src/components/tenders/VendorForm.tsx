/**
 * VendorForm.tsx
 *
 * Vendor form for filling and submitting responses to a tender template.
 *
 * - Fetches vendor response via GetVendorResponseByTenderTemplateHeaderId
 * - Parses the `response` JSON (may be double-encoded) into a
 *   VendorResponseTemplatePayload with recursive sections
 * - Hydrates into TemplateBuilderSection[] + PreviewResponseValues via
 *   hydrateVendorSections() (shares the same hydration logic as tender preview)
 * - Renders using ReadOnlyPreviewSection with isEditable=true (reuses the
 *   same recursive renderer as Tender Preview – no duplicate rendering code)
 * - Content text and section structure are read-only
 * - Response inputs, acknowledgement checkboxes, and signature canvas are active
 * - Draft / Save with validation
 * - Custom tokens resolved from API customTokens
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import MainLayout from "../../MainLayout";
import { ResponseTypeId, SectionTypeId } from "../../constants";
import {
  type VendorResponseTemplatePayload,
  type VendorResponsePayload,
  useGetVendorResponseByTenderTemplateHeaderIdQuery,
  useGetTenderTemplateForPreviewQuery,
  useUpsertVendorResponseDetailsMutation,
} from "../../api/Tenders";
import { hydrateVendorSections, hydrateCustomTokens } from "../../utils/hydrateTemplate";
import ReadOnlyPreviewSection, {
  type PreviewResponseValues,
} from "./ReadOnlyPreviewSection";
import type { TemplateBuilderSection } from "../shared/types";
import { showToast } from "../shared/ui";
import type { TemplateTokenContext } from "../../utils/templateTokens";
import { DEFAULT_TEMPLATE_TOKEN_CONTEXT } from "../../utils/templateTokens";

// ── JSON parsing ────────────────────────────────────────────────────────

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

/**
 * Safely extract VendorResponseTemplatePayload from API data.
 * The `response` field may be a raw string, single-encoded, or double-encoded.
 * Sections may use PascalCase or camelCase keys.
 */
const parseVendorTemplateResponse = (
  rawResponse: unknown
): VendorResponseTemplatePayload | null => {
  if (!rawResponse) return null;

  let parsed: unknown = rawResponse;

  // Unwrap up to two layers of JSON encoding
  if (typeof parsed === "string") parsed = tryParseJson(parsed);
  if (typeof parsed === "string") parsed = tryParseJson(parsed);

  if (!parsed || typeof parsed !== "object") return null;

  const obj = parsed as Record<string, unknown>;

  // Normalize PascalCase → camelCase at root level
  const sections = (
    Array.isArray(obj.sections) ? obj.sections :
    Array.isArray(obj.Sections) ? obj.Sections : []
  ) as VendorResponsePayload[];

  // Recursively normalize section keys (backend may return PascalCase)
  const normalizeSections = (
    raw: unknown[]
  ): VendorResponsePayload[] =>
    raw.map((s) => {
      const sec = s as Record<string, unknown>;
      const children = Array.isArray(sec.subsections)
        ? sec.subsections
        : Array.isArray(sec.Subsections)
          ? sec.Subsections
          : [];
      return {
        tenderTempSectionId:
          (sec.tenderTempSectionId ?? sec.TenderTempSectionId ?? "") as string,
        tenderTemplateHeader:
          (sec.tenderTemplateHeader ?? sec.TenderTemplateHeader ?? "") as string,
        sectionId: Number(sec.sectionId ?? sec.SectionId ?? 0),
        title: (sec.title ?? sec.Title ?? "") as string,
        content: (sec.content ?? sec.Content ?? "") as string,
        responseType: Number(sec.responseType ?? sec.ResponseType ?? 0),
        properties: (sec.properties ?? sec.Properties ?? "") as string,
        acknowledgementStatement:
          (sec.acknowledgementStatement ?? sec.AcknowledgementStatement ?? "") as string,
        signature: (sec.signature ?? sec.Signature ?? "") as string,
        response: (sec.response ?? sec.Response ?? "") as string | number | boolean | null,
        sectionOrder: Number(sec.sectionOrder ?? sec.SectionOrder ?? 0),
        parentTemplateSectionId:
          (sec.parentTemplateSectionId ?? sec.ParentTemplateSectionId ?? null) as string | null,
        subsections: normalizeSections(children as unknown[]),
        createdDateTime: (sec.createdDateTime ?? sec.CreatedDateTime ?? "") as string,
        modifiedDateTime: (sec.modifiedDateTime ?? sec.ModifiedDateTime ?? null) as string | null,
      };
    });

  return {
    tenderTempHeaderId:
      (obj.tenderTempHeaderId ?? obj.TenderTempHeaderId ?? "") as string,
    tenderHeaderId:
      (obj.tenderHeaderId ?? obj.TenderHeaderId ?? "") as string,
    name: (obj.name ?? obj.Name ?? "") as string,
    description: (obj.description ?? obj.Description ?? "") as string,
    typeId: Number(obj.typeId ?? obj.TypeId ?? 0),
    isDeleted: Boolean(obj.isDeleted ?? obj.IsDeleted),
    createdDateTime: (obj.createdDateTime ?? obj.CreatedDateTime ?? "") as string,
    modifiedDateTime:
      (obj.modifiedDateTime ?? obj.ModifiedDateTime ?? null) as string | null,
    customTokens: Array.isArray(obj.customTokens ?? obj.CustomTokens)
      ? (obj.customTokens ?? obj.CustomTokens) as { name: string; value: string }[]
      : undefined,
    sections: normalizeSections(sections as unknown[]),
  };
};

// ── Serializer: embed vendor responses back into the payload structure ──

function serializeVendorSections(
  sections: TemplateBuilderSection[],
  responseValues: PreviewResponseValues
): VendorResponsePayload[] {
  return sections.map((s) => ({
    tenderTempSectionId: s.sectionUniqueId || s.id,
    tenderTemplateHeader: "",
    sectionId: s.sectionTypeId,
    title: s.title || "",
    content: s.content || "",
    responseType: s.responseTypeId ?? 0,
    properties: s.properties ? JSON.stringify(s.properties) : "",
    acknowledgementStatement:
      s.sectionTypeId === SectionTypeId.Acknowledgement
        ? s.acknowledgementStatement || ""
        : "",
    signature:
      s.sectionTypeId === SectionTypeId.ESignature
        ? (responseValues[s.id] as string | undefined) || s.signature || ""
        : s.signature || "",
    response:
      s.sectionTypeId === SectionTypeId.Statement
        ? ""
        : (responseValues[s.id] ?? ""),
    sectionOrder: s.order,
    subsections: s.subsections
      ? serializeVendorSections(s.subsections, responseValues)
      : [],
    createdDateTime: "",
    modifiedDateTime: null,
  }));
}

// ── Recursive validation ────────────────────────────────────────────────

function validateSectionsRecursive(
  sections: TemplateBuilderSection[],
  responseValues: PreviewResponseValues,
  errors: Record<string, string>
): void {
  for (const section of sections) {
    if (section.sectionTypeId === SectionTypeId.Response) {
      const isRequired = Boolean(section.properties?.isRequired);
      const value = responseValues[section.id];

      if (section.responseTypeId === ResponseTypeId.Text) {
        const text = String(value ?? "");
        if (isRequired && text.trim() === "") {
          errors[section.id] = "This field is required.";
        } else {
          const maxLen = (section.properties as { maxLength?: number } | undefined)?.maxLength;
          if (typeof maxLen === "number" && text.length > maxLen) {
            errors[section.id] = `Maximum length is ${maxLen} characters.`;
          }
        }
      }

      if (section.responseTypeId === ResponseTypeId.Numeric) {
        const hasValue = value !== "" && value !== undefined && value !== null;
        if (isRequired && !hasValue) {
          errors[section.id] = "This field is required.";
        } else if (hasValue) {
          const num = Number(value);
          if (Number.isNaN(num)) {
            errors[section.id] = "Enter a valid number.";
          } else {
            const props = section.properties as { min?: number; max?: number } | undefined;
            if (typeof props?.min === "number" && num < props.min)
              errors[section.id] = `Minimum value is ${props.min}.`;
            if (typeof props?.max === "number" && num > props.max)
              errors[section.id] = `Maximum value is ${props.max}.`;
          }
        }
      }

      if (section.responseTypeId === ResponseTypeId.List) {
        if (isRequired && !String(value ?? "").trim()) {
          errors[section.id] = "Please select an option.";
        }
      }
    }

    // Recurse into subsections
    if (section.subsections?.length) {
      validateSectionsRecursive(section.subsections, responseValues, errors);
    }
  }
}

// ── Component ───────────────────────────────────────────────────────────

const VendorForm = () => {
  const navigate = useNavigate();
  const { tempId } = useParams<{ tempId: string }>();

  // ── Response values (flat map shared across all nesting levels) ────
  const [responseValues, setResponseValues] = useState<PreviewResponseValues>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleResponseChange = useCallback(
    (sectionId: string, value: string | number | boolean) => {
      // Clear validation error on change
      setValidationErrors((prev) => {
        if (!prev[sectionId]) return prev;
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      setResponseValues((prev) => ({ ...prev, [sectionId]: value }));
    },
    []
  );

  // ── Save mutation ─────────────────────────────────────────────────
  const [upsertVendorResponseDetails, { isLoading: isSaving }] =
    useUpsertVendorResponseDetailsMutation();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetVendorResponseByTenderTemplateHeaderIdQuery(tempId || "", {
    skip: !tempId,
    refetchOnMountOrArgChange: true,
  });

  // Fetch the tender template preview specifically to get authoritative customTokens.
  // The vendor response JSON may not carry them (they are set by the tender admin).
  const { data: previewData } = useGetTenderTemplateForPreviewQuery(tempId || "", {
    skip: !tempId,
  });

  const vendorResponse = data?.data;

  // ── Parse the response JSON ─────────────────────────────────────
  const parsedTemplate = useMemo(() => {
    const fromResponse = parseVendorTemplateResponse(vendorResponse?.response);
    if (fromResponse) return fromResponse;
    return parseVendorTemplateResponse(vendorResponse);
  }, [vendorResponse]);

  // ── Hydrate sections for rendering ────────────────────────────
  const hydratedSections = useMemo(() => {
    if (!parsedTemplate?.sections) return [];
    // seedValues is ignored here — seeding into state is done by the effect below.
    return hydrateVendorSections(parsedTemplate.sections, {});
  }, [parsedTemplate?.sections]);

  // Re-seed responseValues every time the underlying API response changes.
  //
  // We depend on `vendorResponse` (the raw API data object) rather than the
  // derived `sections` memo, because:
  //   - `vendorResponse` only gets a new reference when RTK Query returns a
  //     new network result — it is stable while the user is typing.
  //   - This naturally handles the back-navigation scenario: RTK Query
  //     refetches (refetchOnMountOrArgChange:true), `vendorResponse` gets a
  //     new reference, and this effect fires → inputs prefill from saved data.
  //
  // We also reset validationErrors whenever the template id changes so stale
  // errors don't bleed across tenders.
  useEffect(() => {
    const seedValues: PreviewResponseValues = {};

    if (parsedTemplate?.sections) {
      hydrateVendorSections(parsedTemplate.sections, seedValues);
    }

    setResponseValues(seedValues);
    setValidationErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorResponse, tempId]);

  // ── Token context ──────────────────────────────────────────────
  const tokenContext = useMemo<TemplateTokenContext>(() => {
    const ctx: TemplateTokenContext = {
      ...DEFAULT_TEMPLATE_TOKEN_CONTEXT,
    };

    // 1. Overlay tokens embedded in the saved vendor response (may be absent)
    const embeddedTokens = hydrateCustomTokens(parsedTemplate?.customTokens);
    for (const ct of embeddedTokens) {
      if (ct.name) ctx[ct.name] = ct.value;
    }

    // 2. Overlay tokens from the live tender template preview (authoritative —
    //    these are set by the tender admin and are always up-to-date).
    const previewTokens = hydrateCustomTokens(previewData?.data?.customTokens);
    for (const ct of previewTokens) {
      if (ct.name) ctx[ct.name] = ct.value;
    }

    ctx.TEMPLATE_NAME = parsedTemplate?.name ?? ctx.TEMPLATE_NAME;
    ctx.TEMPLATE_ID = parsedTemplate?.tenderTempHeaderId ?? ctx.TEMPLATE_ID;
    ctx.TENDER_ID = parsedTemplate?.tenderHeaderId ?? ctx.TENDER_ID;

    return ctx;
  }, [
    parsedTemplate?.customTokens,
    parsedTemplate?.name,
    parsedTemplate?.tenderHeaderId,
    parsedTemplate?.tenderTempHeaderId,
    previewData?.data?.customTokens,
  ]);

  // ── Sort top-level sections ────────────────────────────────────
  const sortedSections = useMemo(
    () => [...hydratedSections].sort((a, b) => a.order - b.order),
    [hydratedSections]
  );

  // ── Existing draft detection ──────────────────────────────────
  const hasExistingDraft = Boolean(
    (vendorResponse?.resposneId &&
      vendorResponse.resposneId !== "00000000-0000-0000-0000-000000000000") ||
      (vendorResponse?.responseId &&
        vendorResponse.responseId !== "00000000-0000-0000-0000-000000000000")
  );

  // ── Save / Draft handler ──────────────────────────────────────
  const handleUpsert = async (isCompleted: boolean) => {
    if (!tempId) {
      showToast({ message: "Template id is missing.", type: "error" });
      return;
    }

    if (!parsedTemplate) {
      showToast({ message: "Unable to build vendor response payload.", type: "error" });
      return;
    }

    // Validate only on final save
    if (isCompleted) {
      const errors: Record<string, string> = {};
      validateSectionsRecursive(sortedSections, responseValues, errors);
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        showToast({ message: "Please fix validation errors before saving.", type: "error" });
        return;
      }
    } else {
      setValidationErrors({});
    }

    // Build payload preserving the original template structure
    const updatedPayload: VendorResponseTemplatePayload = {
      ...parsedTemplate,
      sections: serializeVendorSections(sortedSections, responseValues),
    };

    try {
      const response = await upsertVendorResponseDetails({
        tenderTemplarteHeaderId: tempId,
        response: JSON.stringify(updatedPayload),
        isCompleted,
      }).unwrap();

      if (response?.success === false) {
        showToast({
          message: response?.message || "Failed to save vendor response.",
          type: "error",
        });
        return;
      }

      showToast({
        message:
          response?.message ||
          (isCompleted
            ? "Vendor response saved successfully."
            : hasExistingDraft
              ? "Draft updated successfully."
              : "Draft created successfully."),
        type: "success",
      });

      await refetch();

      if (parsedTemplate?.tenderHeaderId) {
        navigate(`/tender-submit?tenderId=${parsedTemplate.tenderHeaderId}`);
      } else {
        navigate(-1);
      }
    } catch {
      showToast({
        message: isCompleted
          ? "Failed to save vendor response."
          : "Failed to save draft.",
        type: "error",
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {parsedTemplate?.name || "Vendor Form"}
        </Typography>

        {parsedTemplate?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {parsedTemplate.description}
          </Typography>
        )}

        {!parsedTemplate?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill the sections below and save your response.
          </Typography>
        )}

        {!tempId && (
          <Typography color="error" sx={{ mt: 2 }}>
            Template id is missing.
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* ── Content area ───────────────────────────────────────── */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {isLoading && <Typography>Loading vendor form…</Typography>}
          {isError && (
            <Typography color="error">Failed to load vendor form.</Typography>
          )}

          {!isLoading && !isError && sortedSections.length === 0 && (
            <Typography color="text.secondary">
              No sections found for this template.
            </Typography>
          )}

          {!isLoading &&
            !isError &&
            sortedSections.map((section, index) => (
              <Paper
                key={section.id}
                variant="outlined"
                sx={{ p: 3, mb: 2, borderRadius: 2 }}
              >
                <ReadOnlyPreviewSection
                  section={section}
                  tokenContext={tokenContext}
                  depth={0}
                  sectionNumber={`${index + 1}`}
                  isEditable
                  responseValues={responseValues}
                  onResponseChange={handleResponseChange}
                />

                {/* Show validation error for this top-level section */}
                {validationErrors[section.id] && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {validationErrors[section.id]}
                  </Typography>
                )}
              </Paper>
            ))}
        </Box>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Button onClick={() => navigate(-1)}>Back</Button>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              disabled={isLoading || isError || isSaving || sortedSections.length === 0}
              onClick={() => handleUpsert(false)}
            >
              {isSaving ? "Saving…" : "Draft"}
            </Button>

            <Button
              variant="contained"
              disabled={isLoading || isError || isSaving || sortedSections.length === 0}
              onClick={() => handleUpsert(true)}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default VendorForm;
