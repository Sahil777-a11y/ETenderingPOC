import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import BasicStep from "./BasicStep";
import MainLayout from "../../../MainLayout";
import BuilderStep from "./builderStep/BuilderStep";
import {
  useCreateTemplateMutation,
  useGetTemplateByTemplateIdQuery,
  useUpdateTemplateMutation,
} from "../../../api/Templates";
import { showToast } from "../../shared/ui";
import { useNavigate, useParams } from "react-router";
import type { TemplateBuilderSection } from "../../shared/types";
import {
  ResponseTypeId,
  SectionTypeId,
} from "../../../constants";
import type { TemplateTokenContext } from "../../../utils/templateTokens";

interface TemplateBasic {
  name: string;
  description: string;
  type: number | "";
}

const CreateTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<"basic" | "builder">(
    "basic"
  );
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdatingTemplate }] = useUpdateTemplateMutation();
  const {
    data: templateByIdResponse,
    isError: isTemplateError,
  } = useGetTemplateByTemplateIdQuery(id || "", {
    skip: !id,
  });

  const [basicData, setBasicData] = useState<TemplateBasic>({
    name: "",
    description: "",
    type: "",
  });
  const [sections, setSections] = useState<TemplateBuilderSection[]>([]);
  const [hasEditingSections, setHasEditingSections] = useState(false);

  const templateToEdit = useMemo(
    () => templateByIdResponse?.data,
    [templateByIdResponse?.data]
  );

  useEffect(() => {
    if (!isEditMode || !templateToEdit) return;

    setBasicData({
      name: templateToEdit.templateName || "",
      description: templateToEdit.description || "",
      type: templateToEdit.typeId ?? "",
    });

    const mappedSections: TemplateBuilderSection[] = (templateToEdit.sections ?? []).map((section, index) => {
      const sectionTypeFromApi = Number(section.sectionId) as
        | typeof SectionTypeId[keyof typeof SectionTypeId]
        | 0;
      const isValidSectionType = Object.values(SectionTypeId).includes(
        sectionTypeFromApi as typeof SectionTypeId[keyof typeof SectionTypeId]
      );

      const sectionResponseType = Number(section.responseType) as
        | typeof ResponseTypeId[keyof typeof ResponseTypeId]
        | 0;

      const parsedProperties = (() => {
        if (!section.properties) return undefined;

        if (typeof section.properties === "string") {
          try {
            return JSON.parse(section.properties);
          } catch {
            return undefined;
          }
        }

        return section.properties;
      })();

      const isResponseTypeValue = [
        ResponseTypeId.Text,
        ResponseTypeId.Numeric,
        ResponseTypeId.List,
      ].includes(sectionResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId]);

      const inferredSectionType = isResponseTypeValue
        ? SectionTypeId.Response
        : SectionTypeId.Statement;
      const mappedSectionType = isValidSectionType
        ? (sectionTypeFromApi as typeof SectionTypeId[keyof typeof SectionTypeId])
        : inferredSectionType;

      const mappedResponseType =
        mappedSectionType === SectionTypeId.Response && isResponseTypeValue
          ? (sectionResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId])
          : undefined;

      const mappedAcknowledgementStatement =
        mappedSectionType === SectionTypeId.Acknowledgement
          ? typeof section.acknowledgementStatement === "string"
            ? section.acknowledgementStatement
            : section.acknowledgementStatement
              ? "I acknowledge"
              : ""
          : "";

      return {
        id: section.sectionUniqueId || crypto.randomUUID(),
        sectionUniqueId: section.sectionUniqueId || undefined,
        sectionTypeId: mappedSectionType,
        order: section.sectionOrder || index + 1,
        title: section.title || "",
        content: section.content || "",
        responseTypeId: mappedResponseType,
        properties: parsedProperties,
        acknowledgementStatement: mappedAcknowledgementStatement,
        signature: "",
      };
    });

    setSections(mappedSections);
  }, [isEditMode, templateToEdit]);

  const handleBasicChange = (
    field: "name" | "description" | "type",
    value: string | number
  ) => {
    setBasicData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isBasicValid =
    basicData.name.trim() !== "" &&
    basicData?.type?.toString().trim() !== "";

  const tokenContext: TemplateTokenContext = useMemo(
    () => ({
      TEMPLATE_NAME: basicData.name.trim(),
      TEMPLATE_ID: id || undefined,
    }),
    [basicData.name, id]
  );

  const handleNext = async () => {
    if (activeStep === "basic") {
      if (!isBasicValid) return;
      setActiveStep("builder");
      return;
    }

    if (activeStep === "builder") {
      if (sections.length === 0) {
        showToast({
          message: "Add at least one section before saving template.",
          type: "error",
        });
        return;
      }

      if (hasEditingSections) {
        showToast({
          message: "Save all sections before saving template.",
          type: "error",
        });
        return;
      }

      const payload = {
        ...(isEditMode && id ? { templateId: id } : {}),
        name: basicData.name.trim(),
        description: basicData.description.trim(),
        typeId: Number(basicData.type),
        sections: sections
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
          })),
      };

      try {
        const response = isEditMode
          ? await updateTemplate(payload).unwrap()
          : await createTemplate(payload).unwrap();

        if (response?.success === false) {
          showToast({
            message:
              response?.message ||
              (isEditMode
                ? "Failed to update template."
                : "Failed to create template."),
            type: "error",
          });
          return;
        }

        showToast({
          message:
            response?.message ||
            (isEditMode
              ? "Template updated successfully."
              : "Template created successfully."),
          type: "success",
        });
        navigate("/templates");
      } catch {
        showToast({
          message: isEditMode
            ? "Failed to update template."
            : "Failed to create template.",
          type: "error",
        });
      }
    }
  };

  const handleBack = () => {
    if (activeStep === "builder") {
      setActiveStep("basic");
    }
  };

  // if (isEditMode && isTemplateLoading) return <div>Loading template...</div>;
  if (isEditMode && isTemplateError) return <div>Failed to load template</div>;

  return (
    <MainLayout>
      <Box sx={{ p: 4 }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Step Tabs */}
        <Stack direction="row" spacing={2}>
          <Button
            variant={
              activeStep === "basic"
                ? "contained"
                : "outlined"
            }
            onClick={() => setActiveStep("basic")}
          >
            BASIC DETAILS
          </Button>

          <Button
            variant={
              activeStep === "builder"
                ? "contained"
                : "outlined"
            }
            disabled={!isBasicValid}
            onClick={() => setActiveStep("builder")}
          >
            FORM BUILDER
          </Button>
        </Stack>

        {/* Divider after tabs */}
        {/* <Divider sx={{ my: 3 }} /> */}

        <Box style={{ flex: 1, paddingTop: 24 }}>

          {/* Step Content */}
          {activeStep === "basic" && (
            <BasicStep
              data={basicData}
              onChange={handleBasicChange}
            />
          )}

          {activeStep === "builder" && (
            <BuilderStep
              initialSections={sections}
              onSectionsChange={setSections}
              onEditingStateChange={setHasEditingSections}
              tokenContext={tokenContext}
            />
          )}
        </Box>

        {/* Divider before buttons */}
        <Divider sx={{ my: 4 }} />

        {/* Navigation Buttons */}
        <Box
          display="flex"
          justifyContent="space-between"
        >
          <Button
            disabled={activeStep === "basic"}
            onClick={handleBack}
          >
            BACK
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              isCreatingTemplate ||
              isUpdatingTemplate ||
              (activeStep === "basic" && !isBasicValid) ||
              (activeStep === "builder" && hasEditingSections)
            }
          >
            {activeStep === "builder"
              ? isCreatingTemplate || isUpdatingTemplate
                ? "SAVING..."
                : "SAVE TEMPLATE"
              : "NEXT"}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateTemplate;