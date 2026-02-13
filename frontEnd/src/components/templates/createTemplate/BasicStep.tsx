import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { InputField } from "../../shared/ui";
import ReactSelect from "../../shared/ui/ReactSelect";
import { useGetAllTemplateTypesQuery } from "../../../api/Templates";

interface BasicStepProps {
  data: {
    name: string;
    description: string;
    type: string;
  };
  onChange: (field: string, value: any) => void;
}

const BasicStep = ({ data, onChange }: BasicStepProps) => {
  const { data: templateTypesResponse, isLoading: isTemplateTypesLoading } =
    useGetAllTemplateTypesQuery();

  const templateTypeOptions = useMemo(
    () =>
      (templateTypesResponse?.data ?? []).map((type) => ({
        label: type.name,
        value: type.name,
      })),
    [templateTypesResponse?.data]
  );

  return (
    <Box maxWidth={600}>
      <Stack spacing={4}>
        {/* Template Name */}
        <Box>
          <Typography fontWeight={600} mb={1}>
            Template Name{" "}
            <span style={{ color: "red" }}>*</span>
          </Typography>
          <InputField
            placeholder="Enter Template Name"
            value={data.name}
            onChange={(e: any) =>
              onChange("name", e.target.value)
            }
          />
        </Box>

        {/* Template Description */}
        <Box>
          <Typography fontWeight={600} mb={1}>
            Template Description
          </Typography>
          <InputField
            placeholder="Enter Template Description"
            value={data.description}
            multiline
            minRows={2}
            onChange={(e: any) =>
              onChange("description", e.target.value)
            }
          />
        </Box>

        {/* Template Type */}
        <Box>
          <Typography fontWeight={600} mb={1}>
            Template Type{" "}
            <span style={{ color: "red" }}>*</span>
          </Typography>
          <ReactSelect
            options={templateTypeOptions}
            value={data.type || null}
            placeholder="Select Template Type"
            loading={isTemplateTypesLoading}
            onChange={(value: string | number | null) =>
              onChange("type", value || "")
            }
            isClearable
          />
        </Box>
        <br />
        <br />
      </Stack>
    </Box>
  );
};

export default BasicStep;