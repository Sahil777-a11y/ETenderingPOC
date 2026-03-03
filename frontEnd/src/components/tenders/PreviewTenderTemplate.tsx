/**
 * PreviewTenderTemplate.tsx
 *
 * Read-only document preview for a Tender Template.
 *
 * - Fetches template via GET /Tender/GetTenderTemplateForPreview
 * - Hydrates sections recursively with hydrateTenderSections()
 * - Builds a TemplateTokenContext from API customTokens + route state
 * - Renders every section with ReadOnlyPreviewSection (recursive, N-level)
 * - ALL {{token}} placeholders are resolved before display
 * - NO form-builder UI, chips, drag-drop, or mutation logic
 */

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";

import MainLayout from "../../MainLayout";
import {
  useGetTenderTemplateForPreviewQuery,
  useUpdateTenderTemplateMutation,
} from "../../api/Tenders";
import { hydrateTenderSections, hydrateCustomTokens } from "../../utils/hydrateTemplate";
import type { TemplateTokenContext } from "../../utils/templateTokens";
import { DEFAULT_TEMPLATE_TOKEN_CONTEXT } from "../../utils/templateTokens";
import ReadOnlyPreviewSection, {
  type PreviewResponseValues,
} from "./ReadOnlyPreviewSection";
import type { TemplateBuilderSection } from "../shared/types";
import { SectionTypeId } from "../../constants";
import type { UpdateTenderTemplateSectionPayload } from "../../api/Tenders";

// ── Serializer: TemplateBuilderSection[] → UpdateTenderTemplateSectionPayload[] ──
// We re-use the hydrated section tree to build the save payload.  Response
// values entered in preview are embedded into signature / content where
// appropriate so they round-trip cleanly through the existing endpoint.
function serializeSections(
  sections: TemplateBuilderSection[],
  responseValues: PreviewResponseValues
): UpdateTenderTemplateSectionPayload[] {
  return sections.map((s) => ({
    id: s.sectionUniqueId,
    sectionTypeId: s.sectionTypeId,
    sectionOrder: s.order,
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
    subsections: s.subsections
      ? serializeSections(s.subsections, responseValues)
      : [],
  }));
}

const PreviewTenderTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tempId } = useParams<{ tempId: string }>();

  // ── Editable response state ──────────────────────────────────────────
  // Flat map of sectionId → user-entered value.  Lives here so that all
  // nested sections share a single authoritative store without prop-drilling
  // mutable references.
  const [responseValues, setResponseValues] = useState<PreviewResponseValues>({});

  const handleResponseChange = useCallback(
    (sectionId: string, value: string | number | boolean) => {
      setResponseValues((prev) => ({ ...prev, [sectionId]: value }));
    },
    []
  );

  // ── Save state ───────────────────────────────────────────────────────
  const [updateTenderTemplate, { isLoading: isSaving }] =
    useUpdateTenderTemplateMutation();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const routeState =
    (location.state as {
      fromCreateTender?: boolean;
      activeStep?: number;
      templates?: { id: string; name: string }[];
      tokenContext?: TemplateTokenContext;
    } | null) ?? null;

  const {
    data: previewResponse,
    isLoading,
    isError,
  } = useGetTenderTemplateForPreviewQuery(tempId || "", {
    skip: !tempId,
  });

  // ── Hydrate sections (recursive, N-level deep) ──────────────────────
  const sections = useMemo(
    () => hydrateTenderSections(previewResponse?.data?.sections),
    [previewResponse?.data?.sections]
  );

  // ── Build token context from customTokens + route state ─────────────
  const tokenContext = useMemo<TemplateTokenContext>(() => {
    // Start with defaults
    const ctx: TemplateTokenContext = {
      ...DEFAULT_TEMPLATE_TOKEN_CONTEXT,
      ...(routeState?.tokenContext ?? {}),
    };

    // Overlay custom tokens from the API (e.g. user_name → "John_doe")
    const customTokens = hydrateCustomTokens(
      previewResponse?.data?.customTokens
    );
    for (const ct of customTokens) {
      if (ct.name) ctx[ct.name] = ct.value;
    }

    // Standard meta tokens
    ctx.TEMPLATE_NAME =
      previewResponse?.data?.name ?? ctx.TEMPLATE_NAME;
    ctx.TEMPLATE_ID =
      previewResponse?.data?.tenderTempHeaderId ?? ctx.TEMPLATE_ID;
    ctx.TENDER_ID =
      previewResponse?.data?.tenderHeaderId ?? ctx.TENDER_ID;

    return ctx;
  }, [
    previewResponse?.data?.customTokens,
    previewResponse?.data?.name,
    previewResponse?.data?.tenderHeaderId,
    previewResponse?.data?.tenderTempHeaderId,
    routeState?.tokenContext,
  ]);

  // ── Sort top-level sections by order ────────────────────────────────
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  // ── Save handler ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!previewResponse?.data) return;
    const { tenderTempHeaderId, name, description, typeId, customTokens } =
      previewResponse.data;
    try {
      await updateTenderTemplate({
        templateId: tenderTempHeaderId,
        name,
        description: description || "",
        typeId,
        customTokens: customTokens ?? [],
        sections: serializeSections(sortedSections, responseValues),
      }).unwrap();
      setSnackbar({ open: true, severity: "success", message: "Template saved successfully." });
    } catch {
      setSnackbar({ open: true, severity: "error", message: "Save failed. Please try again." });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {previewResponse?.data?.name || "Template Preview"}
        </Typography>

        {previewResponse?.data?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {previewResponse.data.description}
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* ── Content area ───────────────────────────────────────── */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {isLoading && (
            <Typography>Loading template preview…</Typography>
          )}

          {isError && (
            <Typography color="error">
              Failed to load template preview.
            </Typography>
          )}

          {!isLoading && !isError && sortedSections.length === 0 && (
            <Typography color="text.secondary">
              This template has no sections.
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
              </Paper>
            ))}
        </Box>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            onClick={() => {
              if (routeState?.fromCreateTender) {
                navigate("/tenders/create-tender", {
                  state: {
                    activeStep: routeState.activeStep ?? 1,
                    templates: routeState.templates ?? [],
                    tokenContext: routeState.tokenContext,
                  },
                });
                return;
              }
              navigate(-1);
            }}
          >
            BACK
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || isLoading || isError}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isSaving ? "SAVING…" : "SAVE"}
          </Button>
        </Box>
      </Box>

      {/* ── Toast feedback ──────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PreviewTenderTemplate;
