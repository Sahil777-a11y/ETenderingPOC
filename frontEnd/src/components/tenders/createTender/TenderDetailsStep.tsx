import { Box, Grid, Typography } from "@mui/material";
import { InputField } from "../../shared/ui";
import ReactSelect from "../../shared/ui/ReactSelect";

interface TenderDetailsStepProps {
  formData: {
    name: string;
    typeId: number | "";
    startDate: string;
    endDate: string;
  };
  typeOptions: Array<{ label: string; value: number }>;
  isTypesLoading: boolean;
  onChange: (
    field: "name" | "typeId" | "startDate" | "endDate",
    value: string | number | ""
  ) => void;
}

const TenderDetailsStep = ({
  formData,
  typeOptions,
  isTypesLoading,
  onChange,
}: TenderDetailsStepProps) => {
  return (
    <Box maxWidth={700}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} mb={1}>
            Tender Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <InputField
            placeholder="Enter Tender Name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange("name", e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} mb={1}>
            Tender Type <span style={{ color: "red" }}>*</span>
          </Typography>
          <ReactSelect
            options={typeOptions}
            value={formData.typeId || null}
            placeholder="Select Tender Type"
            loading={isTypesLoading}
            isClearable
            onChange={(value) => onChange("typeId", value ?? "")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography fontWeight={600} mb={1}>
            Start Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <InputField
            type="date"
            value={formData.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange("startDate", e.target.value)
            }
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography fontWeight={600} mb={1}>
            End Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <InputField
            type="date"
            value={formData.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange("endDate", e.target.value)
            }
            inputProps={{
              min: formData.startDate || new Date().toISOString().split("T")[0],
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenderDetailsStep;
