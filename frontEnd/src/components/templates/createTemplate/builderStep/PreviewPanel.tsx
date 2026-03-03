import { Box, Typography, Chip, Stack } from "@mui/material";
import type { TemplateBuilderSection } from "../../../shared/types";
import PreviewSection from "./PreviewSection";
import type { TemplateTokenContext } from "../../../../utils/templateTokens";
import { SectionTypeId } from "../../../../constants";

const SECTION_TYPE_LABELS: Record<number, string> = {
  [SectionTypeId.Statement]: "Statement",
  [SectionTypeId.Response]: "Response",
  [SectionTypeId.Acknowledgement]: "Acknowledgement",
  [SectionTypeId.ESignature]: "E-Signature",
};

const SECTION_TYPE_COLORS: Record<number, string> = {
  [SectionTypeId.Statement]: "#1976d2",
  [SectionTypeId.Response]: "#9c27b0",
  [SectionTypeId.Acknowledgement]: "#ed6c02",
  [SectionTypeId.ESignature]: "#2e7d32",
};

interface Props {
  sections: TemplateBuilderSection[];
  tokenContext?: TemplateTokenContext;
}

export default function PreviewPanel({ sections, tokenContext }: Props) {
  const sortedSections = [...sections].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" mb={2} fontWeight={700}>
        Preview
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {sortedSections.length === 0 && (
          <Typography color="text.secondary">
            No sections added yet.
          </Typography>
        )}

        {sortedSections.map((section, index) => (
          <Box key={section.id} sx={{ mb: 2.5 }}>
            {/* ── Section header badge ──────────────────────── */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.75 }}
            >
              <Chip
                label={`${index + 1}. ${SECTION_TYPE_LABELS[section.sectionTypeId] ?? "Section"}`}
                size="small"
                sx={{
                  backgroundColor:
                    SECTION_TYPE_COLORS[section.sectionTypeId] ?? "#757575",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 11,
                  height: 22,
                }}
              />
              {section.title && (
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  — {section.title}
                </Typography>
              )}
            </Stack>

            <PreviewSection
              section={section}
              tokenContext={tokenContext}
              sectionNumber={`${index + 1}`}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}