import { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import MainLayout from "../../MainLayout";
import {
  useGetTenderTemplateForPreviewQuery,
  useUpdateTenderTemplateMutation,
} from "../../api/Tenders";
import { SectionTypeId } from "../../constants";
import type { TemplateBuilderSection, CustomToken } from "../shared/types";
import BuilderStep from "../templates/createTemplate/builderStep/BuilderStep";
import BasicStep from "../templates/createTemplate/BasicStep";
import { showToast } from "../shared/ui";
import {
  PLACEHOLDER_TOKEN_OPTIONS,
  DEFAULT_TEMPLATE_TOKEN_CONTEXT,
  type TemplateTokenContext,
  type PlaceholderTokenOption,
} from "../../utils/templateTokens";
import {
  hydrateTenderSections,
  hydrateCustomTokens,
} from "../../utils/hydrateTemplate";

interface TemplateBasic {
  name: string;
  description: string;
  type: number | "";
}

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

  const [activeStep, setActiveStep] = useState<"basic" | "builder">("basic");
  const [basicData, setBasicData] = useState<TemplateBasic>({
    name: "",
    description: "",
    type: "",
  });
  const [sections, setSections] = useState<TemplateBuilderSection[]>([]);
  const [hasEditingSections, setHasEditingSections] = useState(false);
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);

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

  const templateData = useMemo(
    () => previewResponse?.data,
    [previewResponse?.data]
  );

  // ── Hydrate from API response ────────────────────────────────────────
  useEffect(() => {
    if (!templateData) return;

    // 1. Basic details
    setBasicData({
      name: templateData.name || "",
      description: templateData.description || "",
      type: templateData.typeId ?? "",
    });

    // 2. Custom tokens (recursive-safe)
    setCustomTokens(hydrateCustomTokens(templateData.customTokens));

    // 3. Sections (N-level recursive hydration)
    setSections(hydrateTenderSections(templateData.sections));
  }, [templateData]);

  const handleBasicChange = (
    field: "name" | "description" | "type",
    value: string | number
  ) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  const isBasicValid =
    basicData.name.trim() !== "" &&
    basicData?.type?.toString().trim() !== "";

  // ── Merged token options: built-in + custom ──────────────────────────
  const mergedTokenOptions: PlaceholderTokenOption[] = useMemo(
    () => [
      ...PLACEHOLDER_TOKEN_OPTIONS,
      ...customTokens
        .filter((t) => t.name.trim())
        .map((t) => ({ label: t.name.trim(), value: t.name.trim() })),
    ],
    [customTokens]
  );

  // ── Token context for preview resolution ─────────────────────────────
  const tokenContext: TemplateTokenContext = useMemo(
    () => ({
      ...DEFAULT_TEMPLATE_TOKEN_CONTEXT,
      TEMPLATE_NAME: basicData.name.trim(),
      TEMPLATE_ID: templateData?.tenderTempHeaderId || tempId || undefined,
      TENDER_ID: templateData?.tenderHeaderId || undefined,
      ...Object.fromEntries(
        customTokens
          .filter((t) => t.name.trim())
          .map((t) => [t.name.trim(), t.value.trim()])
      ),
      ...(routeState?.tokenContext ?? {}),
    }),
    [basicData.name, tempId, customTokens, templateData, routeState?.tokenContext]
  );

  // ── Recursive section serializer for API payload ─────────────────────
  const serializeSections = (
    secs: TemplateBuilderSection[]
  ): any[] =>
    [...secs]
      .sort((a, b) => a.order - b.order)
      .map((section, index) => ({
        ...(section.sectionUniqueId
          ? { id: section.sectionUniqueId }
          : {}),
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
        subsections: section.subsections?.length
          ? serializeSections(section.subsections)
          : [],
      }));

  // ── Save handler ─────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!tempId || !templateData) return;

    if (activeStep === "basic") {
      if (!isBasicValid) return;
      setActiveStep("builder");
      return;
    }

    if (sections.length === 0) {
      showToast({
        message: "Add at least one section before updating template.",
        type: "error",
      });
      return;
    }

    if (hasEditingSections) {
      showToast({
        message: "Save all sections before updating template.",
        type: "error",
      });
      return;
    }

    const payload = {
      templateId: templateData.tenderTempHeaderId || tempId,
      name: basicData.name.trim(),
      description: basicData.description.trim(),
      typeId: Number(basicData.type),
      customTokens: customTokens
        .filter((t) => t.name.trim())
        .map((t) => ({ name: t.name.trim(), value: t.value.trim() })),
      sections: serializeSections(sections),
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

  const handleBack = () => {
    if (activeStep === "builder") {
      setActiveStep("basic");
      return;
    }

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
  };

  if (isError) return <div>Failed to load template</div>;

  return (
    <MainLayout>
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {templateData?.name || "Edit Tender Template"}
        </Typography>

        {/* Step Tabs */}
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeStep === "basic" ? "contained" : "outlined"}
            onClick={() => setActiveStep("basic")}
          >
            BASIC DETAILS
          </Button>
          <Button
            variant={activeStep === "builder" ? "contained" : "outlined"}
            disabled={!isBasicValid}
            onClick={() => setActiveStep("builder")}
          >
            FORM BUILDER
          </Button>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, pt: 3 }}>
          {isLoading && <Typography>Loading template...</Typography>}

          {!isLoading && !isError && (
            <>
              {activeStep === "basic" && (
                <BasicStep
                  data={basicData}
                  onChange={handleBasicChange}
                  customTokens={customTokens}
                  onCustomTokensChange={setCustomTokens}
                />
              )}

              {activeStep === "builder" && (
                <BuilderStep
                  initialSections={sections}
                  onSectionsChange={setSections}
                  onEditingStateChange={setHasEditingSections}
                  tokenContext={tokenContext}
                  tokenOptions={mergedTokenOptions}
                />
              )}
            </>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === "basic" && !routeState?.fromCreateTender}
            onClick={handleBack}
          >
            BACK
          </Button>

          <Button
            variant="contained"
            disabled={
              isLoading ||
              isUpdatingTemplate ||
              (activeStep === "basic" && !isBasicValid) ||
              (activeStep === "builder" && hasEditingSections)
            }
            onClick={handleUpdate}
          >
            {activeStep === "builder"
              ? isUpdatingTemplate
                ? "UPDATING..."
                : "UPDATE TEMPLATE"
              : "NEXT"}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default EditTenderTemplate;
