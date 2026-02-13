import { Grid, Stack, Typography } from '@mui/material';

function ThankYouPage() {
  return (

    <Grid maxWidth="sm" container spacing={4} direction="column" alignItems="center" justifyContent="center" sx={{
      minHeight: '100vh', py: 2, display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center", textAlign: "center"
    }}>
      <Grid >
        <Stack spacing={1} justifyContent="center" alignItems="center" sx={{ mt: -2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: "#0080BC" }}>
            Thank You!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#555" }}>
            You have successfully logged out. We hope to see you again soon!
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default ThankYouPage;
