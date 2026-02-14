import { useEffect, useState } from "react";
import { Box, Grid, Stack, Button } from "@mui/material";

import SectionCard from "./SectionCard";
import PreviewPanel from "./PreviewPanel";
import { ResponseTypeId, SectionTypeId } from "../../../../constants";
import type { TemplateBuilderSection, TextProperties } from "../../../shared/types";

const uuid = () => crypto.randomUUID();

interface BuilderStepProps {
  initialSections?: TemplateBuilderSection[];
  onSectionsChange: (sections: TemplateBuilderSection[]) => void;
}

export default function BuilderStep({ initialSections = [], onSectionsChange }: BuilderStepProps) {
  //editable draft
  const [sections, setSections] = useState<TemplateBuilderSection[]>(initialSections);

  //saved version
  const [previewSections, setPreviewSections] = useState<TemplateBuilderSection[]>(initialSections);

  const createSection = (
    type: typeof SectionTypeId[keyof typeof SectionTypeId]
  ): TemplateBuilderSection => {
    const base: TemplateBuilderSection = {
      id: uuid(),
      sectionTypeId: type,
      order: sections.length + 1,
      title: "",
      content: "",
    };

    switch (type) {
      case SectionTypeId.Response: {
        const defaultProps: TextProperties = {
          isRequired: false,
          maxLength: 100,
        };

        return {
          ...base,
          responseTypeId: ResponseTypeId.Text,
          properties: defaultProps,
        };
      }

      case SectionTypeId.Acknowledgement:
        return {
          ...base,
          acknowledgementStatement: "",
        };

      case SectionTypeId.ESignature:
        return {
          ...base,
          signature: "",
        };

      default:
        return base;
    }
  };

  const addSection = (type: typeof SectionTypeId[keyof typeof SectionTypeId]) => {
    const newSection = createSection(type);
    setSections((prev) => [...prev, newSection]);
  };

  const handleSectionChange = (updatedSection: TemplateBuilderSection) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === updatedSection.id ? updatedSection : s
      )
    );
  };


  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // swap
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // update order field if you use one
    const reordered = newSections.map((s, i) => ({
      ...s,
      order: i + 1,
    }));

    setSections(reordered);
    setPreviewSections(reordered);
  };

  useEffect(() => {
    onSectionsChange(sections);
  }, [onSectionsChange, sections]);

  useEffect(() => {
    if (initialSections.length > 0 && sections.length === 0) {
      setSections(initialSections);
      setPreviewSections(initialSections);
    }
  }, [initialSections, sections.length]);

  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: '#fff',
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* LEFT SIDE - BUILDER */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Buttons */}
            <Stack direction="row" spacing={1} flexWrap="nowrap" mb={2}>
              <Button variant="outlined" size="small" sx={{ minWidth: 90, fontSize: 13, py: 0.5 }} onClick={() => addSection(SectionTypeId.Statement)}>Statement</Button>
              <Button variant="outlined" size="small" sx={{ minWidth: 90, fontSize: 13, py: 0.5 }} onClick={() => addSection(SectionTypeId.Response)}>Response</Button>
              <Button variant="outlined" size="small" sx={{ minWidth: 90, fontSize: 13, py: 0.5 }} onClick={() => addSection(SectionTypeId.Acknowledgement)}>Ack</Button>
              <Button variant="outlined" size="small" sx={{ minWidth: 90, fontSize: 13, py: 0.5 }} onClick={() => addSection(SectionTypeId.ESignature)}>E-Sign</Button>
            </Stack>
            {/* Scrollable Sections */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                maxHeight: 'calc(80vh - 120px)', // adjust for header/buttons/footer
                overflowY: 'auto',
                pr: 1,
                border: '1px solid #eee',
                borderRadius: 1,
                background: '#fafbfc',
              }}
            >
              {sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onChange={handleSectionChange}
                  onMoveUp={() => moveSection(index, 'up')}
                  onMoveDown={() => moveSection(index, 'down')}
                  onDelete={() => {
                    const updatedDraft = sections.filter((s) => s.id !== section.id).map((s, i) => ({ ...s, order: i + 1 }));
                    const updatedPreview = previewSections.filter((s) => s.id !== section.id).map((s, i) => ({ ...s, order: i + 1 }));
                    setSections(updatedDraft);
                    setPreviewSections(updatedPreview);
                  }}
                  onSave={(savedSection) => {
                    setPreviewSections(prev => {
                      const exists = prev.find(p => p.id === savedSection.id);
                      if (exists) {
                        return prev.map(p => p.id === savedSection.id ? savedSection : p);
                      }
                      return [...prev, savedSection];
                    });
                  }}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                />
              ))}
            </Box>
          </Box>
        </Grid>
        {/* RIGHT SIDE - PREVIEW */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, paddingTop: 6 }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              maxHeight: 'calc(80vh - 120px)',
              overflowY: 'auto',
              pl: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              p: 2,
              border: '1px solid #eee',
            }}
          >
            <PreviewPanel sections={previewSections} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}