/**
 * ReadOnlyPreviewSection.tsx
 *
 * A clean, document-style renderer for a single TemplateBuilderSection
 * and its recursive subsections.
 *
 * Rules
 *  - NO form-builder UI, chips, badges, or drag-drop
 *  - ALL {{token}} placeholders are resolved before rendering
 *  - When isEditable=false (default): response/ack/signature controls are disabled
 *  - When isEditable=true:  response/ack/signature controls are active; content
 *    text and section structure remain non-editable
 *  - Subsections render recursively to unlimited depth
 *  - All editable state lives in the parent (PreviewTenderTemplate); this
 *    component is purely controlled – no internal mutation state except
 *    the signature canvas ref
 */

import { useEffect, useRef } from "react";
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

import type {
  ListProperties,
  NumericProperties,
  TemplateBuilderSection,
  TextProperties,
} from "../shared/types";
import { ResponseTypeId, SectionTypeId } from "../../constants";
import {
  resolveTemplateTokens,
  type TemplateTokenContext,
} from "../../utils/templateTokens";

// ── Helpers ─────────────────────────────────────────────────────────────

const DEPTH_INDENT = 3; // theme spacing units per nesting level

const depthAccent = (depth: number) => {
  const palette = ["#1976d2", "#9c27b0", "#ed6c02", "#2e7d32", "#d32f2f"];
  return palette[depth % palette.length];
};

// ── Component ───────────────────────────────────────────────────────────

/** Flat map of sectionId → user-entered value, owned by the parent. */
export type PreviewResponseValues = Record<string, string | number | boolean>;

interface Props {
  section: TemplateBuilderSection;
  tokenContext?: TemplateTokenContext;
  /** Nesting depth – 0 = top-level */
  depth?: number;
  /** Human-readable number like "1", "2.3", "2.3.1" */
  sectionNumber?: string;
  /**
   * When true, Response / Acknowledgement / ESignature controls are
   * interactive.  Content text and section structure remain read-only.
   * Defaults to false.
   */
  isEditable?: boolean;
  /** Controlled value map (sectionId → value). */
  responseValues?: PreviewResponseValues;
  /** Notify parent of any value change. */
  onResponseChange?: (sectionId: string, value: string | number | boolean) => void;
}

