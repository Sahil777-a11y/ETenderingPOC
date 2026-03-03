import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  Button,
  FormControlLabel,
  Chip,
  Stack,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

import type {
  ListProperties,
  NumericProperties,
  TemplateBuilderSection,
  TextProperties,
} from "../../../shared/types";
import { SectionTypeId, ResponseTypeId } from "../../../../constants";
import {
  resolveTemplateTokens,
  type TemplateTokenContext,
} from "../../../../utils/templateTokens";

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
  section: TemplateBuilderSection;
  tokenContext?: TemplateTokenContext;
  /** Nesting depth for visual indentation (0 = top level) */
  depth?: number;
  /** Section number string like "1", "1.2", "1.2.3" */
  sectionNumber?: string;
}

export default function PreviewSection({
  section,
  tokenContext,
  depth = 0,
  sectionNumber,
}: Props) {
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (section.sectionTypeId !== SectionTypeId.ESignature) return;
    if (!section.signature || !signaturePadRef.current) return;

    try {
      if (signaturePadRef.current.isEmpty()) {
        signaturePadRef.current.fromDataURL(section.signature);
        setIsSigned(true);
      }
    } catch {
      setIsSigned(false);
    }
  }, [section.sectionTypeId, section.signature]);

  const renderContent = (html?: string) => (
    <Box
      sx={{ mb: 1.5, fontSize: depth > 0 ? 13 : 14, lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: resolveTemplateTokens(html || "", tokenContext) }}
    />
  );

  // Visual depth styling
  const depthColors = ["#1976d2", "#9c27b0", "#ed6c02", "#2e7d32", "#d32f2f"];
  const accentColor = depthColors[depth % depthColors.length];
  const bgShade = depth === 0 ? "#fff" : depth === 1 ? "#fafbfe" : "#f7f7fb";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: depth === 0 ? "#e0e0e0" : "#eee",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: depth === 0 ? 2 : 1.5,
        p: depth === 0 ? 2.5 : 2,
        mb: depth === 0 ? 0 : 1.5,
        ml: depth > 0 ? 1.5 : 0,
        backgroundColor: bgShade,
        transition: "box-shadow 0.15s",
        "&:hover": {
          boxShadow: depth === 0 ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
        },
      }}
    >
      {/* ================= STATEMENT ================= */}
      {section.sectionTypeId === SectionTypeId.Statement && (
        <>
          {section.title && (
            <Typography
              variant={depth === 0 ? "subtitle1" : "subtitle2"}
              fontWeight={700}
              mb={1}
              sx={{ color: "#333" }}
            >
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
              size={depth > 0 ? "small" : "medium"}
              placeholder="Enter response"
              required={section.properties?.isRequired}
              inputProps={{
                maxLength:
                  (section.properties as TextProperties | undefined)?.maxLength,
              }}
            />
          )}

          {/* NUMERIC */}
          {section.responseTypeId === ResponseTypeId.Numeric && (
            <TextField
              fullWidth
              size={depth > 0 ? "small" : "medium"}
              type="number"
              required={section.properties?.isRequired}
              inputProps={{
                min: (section.properties as NumericProperties | undefined)?.min,
                max: (section.properties as NumericProperties | undefined)?.max,
              }}
            />
          )}

          {/* LIST */}
          {section.responseTypeId === ResponseTypeId.List && (
            <TextField
              select
              fullWidth
              size={depth > 0 ? "small" : "medium"}
              required={section.properties?.isRequired}
            >
              {(section.properties as ListProperties | undefined)?.options?.map(
                (opt: { id: string; name: string }) => (
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
            control={<Checkbox size={depth > 0 ? "small" : "medium"} />}
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
              minHeight: depth > 0 ? 120 : 160,
              borderRadius: 1,
              mt: 2,
              backgroundColor: "#fafafa",
              p: 1,
              "& .signature-canvas": {
                width: "100% !important",
                height: depth > 0 ? "100px !important" : "140px !important",
                backgroundColor: "#fff",
              },
            }}
          >
            <SignatureCanvas
              ref={signaturePadRef}
              penColor="#000"
              onEnd={() =>
                setIsSigned(
                  signaturePadRef.current
                    ? !signaturePadRef.current.isEmpty()
                    : false
                )
              }
              canvasProps={{
                className: "signature-canvas",
              }}
            />
          </Box>

          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="outlined"
              disabled={!isSigned}
              onClick={() => {
                signaturePadRef.current?.clear();
                setIsSigned(false);
              }}
            >
              Clear
            </Button>
          </Box>
        </>
      )}

      {/* ================= RECURSIVE SUBSECTIONS ================= */}
      {section.subsections && section.subsections.length > 0 && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #eee" }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: 10,
            }}
          >
            Subsections
          </Typography>

          {[...section.subsections]
            .sort((a, b) => a.order - b.order)
            .map((sub, idx) => {
              const subNumber = sectionNumber
                ? `${sectionNumber}.${idx + 1}`
                : `${idx + 1}`;

              return (
                <Box key={sub.id}>
                  {/* Subsection header chip */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mb: 0.5 }}
                  >
                    <Chip
                      label={`${subNumber} ${SECTION_TYPE_LABELS[sub.sectionTypeId] ?? ""}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor:
                          SECTION_TYPE_COLORS[sub.sectionTypeId] ?? "#757575",
                        color:
                          SECTION_TYPE_COLORS[sub.sectionTypeId] ?? "#757575",
                        fontWeight: 600,
                        fontSize: 10,
                        height: 20,
                      }}
                    />
                    {sub.title && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        — {sub.title}
                      </Typography>
                    )}
                  </Stack>

                  <PreviewSection
                    section={sub}
                    tokenContext={tokenContext}
                    depth={depth + 1}
                    sectionNumber={subNumber}
                  />
                </Box>
              );
            })}
        </Box>
      )}
    </Box>
  );
}