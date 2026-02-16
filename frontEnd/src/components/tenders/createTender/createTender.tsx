import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import MainLayout from "../../../MainLayout";
import { showToast } from "../../shared/ui";
import { useGetAllTemplateTypesQuery } from "../../../api/Templates";
import { useCreateTenderMutation } from "../../../api/Tenders";
import { useNavigate } from "react-router";
import TenderDetailsStep from "./TenderDetailsStep";
import TenderTemplatesStep from "./TenderTemplatesStep";

interface TenderBasicForm {
  name: string;
  typeId: number | "";
  startDate: string;
  endDate: string;
}

interface TemplateRow {
  id: string;
  name: string;
}

const CreateTender = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<TenderBasicForm>({
    name: "",
    typeId: "",
    startDate: "",
    endDate: "",
  });
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const steps = ["Tender Details", "Templates"];

  const { data: templateTypesResponse, isLoading: isTypesLoading } =
    useGetAllTemplateTypesQuery();
  const [createTender, { isLoading: isCreatingTender }] = useCreateTenderMutation();

  const typeOptions = useMemo(
    () =>
      (templateTypesResponse?.data ?? []).map((type) => ({
        label: type.name,
        value: type.id,
      })),
    [templateTypesResponse?.data]
  );

  const isBasicValid =
    formData.name.trim() !== "" &&
    formData.typeId !== "" &&
    formData.startDate !== "" &&
    formData.endDate !== "";

  const isDateRangeValid =
    formData.startDate !== "" &&
    formData.endDate !== "" &&
    new Date(formData.startDate) <= new Date(formData.endDate);

  const handleChange = (
    field: keyof TenderBasicForm,
    value: string | number | ""
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    if (activeStep === 1) return;

    if (!isBasicValid) {
      showToast({
        message: "Please fill all required fields.",
        type: "error",
      });
      return;
    }

    if (!isDateRangeValid) {
      showToast({
        message: "End date must be on or after start date.",
        type: "error",
      });
      return;
    }

    try {
      const response = await createTender({
        name: formData.name.trim(),
        typeId: Number(formData.typeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      }).unwrap();

      if (response?.success === false) {
        showToast({
          message: response?.message || "Failed to create tender.",
          type: "error",
        });
        return;
      }

      const mappedTemplates = (response?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
      }));

      setTemplates(mappedTemplates);
      setActiveStep(1);
      // showToast({
      //   message: response?.message || "Tender created successfully.",
      //   type: "success",
      // });
    } catch {
      showToast({
        message: "Failed to create tender.",
        type: "error",
      });
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
      return;
    }

    navigate("/tenders");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4 }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box style={{ flex: 1, paddingTop: 24 }}>
          {activeStep === 0 && (
            <TenderDetailsStep
              formData={formData}
              typeOptions={typeOptions}
              isTypesLoading={isTypesLoading}
              onChange={handleChange}
            />
          )}

          {activeStep === 1 && (
            <TenderTemplatesStep
              templates={templates}
              onTemplateDeleted={(templateId) =>
                setTemplates((prev) => prev.filter((item) => item.id !== templateId))
              }
            />
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between">
          <Button onClick={handleBack} disabled={activeStep === 1}>
            {activeStep === 0 ? "CANCEL" : "BACK"}
          </Button>

          {activeStep === 0 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isCreatingTender || !isBasicValid}
            >
              {isCreatingTender ? "CREATING..." : "NEXT"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate("/tenders")}
            >
              DONE
            </Button>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateTender;