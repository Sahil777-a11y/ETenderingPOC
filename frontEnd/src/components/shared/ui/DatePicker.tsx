import React from 'react';
import type { TextFieldProps } from '@mui/material/TextField';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';

interface CustomDatePickerProps {
  label?: string;
  value?: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  textFieldProps?: TextFieldProps;
  disableFuture?: boolean;
  disablePast?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  props?: DatePickerProps
}

// Custom TextField component with rounded borders
const CustomTextField = React.forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => (
  <TextField
    {...props}
    ref={ref}
    fullWidth
    size="small"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '25px !important',
        '& fieldset': {
          borderRadius: '25px !important',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderRadius: '25px !important',
          borderWidth: '1px',
        },
        '&.Mui-focused fieldset': {
          borderRadius: '25px !important',
          borderWidth: '2px',
        },
        '& .MuiInputBase-input': {
          borderRadius: '25px !important',
        },
      },
      '& .MuiInputLabel-root': {
        borderRadius: '25px !important',
      },
    }}
  />
));

CustomTextField.displayName = 'CustomTextField';

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label = 'Select date',
  value,
  onChange,
  textFieldProps,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
  props
}) => {
  return (
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      disableFuture={disableFuture}
      disablePast={disablePast}
      minDate={minDate}
      maxDate={maxDate}
      enableAccessibleFieldDOMStructure={false}
      slots={{
        textField: CustomTextField,
      }}
      slotProps={{
        textField: {
          ...textFieldProps,
        },
      }}
      {...props}
    />
  );
};

export default CustomDatePicker;