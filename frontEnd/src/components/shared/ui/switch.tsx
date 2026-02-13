import { styled, Switch } from "@mui/material";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 36,
  height: 20,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 14,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(16px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 3,
    "&.Mui-checked": {
      transform: "translateX(14px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#1890ff",
        ...theme.applyStyles("dark", {
          backgroundColor: "#177ddc",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 4px 8px 0 rgb(0 35 11 / 25%)",
    width: 14,
    height: 14,
    borderRadius: 10,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ...theme.applyStyles("dark", {
      backgroundColor: "rgba(255,255,255,.35)",
    }),
  },
}));

export default CustomSwitch