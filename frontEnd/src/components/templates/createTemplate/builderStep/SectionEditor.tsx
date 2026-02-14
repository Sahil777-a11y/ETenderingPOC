import { Box, Stack, Button, Checkbox, FormControlLabel } from "@mui/material";
import {
  SectionTypeId,
  ResponseTypeId,
  ResponseTypeOptions,
} from "../../../../constants";

import { InputField } from "../../../shared/ui";
import ReactSelect from "../../../shared/ui/ReactSelect";
import type {
  TemplateBuilderSection,
  TextProperties,
  NumericProperties,
  ListProperties,
} from "../../../shared/types";
import React from "react";
import { RichTextField } from "../../../shared/ui/RichTextField";

interface Props {
  section: TemplateBuilderSection;
  onChange: (section: TemplateBuilderSection) => void;
  disabled?: boolean;
}

function SectionEditor({
  section,
  onChange,
  disabled,
}: Props) {

  const updateField = (field: keyof TemplateBuilderSection, value: any) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  const updateProperties = (updatedProps: any) => {
    onChange({
      ...section,
      properties: updatedProps,
    });
  }

  return (
    <Stack spacing={1}>
      {/* ================= STATEMENT ================= */}
      {section.sectionTypeId === SectionTypeId.Statement && (
        <>
          <InputField
            label="Title"
            value={section.title || ""}
            disabled={disabled}
            onChange={(e: any) =>
              updateField("title", e.target.value)
            }
          />

          <RichTextField
            label="Statement Content"
            value={section.content}
            onChange={(val) => updateField("content", val)}
            disabled={disabled}
          />
        </>
      )}

      {/* ================= RESPONSE ================= */}
      {section.sectionTypeId === SectionTypeId.Response && (
        <>
          <RichTextField
            label="Response Content"
            value={section.content}
            onChange={(val) => updateField("content", val)}
            disabled={disabled}
          />

          <ReactSelect
            label="Response Type"
            options={ResponseTypeOptions}
            value={section.responseTypeId ?? null}
            isDisabled={disabled}
            onChange={(val: any) =>
              updateField("responseTypeId", val)
            }
          />

          {/* Required Checkbox */}
          {section.responseTypeId && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    (section.properties as any)?.isRequired ||
                    false
                  }
                  disabled={disabled}
                  onChange={(e) =>
                    updateProperties({
                      ...section.properties,
                      isRequired: e.target.checked,
                    })
                  }
                />
              }
              label="Required"
            />
          )}

          {/* ==== TEXT TYPE ==== */}
          {section.responseTypeId === ResponseTypeId.Text && (
            <InputField
              label="Max Length"
              type="number"
              value={
                String(
                  (section.properties as TextProperties)?.maxLength ?? ""
                )
              }
              disabled={disabled}
              onChange={(e: any) => {
                const val = e.target.value;
                updateProperties({
                  ...section.properties,
                  maxLength: val === "" ? undefined : Number(val),
                });
              }}
            />
          )}

          {/* ==== NUMERIC TYPE ==== */}
          {section.responseTypeId === ResponseTypeId.Numeric && (
            <>
              <InputField
                label="Min Value"
                type="number"
                value={
                  String(
                    (section.properties as NumericProperties)?.min ?? ""
                  )
                }
                disabled={disabled}
                onChange={(e: any) => {
                  const val = e.target.value;
                  updateProperties({
                    ...section.properties,
                    min: val === "" ? undefined : Number(val),
                  });
                }
                }
              />

              <InputField
                label="Max Value"
                type="number"
                value={
                  String(
                    (section.properties as NumericProperties)?.max ?? ""
                  )
                }
                disabled={disabled}
                onChange={(e: any) => {
                  const val = e.target.value;
                  updateProperties({
                    ...section.properties,
                    max: val === "" ? undefined : Number(val),
                  });
                }
                }
              />
            </>
          )}

          {/* ==== LIST TYPE ==== */}
          {section.responseTypeId === ResponseTypeId.List && (
            <Stack spacing={1}>
              {(section.properties as ListProperties)
                ?.options?.map((opt, index) => (
                  <Box key={index} display="flex" gap={1}>
                    <InputField
                      label={`Option ${index + 1}`}
                      value={opt.name}
                      disabled={disabled}
                      onChange={(e: any) => {
                        const updatedOptions = [
                          ...(section.properties as ListProperties)
                            .options,
                        ];

                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          name: e.target.value,
                        };

                        updateProperties({
                          ...section.properties,
                          options: updatedOptions,
                        });
                      }}
                    />

                    {!disabled && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updatedOptions = (
                            section.properties as ListProperties
                          ).options.filter(
                            (_, i) => i !== index
                          );

                          updateProperties({
                            ...section.properties,
                            options: updatedOptions,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                ))}

              {!disabled && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const existing =
                      (section.properties as ListProperties)
                        ?.options || [];

                    updateProperties({
                      ...section.properties,
                      options: [
                        ...existing,
                        {
                          id: crypto.randomUUID(),
                          name: "",
                        },
                      ],
                    });
                  }}
                >
                  Add Option
                </Button>
              )}
            </Stack>
          )}
        </>
      )}

      {/* ================= ACKNOWLEDGEMENT ================= */}
      {section.sectionTypeId ===
        SectionTypeId.Acknowledgement && (
          <>
            <RichTextField
              label="Acknowledgement Content"
              value={section.content}
              onChange={(val) =>
                updateField("content", val)
              }
              disabled={disabled}
            />

            <InputField
              label="Acknowledgement Statement"
              value={section.acknowledgementStatement || ""}
              disabled={disabled}
              onChange={(e: any) =>
                updateField(
                  "acknowledgementStatement",
                  e.target.value
                )
              }
            />
          </>
        )}

      {/* ================= E-SIGNATURE ================= */}
      {section.sectionTypeId ===
        SectionTypeId.ESignature && (
          <RichTextField
            label="Signature Content"
            value={section.content}
            onChange={(val) =>
              updateField("content", val)
            }
            disabled={disabled}
          />
        )}
    </Stack>
  );
}

export default React.memo(SectionEditor);