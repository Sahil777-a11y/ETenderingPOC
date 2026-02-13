import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";

import SectionEditor from "./SectionEditor";
import type { TemplateBuilderSection } from "../../../shared/types";
import { SectionTypeId } from "../../../../constants";

interface Props {
  section: TemplateBuilderSection;
  onChange: (section: TemplateBuilderSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSave: (section: TemplateBuilderSection) => void;
  isFirst: boolean;
  isLast: boolean;
}

function SectionCard({
  section,
  onChange,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  isFirst,
  isLast,
}: Props) {
  const [isEditing, setIsEditing] = useState(true);
  const [localSection, setLocalSection] = useState(section);

  useEffect(() => {
    setLocalSection(section);
  }, [section.id]);

  const getSectionName = () => {
    switch (section.sectionTypeId) {
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

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardHeader
        title={getSectionName()}
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
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* ✅ Delete Button */}
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
          onChange={setLocalSection}
          disabled={!isEditing}
        />
      </CardContent>
    </Card>
  );
}

export default React.memo(SectionCard);