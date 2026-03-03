import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { useMemo } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { InputField } from "../../shared/ui";
import ReactSelect from "../../shared/ui/ReactSelect";
import { useGetAllTemplateTypesQuery } from "../../../api/Templates";
import type { CustomToken } from "../../shared/types";

interface BasicStepProps {
  data: {
    name: string;
    description: string;
    type: number | "";
  };
  onChange: (field: "name" | "description" | "type", value: string | number) => void;
  customTokens: CustomToken[];
  onCustomTokensChange: (tokens: CustomToken[]) => void;
}

const BasicStep = ({ data, onChange, customTokens, onCustomTokensChange }: BasicStepProps) => {
  const { data: templateTypesResponse, isLoading: isTemplateTypesLoading } =
    useGetAllTemplateTypesQuery();

  const templateTypeOptions = useMemo(
    () =>
      (templateTypesResponse?.data ?? []).map((type) => ({
        label: type.name,
        value: type.id,
      })),
    [templateTypesResponse?.data]
  );

  const addToken = () => {
    onCustomTokensChange([
      ...customTokens,
      { id: crypto.randomUUID(), name: "", value: "" },
    ]);
  };

  const updateToken = (
    tokenId: string,
    field: "name" | "value",
    newValue: string
  ) => {
    onCustomTokensChange(
      customTokens.map((t) =>
        t.id === tokenId ? { ...t, [field]: newValue } : t
      )
    );
  };

  const removeToken = (tokenId: string) => {
    onCustomTokensChange(customTokens.filter((t) => t.id !== tokenId));
  };

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
              onChange("type", value ?? "")
            }
            isClearable
          />
        </Box>

        {/* ===================== CUSTOM TOKENS ===================== */}
        <Divider />
        <Box>
          <Typography fontWeight={600} mb={1}>
            Custom Tokens
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Define dynamic placeholders that can be inserted into any section
            via the &ldquo;Insert Token&rdquo; dropdown.
            Use <code>{"{{TokenName}}"}</code> syntax.
          </Typography>

          <Stack spacing={2}>
            {customTokens.map((token) => (
              <Stack
                key={token.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <InputField
                  placeholder="Token Name (e.g. CustomerName)"
                  value={token.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateToken(token.id, "name", e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <InputField
                  placeholder="Preview Value (e.g. John Doe)"
                  value={token.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateToken(token.id, "value", e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeToken(token.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addToken}
            sx={{ mt: 2 }}
          >
            Add Token
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default BasicStep;