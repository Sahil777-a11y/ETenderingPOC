import { Box, Typography } from "@mui/material";
import type { TemplateBuilderSection } from "../../../shared/types";
import PreviewSection from "./PreviewSection";
import type { TemplateTokenContext } from "../../../../utils/templateTokens";

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
      <Typography variant="h6" mb={2}>
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

        {sortedSections.map((section) => (
          <PreviewSection
            key={section.id}
            section={section}
            tokenContext={tokenContext}
          />
        ))}
      </Box>
    </Box>
  );
}