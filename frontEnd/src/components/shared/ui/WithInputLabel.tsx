import { InputLabel, styled, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface WithInputLabelProps {
  children: ReactNode;
  label?: string;
  required?: boolean;
  endIcon?: ReactNode;
  error?: string;
  disabled?: boolean;
}

const HHInputLabel = styled(InputLabel)(({ theme }) => ({
  textAlign: "left",
  ...theme.typography.subtitle2,
  lineHeight: "24px",
  color: theme.palette.text.secondary,
  display: "flex",
  "& .MuiFormLabel-asterisk": {
    color: "#aa2b2b",
  },
}));

const WithInputLabel = ({
  children,
  label = undefined,
  required = false,
  endIcon,
  error = "",
}: WithInputLabelProps) => {
  return (
    <>
      {label ? (
        <>
          <HHInputLabel
            required={required}
            shrink={false}
            error={Boolean(error)}
          >
            <Typography variant="body1" color="text.label">
              {label}
            </Typography>
            {endIcon}
          </HHInputLabel>
          {children}
        </>
      ) : (
        children
      )}
    </>
  );
};

export default WithInputLabel;