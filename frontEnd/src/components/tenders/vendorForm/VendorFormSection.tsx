import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { ResponseTypeId, SectionTypeId } from "../../../constants";

export interface VendorFormSectionModel {
  tenderTempSectionId: string;
  sectionId: number;
  title?: string;
  content?: string;
  responseType?: number;
  properties?: string;
  acknowledgementStatement?: string;
  response?: string | number | boolean | null;
  sectionOrder?: number;
}

type ListOption = { id: string; name: string };

interface Props {
  section: VendorFormSectionModel;
  onResponseChange: (sectionId: string, value: string | number | boolean) => void;
  validationError?: string;
}

const parseProperties = (properties?: string) => {
  if (!properties) return undefined;

  try {
    return JSON.parse(properties) as {
      isRequired?: boolean;
      maxLength?: number;
      min?: number;
      max?: number;
      options?: ListOption[];
    };
  } catch {
    return undefined;
  }
};

const normalizeSectionType = (sectionId?: number) => {
  const normalized = Number(sectionId);

  if (normalized === 1 || normalized === SectionTypeId.Statement) {
    return SectionTypeId.Statement;
  }

  if (normalized === 2 || normalized === SectionTypeId.Response) {
    return SectionTypeId.Response;
  }

  if (normalized === 3 || normalized === SectionTypeId.Acknowledgement) {
    return SectionTypeId.Acknowledgement;
  }

  if (normalized === 4 || normalized === SectionTypeId.ESignature) {
    return SectionTypeId.ESignature;
  }

  return normalized;
};

const VendorFormSection = ({ section, onResponseChange, validationError }: Props) => {
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const sectionTypeId = useMemo(
    () => normalizeSectionType(section.sectionId),
    [section.sectionId]
  );

  const parsedProperties = useMemo(() => parseProperties(section.properties), [section.properties]);

  useEffect(() => {
    if (sectionTypeId !== SectionTypeId.ESignature) return;

    const currentResponse = typeof section.response === "string" ? section.response : "";
    if (!currentResponse || !signaturePadRef.current || !currentResponse.startsWith("data:image")) return;

    try {
      if (signaturePadRef.current.isEmpty()) {
        signaturePadRef.current.fromDataURL(currentResponse);
        setIsSigned(true);
      }
    } catch {
      setIsSigned(false);
    }
  }, [sectionTypeId, section.response]);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: "#fff",
      }}
    >
      {!!section.title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {section.title}
        </Typography>
      )}

      {!!section.content && (
        <Box sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: section.content }} />
      )}

      {sectionTypeId === SectionTypeId.Response && section.responseType === ResponseTypeId.Text && (
        <TextField
          fullWidth
          placeholder="Enter response"
          value={String(section.response ?? "")}
          required={Boolean(parsedProperties?.isRequired)}
          inputProps={{ maxLength: parsedProperties?.maxLength }}
          error={Boolean(validationError)}
          helperText={validationError || " "}
          onChange={(event) => onResponseChange(section.tenderTempSectionId, event.target.value)}
        />
      )}

      {sectionTypeId === SectionTypeId.Response && section.responseType === ResponseTypeId.Numeric && (
        <TextField
          fullWidth
          type="number"
          value={String(section.response ?? "")}
          required={Boolean(parsedProperties?.isRequired)}
          inputProps={{ min: parsedProperties?.min, max: parsedProperties?.max }}
          error={Boolean(validationError)}
          helperText={validationError || " "}
          onChange={(event) => {
            const value = event.target.value;
            onResponseChange(
              section.tenderTempSectionId,
              value === "" ? "" : Number(value)
            );
          }}
        />
      )}

      {sectionTypeId === SectionTypeId.Response && section.responseType === ResponseTypeId.List && (
        <TextField
          select
          fullWidth
          value={String(section.response ?? "")}
          required={Boolean(parsedProperties?.isRequired)}
          error={Boolean(validationError)}
          helperText={validationError || " "}
          onChange={(event) => onResponseChange(section.tenderTempSectionId, event.target.value)}
        >
          {(parsedProperties?.options ?? []).map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {sectionTypeId === SectionTypeId.Acknowledgement && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(section.response === true || section.response === "true")}
                onChange={(event) => onResponseChange(section.tenderTempSectionId, event.target.checked)}
              />
            }
            label={section.acknowledgementStatement || "I acknowledge"}
          />
          {validationError && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: -0.5 }}>
              {validationError}
            </Typography>
          )}
        </>
      )}

      {sectionTypeId === SectionTypeId.ESignature && (
        <>
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
              onEnd={() => {
                const signature = signaturePadRef.current?.toDataURL("image/png") || "";
                if (signature) {
                  onResponseChange(section.tenderTempSectionId, signature);
                  setIsSigned(true);
                }
              }}
              canvasProps={{ className: "signature-canvas" }}
            />
          </Box>

          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="outlined"
              disabled={!isSigned}
              onClick={() => {
                signaturePadRef.current?.clear();
                onResponseChange(section.tenderTempSectionId, "");
                setIsSigned(false);
              }}
            >
              Clear
            </Button>
          </Box>

          {validationError && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
              {validationError}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default VendorFormSection;
