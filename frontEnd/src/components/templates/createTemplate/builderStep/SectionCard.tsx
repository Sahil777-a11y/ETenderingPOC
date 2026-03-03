import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  Box,
  Typography,
  Button,
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import SectionEditor from "./SectionEditor";
import type { TemplateBuilderSection } from "../../../shared/types";
import { SectionTypeId, ResponseTypeId } from "../../../../constants";
import type { PlaceholderTokenOption } from "../../../../utils/templateTokens";
import type { TextProperties } from "../../../shared/types";

/** Maximum nesting depth for subsections */
const MAX_SUBSECTION_DEPTH = 5;

interface Props {
  section: TemplateBuilderSection;
  tokenOptions?: PlaceholderTokenOption[];
  onChange: (section: TemplateBuilderSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSave: (section: TemplateBuilderSection) => void;
  defaultEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  /** Nesting depth — 0 = top-level section */
  depth?: number;
}

function SectionCard({
  section,
  tokenOptions,
  onChange,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  defaultEditing = true,
  onEditingChange,
  isFirst,
  isLast,
  depth = 0,
}: Props) {
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [localSection, setLocalSection] = useState(section);

  // Sync localSection when parent pushes new section data (e.g. subsection changes bubbling up)
  useEffect(() => {
    setLocalSection(section);
  }, [section]);

  // Only reset editing state when the card identity changes
  useEffect(() => {
    setIsEditing(defaultEditing);
  }, [defaultEditing, section.id]);

  const getSectionName = (typeId: typeof SectionTypeId[keyof typeof SectionTypeId]) => {
    switch (typeId) {
      case SectionTypeId.Statement:
        return "Statement";
      case SectionTypeId.Response:
        return "Response";
      case SectionTypeId.Acknowledgement:
        return "Acknowledgement";
      case SectionTypeId.ESignature:
        return "E-Signature";
      default:
        return "";
    }
  };

  // ── Subsection helpers ──────────────────────────────────────────────

  const createSubsection = (
    type: typeof SectionTypeId[keyof typeof SectionTypeId]
  ): TemplateBuilderSection => {
    const base: TemplateBuilderSection = {
      id: crypto.randomUUID(),
      sectionTypeId: type,
      order: (localSection.subsections?.length ?? 0) + 1,
      title: "",
      content: "",
    };

    switch (type) {
      case SectionTypeId.Response: {
        const defaultProps: TextProperties = {
          isRequired: false,
          maxLength: 100,
        };
        return { ...base, responseTypeId: ResponseTypeId.Text, properties: defaultProps };
      }
      case SectionTypeId.Acknowledgement:
        return { ...base, acknowledgementStatement: "" };
      case SectionTypeId.ESignature:
        return { ...base, signature: "" };
      default:
        return base;
    }
  };

  const addSubsection = (type: typeof SectionTypeId[keyof typeof SectionTypeId]) => {
    const newSub = createSubsection(type);
    const updated = {
      ...localSection,
      subsections: [...(localSection.subsections ?? []), newSub],
    };
    setLocalSection(updated);
    onChange(updated);
  };

  const handleSubsectionChange = (updatedSub: TemplateBuilderSection) => {
    const updatedSubs = (localSection.subsections ?? []).map((s) =>
      s.id === updatedSub.id ? updatedSub : s
    );
    const updated = { ...localSection, subsections: updatedSubs };
    setLocalSection(updated);
    onChange(updated);
  };

  const handleSubsectionDelete = (subId: string) => {
    const updatedSubs = (localSection.subsections ?? [])
      .filter((s) => s.id !== subId)
      .map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...localSection, subsections: updatedSubs };
    setLocalSection(updated);
    onChange(updated);
  };

  const moveSubsection = (index: number, direction: "up" | "down") => {
    const subs = [...(localSection.subsections ?? [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subs.length) return;
    [subs[index], subs[targetIndex]] = [subs[targetIndex], subs[index]];
    const reordered = subs.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...localSection, subsections: reordered };
    setLocalSection(updated);
    onChange(updated);
  };

  // ── Accent colour per depth ─────────────────────────────────────────
  const depthColors = ["#1976d2", "#9c27b0", "#ed6c02", "#2e7d32", "#d32f2f"];
  const accentColor = depthColors[depth % depthColors.length];

  return (
    <Card
      variant="outlined"
      sx={{
        m: depth > 0 ? 1 : 2,
        borderLeft: depth > 0 ? `3px solid ${accentColor}` : undefined,
      }}
    >
      <CardHeader
        title={
          <Typography variant={depth > 0 ? "body2" : "body1"} fontWeight={600}>
            {depth > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: accentColor, mr: 0.5 }}
              >
                L{depth} •{" "}
              </Typography>
            )}
            {getSectionName(section.sectionTypeId)}
          </Typography>
        }
        action={
          <Stack direction="row" spacing={0}>
            {!isFirst && (
              <Tooltip title="Move Up">
                <IconButton size="small" onClick={onMoveUp}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!isLast && (
              <Tooltip title="Move Down">
                <IconButton size="small" onClick={onMoveDown}>
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {isEditing ? (
              <Tooltip title="Save">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    setIsEditing(false);
                    onChange(localSection);
                    onSave(localSection);
                    onEditingChange?.(false);
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsEditing(true);
                    onEditingChange?.(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Delete Button */}
            <Tooltip title="Delete Section">
              <IconButton
                size="small"
                color="error"
                onClick={onDelete}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      <CardContent>
        <SectionEditor
          section={localSection}
          tokenOptions={tokenOptions}
          onChange={(updatedSection) => {
            setLocalSection(updatedSection);
            onChange(updatedSection);
          }}
          disabled={!isEditing}
        />

        {/* ================= SUBSECTIONS ================= */}
        {(localSection.subsections?.length ?? 0) > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Subsections
            </Typography>

            {[...(localSection.subsections ?? [])]
              .sort((a, b) => a.order - b.order)
              .map((sub, idx) => (
                <SectionCard
                  key={sub.id}
                  section={sub}
                  tokenOptions={tokenOptions}
                  defaultEditing={isEditing}
                  onChange={handleSubsectionChange}
                  onMoveUp={() => moveSubsection(idx, "up")}
                  onMoveDown={() => moveSubsection(idx, "down")}
                  onDelete={() => handleSubsectionDelete(sub.id)}
                  onSave={(savedSub) => handleSubsectionChange(savedSub)}
                  isFirst={idx === 0}
                  isLast={idx === (localSection.subsections?.length ?? 0) - 1}
                  depth={depth + 1}
                />
              ))}
          </Box>
        )}

        {/* ================= ADD SUBSECTION BUTTONS ================= */}
        {isEditing && depth < MAX_SUBSECTION_DEPTH && (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px dashed #ddd" }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Add Subsection:
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
              <Button
                size="small"
                variant="text"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, textTransform: "none" }}
                onClick={() => addSubsection(SectionTypeId.Statement)}
              >
                Statement
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, textTransform: "none" }}
                onClick={() => addSubsection(SectionTypeId.Response)}
              >
                Response
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, textTransform: "none" }}
                onClick={() => addSubsection(SectionTypeId.Acknowledgement)}
              >
                Ack
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, textTransform: "none" }}
                onClick={() => addSubsection(SectionTypeId.ESignature)}
              >
                E-Sign
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default React.memo(SectionCard);