export default function ReadOnlyPreviewSection({
  section,
  tokenContext,
  depth = 0,
  sectionNumber,
  isEditable = false,
  responseValues,
  onResponseChange,
}: Props) {
  // Signature canvas ref lives here so each section instance owns its canvas.
  const signaturePadRef = useRef<SignatureCanvas | null>(null);

  // ── Hoist savedSig so the rehydration effect can depend on it ──────
  // For non-ESignature sections this is always "", so the effect is a no-op.
  const savedSig =
    section.sectionTypeId === SectionTypeId.ESignature
      ? ((responseValues?.[section.id] as string | undefined) ?? "")
      : "";

  // ── Rehydrate signature canvas whenever savedSig changes ───────────
  // A <canvas> is an imperative DOM node – unlike controlled <input>s it does
  // NOT react to prop changes automatically.  We must call fromDataURL() to
  // paint the saved image back onto the canvas after every mount or after the
  // parent re-seeds responseValues (e.g. browser-back then reopen).
  //
  // fromDataURL() does NOT fire the onEnd event, so it never calls
  // onResponseChange → no state change → no infinite loop.
  useEffect(() => {
    if (section.sectionTypeId !== SectionTypeId.ESignature) return;
    if (!isEditable) return;
    const pad = signaturePadRef.current;
    if (!pad) return;

    if (savedSig && savedSig.startsWith("data:image")) {
      try {
        pad.fromDataURL(savedSig);
      } catch {
        // ignore malformed data URLs
      }
    } else {
      // savedSig was cleared by the user – keep canvas blank
      pad.clear();
    }
  // section.id is stable for the lifetime of this component instance.
  // savedSig is the only value that changes meaningfully.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSig, section.sectionTypeId, isEditable]);
  /** Resolve tokens inside rich-text HTML */
  const resolvedContent = resolveTemplateTokens(
    section.content || "",
    tokenContext
  );

  /** Resolve tokens inside plain-text title */
  const resolvedTitle = resolveTemplateTokens(
    section.title || "",
    tokenContext
  );

  // ── Shared rich-text block ──────────────────────────────────────────
  const contentBlock = resolvedContent ? (
    <Box
      sx={{ fontSize: depth > 0 ? 13 : 14, lineHeight: 1.7, color: "#444" }}
      dangerouslySetInnerHTML={{ __html: resolvedContent }}
    />
  ) : null;

  // ── Title heading ───────────────────────────────────────────────────
  const titleBlock = resolvedTitle ? (
    <Typography
      variant={depth === 0 ? "subtitle1" : "subtitle2"}
      fontWeight={700}
      sx={{ mb: 0.75, color: "#222" }}
    >
      {sectionNumber ? `${sectionNumber}. ` : ""}
      {resolvedTitle}
    </Typography>
  ) : null;

  // ── Section body per type ───────────────────────────────────────────

  const renderBody = () => {
    switch (section.sectionTypeId) {
      /* ---------- STATEMENT ---------- */
      case SectionTypeId.Statement:
        return (
          <>
            {titleBlock}
            {contentBlock}
          </>
        );

      /* ---------- RESPONSE ---------- */
      case SectionTypeId.Response: {
        const currentValue = responseValues?.[section.id] ?? "";

        return (
          <>
            {titleBlock}
            {contentBlock}

            {/* TEXT */}
            {section.responseTypeId === ResponseTypeId.Text && (
              <TextField
                fullWidth
                disabled={!isEditable}
                size={depth > 0 ? "small" : "medium"}
                placeholder="Enter your response"
                required={section.properties?.isRequired}
                value={currentValue}
                onChange={(e) =>
                  onResponseChange?.(section.id, e.target.value)
                }
                inputProps={{
                  maxLength: (section.properties as TextProperties | undefined)
                    ?.maxLength,
                }}
                sx={{ mt: 1 }}
              />
            )}

            {/* NUMERIC */}
            {section.responseTypeId === ResponseTypeId.Numeric && (
              <TextField
                fullWidth
                disabled={!isEditable}
                size={depth > 0 ? "small" : "medium"}
                type="number"
                placeholder="Enter a number"
                required={section.properties?.isRequired}
                value={currentValue}
                onChange={(e) =>
                  onResponseChange?.(section.id, e.target.value)
                }
                inputProps={{
                  min: (section.properties as NumericProperties | undefined)
                    ?.min,
                  max: (section.properties as NumericProperties | undefined)
                    ?.max,
                }}
                sx={{ mt: 1 }}
              />
            )}

            {/* LIST / DROPDOWN */}
            {section.responseTypeId === ResponseTypeId.List && (
              <TextField
                select
                fullWidth
                disabled={!isEditable}
                size={depth > 0 ? "small" : "medium"}
                required={section.properties?.isRequired}
                value={currentValue}
                onChange={(e) =>
                  onResponseChange?.(section.id, e.target.value)
                }
                sx={{ mt: 1 }}
              >
                <MenuItem value="" disabled>
                  Select an option
                </MenuItem>
                {(
                  section.properties as ListProperties | undefined
                )?.options?.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </>
        );
      }

      /* ---------- ACKNOWLEDGEMENT ---------- */
      case SectionTypeId.Acknowledgement:
        return (
          <>
            {titleBlock}
            {contentBlock}
            <FormControlLabel
              disabled={!isEditable}
              control={
                <Checkbox
                  size={depth > 0 ? "small" : "medium"}
                  checked={!!responseValues?.[section.id]}
                  onChange={(e) =>
                    onResponseChange?.(section.id, e.target.checked)
                  }
                />
              }
              label={resolveTemplateTokens(
                section.acknowledgementStatement || "I acknowledge",
                tokenContext
              )}
            />
          </>
        );

      /* ---------- E-SIGNATURE ---------- */
      case SectionTypeId.ESignature: {
        // savedSig is hoisted to component root so the rehydration effect
        // can depend on it.  Read it from there instead of re-computing.
        // (no inner const needed)

        return (
          <>
            {titleBlock}
            {contentBlock}

            {isEditable ? (
              <Box sx={{ mt: 1.5 }}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    backgroundColor: "#fff",
                    "& .sig-canvas": {
                      width: "100% !important",
                      height: depth > 0 ? "100px !important" : "140px !important",
                      display: "block",
                    },
                  }}
                >
                  <SignatureCanvas
                    ref={signaturePadRef}
                    penColor="#000"
                    canvasProps={{ className: "sig-canvas" }}
                    onEnd={() => {
                      if (!signaturePadRef.current) return;
                      onResponseChange?.(
                        section.id,
                        signaturePadRef.current.toDataURL()
                      );
                    }}
                  />
                </Box>
                <Box sx={{ mt: 0.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  {savedSig && (
                    <Typography variant="caption" color="success.main" sx={{ alignSelf: "center" }}>
                      Signed
                    </Typography>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      signaturePadRef.current?.clear();
                      onResponseChange?.(section.id, "");
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "1px dashed #bbb",
                  borderRadius: 1,
                  minHeight: depth > 0 ? 80 : 120,
                  mt: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
                }}
              >
                {section.signature ? (
                  <Box
                    component="img"
                    src={section.signature}
                    alt="Signature"
                    sx={{ maxHeight: 100, objectFit: "contain" }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    Signature area (read-only)
                  </Typography>
                )}
              </Box>
            )}
          </>
        );
      }

      default:
        return (
          <>
            {titleBlock}
            {contentBlock}
          </>
        );
    }
  };

  // ── Recursive subsections ───────────────────────────────────────────

  const subsections = section.subsections ?? [];

  return (
    <Box
      sx={{
        borderLeft: depth > 0 ? `3px solid ${depthAccent(depth)}` : "none",
        pl: depth > 0 ? DEPTH_INDENT : 0,
        mb: depth === 0 ? 3 : 2,
      }}
    >
      {renderBody()}

      {subsections.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {[...subsections]
            .sort((a, b) => a.order - b.order)
            .map((sub, idx) => {
              const subNumber = sectionNumber
                ? `${sectionNumber}.${idx + 1}`
                : `${idx + 1}`;

              return (
                <ReadOnlyPreviewSection
                  key={sub.id}
                  section={sub}
                  tokenContext={tokenContext}
                  depth={depth + 1}
                  sectionNumber={subNumber}
                  isEditable={isEditable}
                  responseValues={responseValues}
                  onResponseChange={onResponseChange}
                />
              );
            })}
        </Box>
      )}
    </Box>
  );
}
