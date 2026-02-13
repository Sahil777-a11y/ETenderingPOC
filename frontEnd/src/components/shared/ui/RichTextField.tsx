import { Box, Typography } from "@mui/material";
import RichTextEditor from "./RichTextEditor";

export const RichTextField = ({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
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
        border: "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        readOnly={disabled}
      />
    </Box>
  </Box>
);