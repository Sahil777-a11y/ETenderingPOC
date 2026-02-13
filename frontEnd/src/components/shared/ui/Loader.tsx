import { Backdrop, CircularProgress } from "@mui/material";
import theme from "../../theme";

const Loader = () => {
  return (
    <Backdrop
      sx={{
        color: theme.palette.primary.main,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: "blur(6px)",
      }}
      open={true}
    >
      <CircularProgress color="inherit" size={64} thickness={4} />
    </Backdrop>
  );
};

export default Loader;