import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import BasicStep from "./BasicStep";
import MainLayout from "../../../MainLayout";
import BuilderStep from "./builderStep/BuilderStep";
import { useCreateTemplateMutation } from "../../../api/Templates";
import { showToast } from "../../shared/ui";
import { useNavigate } from "react-router";
import type { TemplateBuilderSection } from "../../shared/types";
import { SectionTypeId } from "../../../constants";

interface TemplateBasic {
  name: string;
  description: string;
  type: number | "";
}

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<"basic" | "builder">(
    "basic"
  );
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateTemplateMutation();

  const [basicData, setBasicData] = useState<TemplateBasic>({
    name: "",
    description: "",
    type: "",
  });
  const [sections, setSections] = useState<TemplateBuilderSection[]>([]);

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

      const payload = {
        // templateId: crypto.randomUUID(),
        name: basicData.name.trim(),
        description: basicData.description.trim(),
        typeId: Number(basicData.type),
        sections: sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => ({
            sectionTypeId: section.sectionTypeId,
            sectionOrder: section.order || index + 1,
            title: section.title || "",
            content: section.content || "",
            responseType: section.responseTypeId ?? 0,
            properties: section.properties
              ? JSON.stringify(section.properties)
              : "",
            acknowledgementStatement:
              section.sectionTypeId === SectionTypeId.Acknowledgement,
            signature: section.signature || "",
          })),
      };

      try {
        const response = await createTemplate(payload).unwrap();

        if (response?.success === false) {
          showToast({
            message: response?.message || "Failed to create template.",
            type: "error",
          });
          return;
        }

        showToast({
          message: response?.message || "Template created successfully.",
          type: "success",
        });
        navigate("/templates");
      } catch {
        showToast({
          message: "Failed to create template.",
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
            <BuilderStep onSectionsChange={setSections} />
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
              (activeStep === "basic" && !isBasicValid)
            }
          >
            {activeStep === "builder"
              ? isCreatingTemplate
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