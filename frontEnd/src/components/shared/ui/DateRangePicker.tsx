import React, { useState } from "react";
import { Box, Button, Popover, Typography } from "@mui/material";
import type { Dayjs } from "dayjs";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CustomDatePicker from "./DatePicker";
import theme from "../../theme";

export interface DateRangePickerProps {
    value: { fromDate: Dayjs | null; toDate: Dayjs | null };
    onChange: (range: { fromDate: Dayjs | null; toDate: Dayjs | null }) => void;
    label?: string;
    buttonSx?: object;
    popoverBoxSx?: object;
    popoverGap?: number;
    minWidth?: string | number;
    padding?: string;
    fontSize?: string | number;
    disableFuture?: boolean;
    disablePast?: boolean
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    onChange,
    label = "Date Range",
    buttonSx = {},
    popoverBoxSx = {},
    popoverGap = 1,
    minWidth = "200px",
    padding = "9px 16px",
    fontSize = "11px",
    disableFuture = true,
    disablePast = false,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tempFromDate, setTempFromDate] = useState<Dayjs | null>(value.fromDate);
    const [tempToDate, setTempToDate] = useState<Dayjs | null>(value.toDate);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setTempFromDate(value.fromDate);
        setTempToDate(value.toDate);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleApply = () => {
        onChange({ fromDate: tempFromDate, toDate: tempToDate });
        handleClose();
    };

    const handleClear = () => {
        setTempFromDate(null);
        setTempToDate(null);
        onChange({ fromDate: null, toDate: null });
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'date-range-popover' : undefined;

    const displayText = value.fromDate && value.toDate
        ? `${value.fromDate.format('MM/DD/YYYY')} - ${value.toDate.format('MM/DD/YYYY')}`
        : 'Select date range';

    return (
        <Box sx={{ position: "relative",   "@media (max-width:767px)":
      {width:"100%"}  }}>
            <Typography sx={{ fontSize: "14px", marginLeft: "15px" }}>{label}</Typography>
            <Button
                aria-describedby={id}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    borderRadius: '25px',
                    textTransform: 'none',
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.grey[400],
                    width: '100%',
                    justifyContent: 'space-between',
                    padding,
                    fontSize,
                    minWidth,
                    ...buttonSx                  
                }}
                endIcon={<CalendarTodayIcon />}
            >
                {displayText}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { p: 2, minWidth: 300 }
                }}
            >
                <Typography variant="subtitle2" gutterBottom sx={{ fontSize: 12 }}>
                    Select Date Range
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: popoverGap, ...popoverBoxSx, mt: 2 }}>
                    <CustomDatePicker
                        label="From Date"
                        value={tempFromDate}
                        onChange={setTempFromDate}
                        disableFuture={disableFuture}
                        disablePast={disablePast}
                        maxDate={tempToDate || undefined}
                    />
                    <CustomDatePicker
                        label="To Date"
                        value={tempToDate}
                        onChange={setTempToDate}
                        disableFuture={disableFuture}
                        disablePast={disablePast}
                        minDate={tempFromDate || undefined}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={handleClear} size="small">
                            Clear
                        </Button>
                        <Button onClick={handleApply} variant="contained" size="small">
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};

export default DateRangePicker;
