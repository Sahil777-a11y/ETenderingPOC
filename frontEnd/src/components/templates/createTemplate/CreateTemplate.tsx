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

interface TemplateBasic {
  name: string;
  description: string;
  type: string;
}

const CreateTemplate = () => {
  const [activeStep, setActiveStep] = useState<"basic" | "builder">(
    "basic"
  );

  const [basicData, setBasicData] = useState<TemplateBasic>({
    name: "",
    description: "",
    type: "",
  });

  const handleBasicChange = (field: string, value: any) => {
    setBasicData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isBasicValid =
    basicData.name.trim() !== "" &&
    basicData.type.trim() !== "";

  const handleNext = () => {
    if (activeStep === "basic") {
      if (!isBasicValid) return;
      setActiveStep("builder");
      return;
    }

    if (activeStep === "builder") {
      console.log("Final Payload:", basicData);
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
            <BuilderStep />
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
              activeStep === "basic" && !isBasicValid
            }
          >
            {activeStep === "builder"
              ? "SAVE TEMPLATE"
              : "NEXT"}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateTemplate;