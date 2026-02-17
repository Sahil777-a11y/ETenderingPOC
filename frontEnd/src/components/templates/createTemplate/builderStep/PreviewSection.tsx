import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  Button,
  FormControlLabel,
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

interface Props {
  section: TemplateBuilderSection;
}

export default function PreviewSection({ section }: Props) {
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
                  (section.properties as TextProperties | undefined)?.maxLength,
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
              minHeight: 160,
              borderRadius: 1,
              mt: 2,
              backgroundColor: "#fafafa",
              p: 1,
              "& .signature-canvas": {
                width: "100% !important",
                height: "140px !important",
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
    </Box>
  );
}