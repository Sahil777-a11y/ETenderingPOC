import noop from "lodash/noop";
import Dialog from "@mui/material/Dialog";
import { Box, styled } from "@mui/material";
import { Typography } from "@mui/material";

export const DialogStatementTypography = styled(Typography)(() => ({
  fontSize: "15px",
  fontWeight: 500,
  paddingBottom: "20px",
}));

interface DialogProps {
  open?: boolean;
  handleClose?: any;
  children?: any;
}
const CommonDialog = ({
  open = false,
  handleClose = noop,
  children,
}: DialogProps) => {
  return (
    <Dialog
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          handleClose();
        }
      }}
      open={open}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "4px",
          border: "1px solid #ccc",
          overflow: "hidden",
        },
      }}
    >
      <Box
        className="table-style"
        sx={{
          padding: "20px",
          borderRadius: "16px",
          "@media(max-height:449px)": {
            maxHeight: "400px",
            overflowY: "scroll"
          }
        }}
      >
        {children}
      </Box>
    </Dialog>
  );
};

export default CommonDialog;
