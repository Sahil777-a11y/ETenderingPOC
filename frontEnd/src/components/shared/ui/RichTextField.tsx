import { Box, Typography } from "@mui/material";
import RichTextEditor from "./RichTextEditor";
import type { PlaceholderTokenOption } from "../../../utils/templateTokens";

export const RichTextField = ({
  label,
  value,
  onChange,
  disabled,
  tokenOptions,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  tokenOptions?: PlaceholderTokenOption[];
}) => (
  <Box>
    <Typography
      variant="subtitle2"
      sx={{ mb: 0.5 }}
    >
      {label}
    </Typography>

    <Box
      sx={{
        border: disabled ? "1px solid rgba(0, 0, 0, 0.23)" : "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: disabled ? "#f5f5f5" : "#fff",
        "& .ql-toolbar.ql-snow": {
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          borderBottomColor: disabled ? "rgba(0, 0, 0, 0.23)" : undefined,
        },
        "& .ql-container.ql-snow": {
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          borderTopColor: disabled ? "rgba(0, 0, 0, 0.23)" : undefined,
        },
        "& .ql-editor": {
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          color: disabled ? "rgba(0, 0, 0, 0.6)" : "inherit",
        },
      }}
    >
      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        readOnly={disabled}
        tokenOptions={tokenOptions}
      />
    </Box>
  </Box>
);