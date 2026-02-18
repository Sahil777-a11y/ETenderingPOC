import { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import MainLayout from "../../MainLayout";
import { ResponseTypeId, SectionTypeId } from "../../constants";
import {
  type VendorResponseTemplatePayload,
  useGetVendorResponseByTenderTemplateHeaderIdQuery,
  useUpsertVendorResponseDetailsMutation,
} from "../../api/Tenders";
import VendorFormSection, { type VendorFormSectionModel } from "./vendorForm/VendorFormSection";
import { showToast } from "../shared/ui";
import type { TemplateTokenContext } from "../../utils/templateTokens";

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const parseVendorTemplateResponse = (rawResponse: unknown): VendorResponseTemplatePayload | null => {
  if (!rawResponse) return null;

  let parsed: unknown = rawResponse;

  if (typeof parsed === "string") {
    parsed = tryParseJson(parsed);
  }

  if (typeof parsed === "string") {
    parsed = tryParseJson(parsed);
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const parsedObject = parsed as Partial<VendorResponseTemplatePayload> & {
    Sections?: VendorResponseTemplatePayload["sections"];
    TenderTempHeaderId?: string;
    TenderHeaderId?: string;
    Name?: string;
    Description?: string;
    TypeId?: number;
    IsDeleted?: boolean;
    CreatedDateTime?: string;
    ModifiedDateTime?: string | null;
  };

  const sourceSections = Array.isArray(parsedObject.sections)
    ? parsedObject.sections
    : Array.isArray(parsedObject.Sections)
      ? parsedObject.Sections
      : [];

  const normalizedSections = sourceSections.map((section) => {
    const sectionObj = section as Partial<(typeof sourceSections)[number]> & {
      TenderTempSectionId?: string;
      TenderTemplateHeader?: string;
      SectionId?: number;
      Title?: string;
      Content?: string;
      ResponseType?: number;
      Properties?: string;
      AcknowledgementStatement?: string;
      Signature?: string;
      Response?: string | number | boolean | null;
      SectionOrder?: number;
      CreatedDateTime?: string;
      ModifiedDateTime?: string | null;
    };

    return {
      ...sectionObj,
      tenderTempSectionId:
        sectionObj.tenderTempSectionId ||
        sectionObj.TenderTempSectionId ||
        "",
      tenderTemplateHeader:
        sectionObj.tenderTemplateHeader ||
        sectionObj.TenderTemplateHeader ||
        "",
      sectionId: Number(sectionObj.sectionId ?? sectionObj.SectionId ?? 0),
      title: sectionObj.title ?? sectionObj.Title ?? "",
      content: sectionObj.content ?? sectionObj.Content ?? "",
      responseType: Number(sectionObj.responseType ?? sectionObj.ResponseType ?? 0),
      properties: sectionObj.properties ?? sectionObj.Properties ?? "",
      acknowledgementStatement:
        sectionObj.acknowledgementStatement ??
        sectionObj.AcknowledgementStatement ??
        "",
      signature: sectionObj.signature ?? sectionObj.Signature ?? "",
      response: sectionObj.response ?? sectionObj.Response ?? "",
      sectionOrder: Number(sectionObj.sectionOrder ?? sectionObj.SectionOrder ?? 0),
      createdDateTime:
        sectionObj.createdDateTime ||
        sectionObj.CreatedDateTime ||
        "",
      modifiedDateTime:
        sectionObj.modifiedDateTime ??
        sectionObj.ModifiedDateTime ??
        null,
    };
  });

  return {
    tenderTempHeaderId:
      parsedObject.tenderTempHeaderId ||
      parsedObject.TenderTempHeaderId ||
      "",
    tenderHeaderId:
      parsedObject.tenderHeaderId ||
      parsedObject.TenderHeaderId ||
      "",
    name: parsedObject.name || parsedObject.Name || "",
    description: parsedObject.description || parsedObject.Description || "",
    typeId: Number(parsedObject.typeId ?? parsedObject.TypeId ?? 0),
    isDeleted: Boolean(parsedObject.isDeleted ?? parsedObject.IsDeleted),
    createdDateTime:
      parsedObject.createdDateTime ||
      parsedObject.CreatedDateTime ||
      "",
    modifiedDateTime:
      parsedObject.modifiedDateTime ??
      parsedObject.ModifiedDateTime ??
      null,
    sections: normalizedSections,
  };
};

const parseSectionProperties = (properties?: string) => {
  if (!properties) return undefined;

  try {
    return JSON.parse(properties) as {
      isRequired?: boolean;
      min?: number;
      max?: number;
      maxLength?: number;
    };
  } catch {
    return undefined;
  }
};

const normalizeSectionType = (sectionId?: number) => {
  const normalized = Number(sectionId);

  if (normalized === 1 || normalized === SectionTypeId.Statement) return SectionTypeId.Statement;
  if (normalized === 2 || normalized === SectionTypeId.Response) return SectionTypeId.Response;
  if (normalized === 3 || normalized === SectionTypeId.Acknowledgement) return SectionTypeId.Acknowledgement;
  if (normalized === 4 || normalized === SectionTypeId.ESignature) return SectionTypeId.ESignature;

  return normalized;
};

const VendorForm = () => {
  const navigate = useNavigate();
  const { tempId } = useParams<{ tempId: string }>();
  const [sections, setSections] = useState<VendorFormSectionModel[]>([]);
  const [sectionValidationErrors, setSectionValidationErrors] = useState<Record<string, string>>({});
  const [upsertVendorResponseDetails, { isLoading: isSaving }] =
    useUpsertVendorResponseDetailsMutation();

  const { data, isLoading, isError, refetch } = useGetVendorResponseByTenderTemplateHeaderIdQuery(tempId || "", {
    skip: !tempId,
    refetchOnMountOrArgChange: true,
  });

  const vendorResponse = data?.data;
  const parsedTemplate = useMemo(() => {
    const fromResponse = parseVendorTemplateResponse(vendorResponse?.response);
    if (fromResponse) return fromResponse;

    return parseVendorTemplateResponse(vendorResponse);
  }, [vendorResponse]);

  const tokenContext = useMemo<TemplateTokenContext>(
    () => ({
      ORG_NAME: "Mohawk",
      PROJECT_NAME: "E-Tendering",
      TEMPLATE_NAME: parsedTemplate?.name,
      TEMPLATE_ID: parsedTemplate?.tenderTempHeaderId,
      TENDER_ID: parsedTemplate?.tenderHeaderId,
    }),
    [
      parsedTemplate?.name,
      parsedTemplate?.tenderHeaderId,
      parsedTemplate?.tenderTempHeaderId,
    ]
  );

  useEffect(() => {
    const mappedSections = [...(parsedTemplate?.sections ?? [])]
      .sort((a, b) => (a.sectionOrder ?? Number.MAX_SAFE_INTEGER) - (b.sectionOrder ?? Number.MAX_SAFE_INTEGER))
      .map((section) => ({
        tenderTempSectionId: section.tenderTempSectionId,
        sectionId: Number(section.sectionId),
        title: section.title || "",
        content: section.content || "",
        responseType: Number(section.responseType || 0),
        properties: section.properties || "",
        acknowledgementStatement: section.acknowledgementStatement || "",
        response: section.response ?? "",
        sectionOrder: section.sectionOrder,
      }));

    setSections(mappedSections);
  }, [parsedTemplate?.sections]);

  const handleResponseChange = (sectionId: string, value: string | number | boolean) => {
    if (sectionValidationErrors[sectionId]) {
      setSectionValidationErrors((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    }

    setSections((prev) =>
      prev.map((section) =>
        section.tenderTempSectionId === sectionId
          ? { ...section, response: value }
          : section
      )
    );
  };

  const hasExistingDraft = Boolean(
    (vendorResponse?.resposneId && vendorResponse.resposneId !== "00000000-0000-0000-0000-000000000000") ||
    (vendorResponse?.responseId && vendorResponse.responseId !== "00000000-0000-0000-0000-000000000000")
  );

  const buildUpdatedResponsePayload = () => {
    if (!parsedTemplate) return null;

    const mergedSections = (parsedTemplate.sections ?? []).map((originalSection) => {
      const updatedSection = sections.find(
        (section) => section.tenderTempSectionId === originalSection.tenderTempSectionId
      );

      if (!updatedSection) return originalSection;

      return {
        ...originalSection,
        response: updatedSection.response ?? "",
      };
    });

    return {
      ...parsedTemplate,
      sections: mergedSections,
    };
  };

  const validateSections = () => {
    const validationErrors: Record<string, string> = {};

    sections.forEach((section) => {
      const sectionTypeId = normalizeSectionType(section.sectionId);
      if (sectionTypeId !== SectionTypeId.Response) return;

      const properties = parseSectionProperties(section.properties);
      const isRequired = Boolean(properties?.isRequired);

      if (section.responseType === ResponseTypeId.Text) {
        const textValue = String(section.response ?? "");

        if (isRequired && textValue.trim() === "") {
          validationErrors[section.tenderTempSectionId] = "This field is required.";
          return;
        }

        if (
          typeof properties?.maxLength === "number" &&
          textValue.length > properties.maxLength
        ) {
          validationErrors[section.tenderTempSectionId] =
            `Maximum length is ${properties.maxLength} characters.`;
        }

        return;
      }

      if (section.responseType === ResponseTypeId.Numeric) {
        const rawValue = section.response;
        const hasValue = !(
          rawValue === "" ||
          rawValue === null ||
          rawValue === undefined ||
          (typeof rawValue === "string" && rawValue.trim() === "")
        );

        if (isRequired && !hasValue) {
          validationErrors[section.tenderTempSectionId] = "This field is required.";
          return;
        }

        if (!hasValue) return;

        const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);

        if (Number.isNaN(numericValue)) {
          validationErrors[section.tenderTempSectionId] = "Enter a valid number.";
          return;
        }

        if (typeof properties?.min === "number" && numericValue < properties.min) {
          validationErrors[section.tenderTempSectionId] = `Minimum value is ${properties.min}.`;
          return;
        }

        if (typeof properties?.max === "number" && numericValue > properties.max) {
          validationErrors[section.tenderTempSectionId] = `Maximum value is ${properties.max}.`;
        }

        return;
      }

      if (section.responseType === ResponseTypeId.List) {
        const value = String(section.response ?? "").trim();

        if (isRequired && value === "") {
          validationErrors[section.tenderTempSectionId] = "Please select an option.";
        }
      }
    });

    setSectionValidationErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleUpsert = async (isCompleted: boolean) => {
    if (!tempId) {
      showToast({ message: "Template id is missing.", type: "error" });
      return;
    }

    const updatedTemplatePayload = buildUpdatedResponsePayload();

    if (!updatedTemplatePayload) {
      showToast({ message: "Unable to build vendor response payload.", type: "error" });
      return;
    }

    if (isCompleted) {
      const isValid = validateSections();
      if (!isValid) {
        showToast({
          message: "Please fix validation errors before saving.",
          type: "error",
        });
        return;
      }
    } else {
      setSectionValidationErrors({});
    }

    try {
      const response = await upsertVendorResponseDetails({
        tenderTemplarteHeaderId: tempId,
        response: JSON.stringify(updatedTemplatePayload),
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
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {parsedTemplate?.name || "Vendor Form"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {parsedTemplate?.description || "Fill the sections below and save your response."}
        </Typography>

        {!tempId && <Typography color="error" sx={{ mt: 2 }}>Template id is missing.</Typography>}
        {isLoading && <Typography sx={{ mt: 2 }}>Loading vendor form...</Typography>}
        {isError && <Typography color="error" sx={{ mt: 2 }}>Failed to load vendor form.</Typography>}

        {!isLoading && !isError && (
          <>
            <Box sx={{ mt: 2 }}>
              {sections.length === 0 && (
                <Typography color="text.secondary">No sections found for this template.</Typography>
              )}

              {sections.map((section) => (
                <VendorFormSection
                  key={section.tenderTempSectionId}
                  section={section}
                  onResponseChange={handleResponseChange}
                  validationError={sectionValidationErrors[section.tenderTempSectionId]}
                  tokenContext={tokenContext}
                />
              ))}
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Button onClick={() => navigate(-1)}>Back</Button>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              disabled={isLoading || isError || isSaving || sections.length === 0}
              onClick={() => handleUpsert(false)}
            >
              Draft
            </Button>

            <Button
              variant="contained"
              disabled={isLoading || isError || isSaving || sections.length === 0}
              onClick={() => handleUpsert(true)}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default VendorForm;
