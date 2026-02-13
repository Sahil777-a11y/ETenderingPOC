import { Stack, Typography, Button, Box } from '@mui/material';
import NotFound from '../../assets/NotFound.png';
import { Link } from 'react-router';

const NotFoundPage = () => {
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
        backgroundColor: "#fafafa",
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Box
          component="img"
          src={NotFound}
          alt="Not_Found"
          sx={{
            maxWidth: "600px",
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
          Oops! The page you’re looking for doesn’t exist. Please click <b>Back to Home</b> to return to the homepage.
        </Typography>

        <Button
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
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
