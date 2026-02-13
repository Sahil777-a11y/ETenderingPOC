import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import type { TemplateBuilderSection } from "../../../shared/types";
import { SectionTypeId, ResponseTypeId } from "../../../../constants";

interface Props {
  section: TemplateBuilderSection;
}

export default function PreviewSection({ section }: Props) {
  const renderContent = (html?: string) => (
    <Box
      sx={{ mb: 2 }}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: "#fff",
      }}
    >
      {/* ================= STATEMENT ================= */}
      {section.sectionTypeId === SectionTypeId.Statement && (
        <>
          {section.title && (
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              {section.title}
            </Typography>
          )}

          {renderContent(section.content)}
        </>
      )}

      {/* ================= RESPONSE ================= */}
      {section.sectionTypeId === SectionTypeId.Response && (
        <>
          {renderContent(section.content)}

          {/* TEXT */}
          {section.responseTypeId === ResponseTypeId.Text && (
            <TextField
              fullWidth
              placeholder="Enter response"
              required={section.properties?.isRequired}
              inputProps={{
                maxLength:
                  (section.properties as any)?.maxLength,
              }}
            />
          )}

          {/* NUMERIC */}
          {section.responseTypeId === ResponseTypeId.Numeric && (
            <TextField
              fullWidth
              type="number"
              required={section.properties?.isRequired}
              inputProps={{
                min: (section.properties as any)?.min,
                max: (section.properties as any)?.max,
              }}
            />
          )}

          {/* LIST */}
          {section.responseTypeId === ResponseTypeId.List && (
            <TextField
              select
              fullWidth
              required={section.properties?.isRequired}
            >
              {(section.properties as any)?.options?.map(
                (opt: any) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                )
              )}
            </TextField>
          )}
        </>
      )}

      {/* ================= ACKNOWLEDGEMENT ================= */}
      {section.sectionTypeId === SectionTypeId.Acknowledgement && (
        <>
          {renderContent(section.content)}

          <FormControlLabel
            control={<Checkbox />}
            label={section.acknowledgementStatement}
          />
        </>
      )}

      {/* ================= E-SIGNATURE ================= */}
      {section.sectionTypeId === SectionTypeId.ESignature && (
        <>
          {renderContent(section.content)}

          <Box
            sx={{
              border: "1px dashed #999",
              height: 80,
              borderRadius: 1,
              mt: 2,
            }}
          />
        </>
      )}
    </Box>
  );
}