import { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import MainLayout from "../../MainLayout";
import {
  type TenderTemplatePreviewSection,
  useGetTenderTemplateForPreviewQuery,
  useUpdateTenderTemplateMutation,
} from "../../api/Tenders";
import { ResponseTypeId, SectionTypeId } from "../../constants";
import type { TemplateBuilderSection } from "../shared/types";
import BuilderStep from "../templates/createTemplate/builderStep/BuilderStep";
import { showToast } from "../shared/ui";
import {
  mapApiTokensToContext,
  mapApiTokensToOptions,
  type ApiPlaceholderToken,
  type TemplateTokenContext,
} from "../../utils/templateTokens";

const mockApiTokens: ApiPlaceholderToken[] = [
  { key: "ORG_NAME", label: "ORG_NAME", value: "Mohawk" },
  { key: "PROJECT_NAME", label: "PROJECT_NAME", value: "E-Tendering" },
];

const parseSectionProperties = (properties: unknown) => {
  if (!properties) return undefined;

  if (typeof properties === "string") {
    try {
      return JSON.parse(properties);
    } catch {
      return undefined;
    }
  }

  return properties as TemplateBuilderSection["properties"];
};

const mapSectionType = (section: TenderTemplatePreviewSection) => {
  const normalizedSectionId = Number(section.sectionId);

  if (normalizedSectionId === 1 || normalizedSectionId === SectionTypeId.Statement) {
    return SectionTypeId.Statement;
  }

  if (normalizedSectionId === 2 || normalizedSectionId === SectionTypeId.Response) {
    return SectionTypeId.Response;
  }

  if (normalizedSectionId === 3 || normalizedSectionId === SectionTypeId.Acknowledgement) {
    return SectionTypeId.Acknowledgement;
  }

  if (normalizedSectionId === 4 || normalizedSectionId === SectionTypeId.ESignature) {
    return SectionTypeId.ESignature;
  }

  if (typeof section.signature === "string" && section.signature.trim() !== "") {
    return SectionTypeId.ESignature;
  }

  if (
    typeof section.acknowledgementStatement === "string" &&
    section.acknowledgementStatement.trim() !== ""
  ) {
    return SectionTypeId.Acknowledgement;
  }

  const validResponseTypes = [
    ResponseTypeId.Text,
    ResponseTypeId.Numeric,
    ResponseTypeId.List,
  ];

  if (validResponseTypes.includes(Number(section.responseType) as typeof ResponseTypeId[keyof typeof ResponseTypeId])) {
    return SectionTypeId.Response;
  }

  return SectionTypeId.Statement;
};

const mapResponseType = (responseType: number) => {
  const normalizedResponseType = Number(responseType);
  const validResponseTypes = [
    ResponseTypeId.Text,
    ResponseTypeId.Numeric,
    ResponseTypeId.List,
  ];

  return validResponseTypes.includes(normalizedResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId])
    ? (normalizedResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId])
    : undefined;
};

const EditTenderTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tempId } = useParams<{ tempId: string }>();
  const routeState = (location.state as {
    fromCreateTender?: boolean;
    activeStep?: number;
    templates?: { id: string; name: string }[];
    tokenContext?: TemplateTokenContext;
  } | null) ?? null;

  const [sections, setSections] = useState<TemplateBuilderSection[]>([]);
  const [updateTenderTemplate, { isLoading: isUpdatingTemplate }] =
    useUpdateTenderTemplateMutation();

  const {
    data: previewResponse,
    isLoading,
    isError,
  } = useGetTenderTemplateForPreviewQuery(tempId || "", {
    skip: !tempId,
    refetchOnMountOrArgChange: true,
  });

  const existingSectionIds = useMemo(
    () =>
      new Set(
        (previewResponse?.data?.sections ?? [])
          .map((section) => section.tenderTempSectionId)
          .filter(Boolean)
      ),
    [previewResponse?.data?.sections]
  );

  const initialSections = useMemo(() => {
    const templateSections = previewResponse?.data?.sections ?? [];

    return templateSections.map((section: TenderTemplatePreviewSection, index: number) => {
      const sectionTypeId = mapSectionType(section);

      return {
        id: section.tenderTempSectionId || crypto.randomUUID(),
        sectionTypeId,
        order: index + 1,
        title: section.title || "",
        content: section.content || "",
        responseTypeId:
          sectionTypeId === SectionTypeId.Response
            ? mapResponseType(section.responseType)
            : undefined,
        properties: parseSectionProperties(section.properties),
        acknowledgementStatement:
          sectionTypeId === SectionTypeId.Acknowledgement
            ? typeof section.acknowledgementStatement === "string"
              ? section.acknowledgementStatement
              : section.acknowledgementStatement
                ? "I acknowledge"
                : ""
            : "",
        signature: section.signature || "",
      } as TemplateBuilderSection;
    });
  }, [previewResponse?.data?.sections]);

  const builderKey = useMemo(() => {
    const data = previewResponse?.data;
    if (!data) return tempId || "edit-tender-template";

    return [
      data.tenderTempHeaderId,
      data.modifiedDateTime || data.createdDateTime || "",
      (data.sections ?? [])
        .map((section) => `${section.tenderTempSectionId}:${section.modifiedDateTime || section.createdDateTime || ""}`)
        .join("|"),
    ].join("__");
  }, [previewResponse?.data, tempId]);

  const previewTokenContext = useMemo<TemplateTokenContext>(
    () => ({
      ...mapApiTokensToContext(mockApiTokens),
      ...(routeState?.tokenContext ?? {}),
      TEMPLATE_NAME:
        previewResponse?.data?.name || routeState?.tokenContext?.TEMPLATE_NAME,
      TEMPLATE_ID:
        previewResponse?.data?.tenderTempHeaderId ||
        routeState?.tokenContext?.TEMPLATE_ID,
      TENDER_ID:
        previewResponse?.data?.tenderHeaderId || routeState?.tokenContext?.TENDER_ID,
    }),
    [
      previewResponse?.data?.name,
      previewResponse?.data?.tenderHeaderId,
      previewResponse?.data?.tenderTempHeaderId,
      routeState?.tokenContext,
    ]
  );

  const tokenOptions = useMemo(
    () => mapApiTokensToOptions(mockApiTokens),
    []
  );

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const handleUpdate = async () => {
    if (!tempId || !previewResponse?.data) return;

    if (sections.length === 0) {
      showToast({
        message: "Add at least one section before updating template.",
        type: "error",
      });
      return;
    }

    const payload = {
      templateId: previewResponse.data.tenderTempHeaderId || tempId,
      name: previewResponse.data.name || "",
      description: previewResponse.data.description || "",
      typeId: previewResponse.data.typeId || 0,
      sections: [...sections]
        .sort((a, b) => a.order - b.order)
        .map((section, index) => ({
          ...(existingSectionIds.has(section.id) ? { id: section.id } : {}),
          sectionTypeId: section.sectionTypeId,
          sectionOrder: section.order || index + 1,
          title: section.title || "",
          content: section.content || "",
          responseType: section.responseTypeId ?? 0,
          properties: section.properties
            ? JSON.stringify(section.properties)
            : "",
          acknowledgementStatement:
            section.sectionTypeId === SectionTypeId.Acknowledgement
              ? section.acknowledgementStatement || ""
              : "",
          signature: section.signature || "",
        })),
    };

    try {
      const response = await updateTenderTemplate(payload).unwrap();

      if (response?.success === false) {
        showToast({
          message: response?.message || "Failed to update tender template.",
          type: "error",
        });
        return;
      }

      showToast({
        message: response?.message || "Tender template updated successfully.",
        type: "success",
      });

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
    } catch {
      showToast({
        message: "Failed to update tender template.",
        type: "error",
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {previewResponse?.data?.name || "Edit Tender Template"}
        </Typography>

        <Box sx={{ mt: 3, flex: 1, minHeight: 0 }}>
          {isLoading && <Typography>Loading template...</Typography>}
          {isError && <Typography color="error">Failed to load template.</Typography>}
          {!isLoading && !isError && (
            <BuilderStep
              key={builderKey}
              initialSections={initialSections}
              onSectionsChange={setSections}
              tokenContext={previewTokenContext}
              tokenOptions={tokenOptions}
            />
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

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
            disabled={isLoading || isUpdatingTemplate || sections.length === 0}
            onClick={handleUpdate}
          >
            {isUpdatingTemplate ? "UPDATING..." : "UPDATE"}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default EditTenderTemplate;
