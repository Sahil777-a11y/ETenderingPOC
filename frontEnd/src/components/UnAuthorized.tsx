import { Stack, Typography, Box } from '@mui/material';
import Unauthorized from "../assets/Unauthorized.png";

const UnauthorizedPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
        px: 2,
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Box
          component="img"
          src={Unauthorized}
          alt="Unauthorized"
          sx={{
            maxWidth: "400px",
            width: "100%",
            height: "auto",
          }}
        />

        <Typography
          sx={{
            fontSize: 14,
            letterSpacing: "0.08em",
            color: "#565872",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          You don't have permission to access this resource. This page is restricted or you may not have the necessary credentials.
        </Typography>

        {/* <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{
            px: 4,
            py: 1,
            borderRadius: "999px",
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: "#0284c7",
            textTransform: "uppercase",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#0369a1",
              boxShadow: "none",
            },
          }}
        >
          Back to Home
        </Button> */}
      </Stack>
    </Box>
  );
};

export default UnauthorizedPage;
