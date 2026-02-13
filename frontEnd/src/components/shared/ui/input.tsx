import { Box, InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import React from "react";

type InputFieldProps = {
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean,
  minRows?: number,
  maxRows?: number,
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  slotProps?: TextFieldProps["slotProps"] &
  Omit<TextFieldProps, "variant" | "label">;
};

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  placeholder,
  name,
  value,
  type,
  onChange,
  error = false,
  helperText,
  startIcon,
  endIcon,
  multiline,
  minRows,
  maxRows,
  required = false,
  disabled = false,
  readOnly = false,
  slotProps = {},
  ...rest
}, ref) => {
  return (
    <Box sx={{ display: "flex", alignSelf: "flex-end", "@media (min-width:320px) and (max-width:767px)": { width:"100% !important"} }}>
      {label && (
        <label style={{
          fontSize: 14,
          fontWeight: 500,
          color: error ? "#d32f2f" : "rgba(0, 0, 0, 0.87)",
          marginBottom: 0,
          marginLeft: 10,
        }}>
          {label}
          {required && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}

        </label>
      )}
      <TextField
        fullWidth
        placeholder={placeholder}
        inputRef={ref}
        name={name}
        type={type}
        value={value}
        className="req-label"
        onChange={onChange}
        error={error}
        helperText={helperText}
        variant="outlined"
        multiline={multiline}
        minRows={minRows}
        maxRows={maxRows}
        disabled={disabled}
        slotProps={{
          inputLabel: { shrink: true },
          ...slotProps,
        }}
        InputProps={{
          readOnly,
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : undefined,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 5.5,
            backgroundColor: disabled ? "#f0f0f0" : "#ffffff",
            cursor: disabled ? "not-allowed" : readOnly ? "default" : "text",
          },
          "& .MuiInputBase-input": {
            borderRadius: 5.5,
            fontSize: 14,
            padding:"10px 20px 10px 10px",
            
          },
          "& .MuiFormLabel-root": {
            fontSize: "1.1rem",
          },
        }}
        {...rest}
      />
    </Box>
  );
});