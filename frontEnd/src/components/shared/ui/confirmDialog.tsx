import React from "react";
import { Dialog, Box, Typography, Button, CircularProgress } from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    disableSubmit?: boolean
    isLoading?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Yes",
    cancelLabel = "No",
    disableSubmit = false,
    isLoading = false
}) => (
    <Dialog open={open} onClose={onCancel}>
        <Box sx={{ p: 5, width: 500, textAlign: "center" }}>
            <Typography sx={{
                fontFamily: "sans-serif",
                fontWeight: 500,
                fontSize: 24,
                mb: 2,
                whiteSpace: "nowrap",
            }}>{title}</Typography>
            <Typography sx={{ fontSize: 16, mb: 3 }}>{message}</Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        minWidth: 100,
                        fontWeight: 600,
                        borderRadius: "20px",
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    disabled={disableSubmit}
                    variant="contained"
                    onClick={onConfirm}
                    sx={{
                        minWidth: 100,
                        fontWeight: 600,
                        backgroundColor: "#0080BC",
                        borderRadius: "20px",
                        "&:hover": { backgroundColor: "#006494" },
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : confirmLabel}
                </Button>
            </Box>
        </Box>
    </Dialog>
);

export default ConfirmDialog;
