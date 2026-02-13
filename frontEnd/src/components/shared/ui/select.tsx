import React from 'react';
import {
  Box,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

type Option = {
  label: string;
  value: string | number;
};

type SelectFieldProps = {
  label?: string;
  value?: string | number;
  onChange?: (event: SelectChangeEvent) => void;
  options?: Option[]; // optional to allow default []
  placeholder?: string;
  name?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options = [], // default to empty array to avoid crash
  placeholder,
  name,
  fullWidth = true,
  error = false,
  helperText,
  disabled = false,
}) => {
  return (
    <Box>
      <FormControl fullWidth={fullWidth} error={error} disabled={disabled} size="small">
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          size="small"
          sx={{
            borderRadius: 8,
            backgroundColor: disabled ? '#f0f0f0' : '#ffffff',
            pointerEvents: disabled ? 'none' : 'auto',
            '& .MuiSelect-select': {
              cursor: disabled ? 'not-allowed' : 'pointer',
            },
          }}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={onChange}
          label={label}
          name={name}
        >
          {placeholder && (
            <MenuItem value="">
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {(options || []).map((option) => (
            <MenuItem
              key={option?.value ?? option?.label }
              value={option?.value ?? ''}
            >
              {option?.label ?? ''}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default SelectField;
