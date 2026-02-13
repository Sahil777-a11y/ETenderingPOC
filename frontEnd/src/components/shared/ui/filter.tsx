import React from "react";
import { Box, FormControl, Typography, TextField, MenuItem, Checkbox } from "@mui/material";
import ReactSelect from "./ReactSelect";

type OptionType = { label: string; value: string | number };

type FilterConfig = {
  name: string;
  label: string;
  options?: OptionType[];
  onInputChange?: (value: string) => void;
  onMenuScrollToBottom?: () => void;
  loading?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  disabled?: boolean;
  onMenuClose?: () => void;
  selectedLabel?: string;
};

interface CommonFilterProps {
  filters: FilterConfig[];
  values: Record<string, string | number | null | (string | number)[]>;
  onChange: (name: string, value: string | number | null | (string | number)[]) => void;
}

const MultiSelectFilter = ({ value, onChange, options, label, disabled }: any) => {
  const selectValue = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <TextField
      select
      variant="outlined"
      size="small"
      fullWidth
      value={selectValue}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        renderValue: (selected: any) => {
          if (selected.length === 0) return <span style={{ color: '#aaa' }}>{label}</span>;
          const selectedLabels = selected.map((val: any) => {
            const found = options.find((opt: any) => String(opt.value) === String(val));
            return found ? found.label : val;
          });
          return selectedLabels.join(", ");
        },
        MenuProps: { PaperProps: { style: { maxHeight: 250, borderRadius: 12 } } }
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "#fff",
          borderRadius: "35px",
          // "& fieldset": { borderColor: "#E0E0E0" },
          "&:hover fieldset": { borderColor: "#BDBDBD" },
          "&.Mui-focused fieldset": { borderColor: "#0080BC", borderWidth: "1px" }
        },
        "& .MuiInputBase-input": { padding: "8.5px 14px", fontSize: "13px" },
      }}
      disabled={disabled}
    >
      {options.map((opt: any) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "13px" }}>
          <Checkbox checked={selectValue.indexOf(opt.value) > -1} size="small" />
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

const CommonFilter: React.FC<CommonFilterProps> = ({
  filters,
  values,
  onChange,
}) => (
  <Box display="flex" gap={2} alignItems="center" sx={{
    "@media (min-width:320px) and (max-width:767px)": { flexDirection: "column", width: "100%" },
    "@media (max-width:1200px)": { display: "flex", flexWrap: "wrap" },
    "@media (min-width:1201px) and (max-width:1420px)": { display: 'flex', flexWrap: "wrap" }
  }}>

    {
      filters.map((filter) => {
        if (!filter.options) return null;

        const selectedValue = values?.[filter.name] ?? (filter.isMulti ? [] : null);

        return (
          <FormControl
            size="small"
            key={filter.name}
            disabled={filter.disabled}
            sx={{
              minWidth: (Array.isArray(values?.status) && filter.name === "status") || filter.isMulti ? 250 : 150,
              "@media (min-width:320px) and (max-width:767px)": {
                width: "100% !important",
              },
            }}
          >
            <Typography sx={{ marginLeft: 1.1, fontSize: "14px", mb: 0.5, color: filter.disabled ? "text.disabled" : "inherit" }}>
              {filter.label}
            </Typography>

            {filter.isMulti ? (
              <MultiSelectFilter
                label={filter.label}
                value={selectedValue}
                options={filter.options}
                onChange={(val: any) => onChange(filter.name, val)}
                disabled={filter.disabled}
              />
            ) : (
              <ReactSelect
                placeholder={filter.label}
                value={selectedValue as string | number | null}
                onChange={(value) => onChange(filter.name, value)}
                options={filter.options}
                onInputChange={filter.onInputChange}
                onMenuScrollToBottom={filter.onMenuScrollToBottom}
                loading={filter.loading}
                isClearable={filter.isClearable ?? true}
                isDisabled={filter.disabled}
                onMenuClose={filter.onMenuClose}
                selectedLabel={filter.selectedLabel}
              />
            )}
          </FormControl>
        );
      })}
  </Box>
);

export default CommonFilter;