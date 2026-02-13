import { useNavigate } from "react-router";
import { Routes } from "react-router";
import { renderRoutes, Routes as AllRoutes } from './routes';
import { Grid, CircularProgress, Box, Typography } from "@mui/material";
import './index.css';
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";

function App() {
  const navigate = useNavigate();
  const appMatrixKey = "8d27308d-ebab-4f94-8830-8f65c850a656";
  const { login, account, hasGroup, tokenRefreshed, groups, groupsLoaded } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!account && !isLoggingIn) {
      setIsLoggingIn(true);
      login().catch((error) => {
        console.error('Login failed:', error);
        setIsLoggingIn(false);
      });
      return;
    }

    if (account && tokenRefreshed && groups.length > 0) {
      if (!hasGroup(appMatrixKey)) {
        navigate("/unauthorized", { replace: true });
        return;
      }
      setIsLoggingIn(false);
    }

    if (!account || !tokenRefreshed || !groupsLoaded) {
      return;
    }

  }, [account, isLoggingIn, login, hasGroup, tokenRefreshed, navigate, groups, groupsLoaded]);

  if ((!account && isLoggingIn) || (account && !tokenRefreshed)) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" style={{ marginTop: 16 }}>
            {!account ? 'Redirecting to login...' : 'Loading...'}
          </Typography>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid>
      <ToastContainer />
      {account ? (
        <>
          <Routes>{renderRoutes(AllRoutes as any)}</Routes>
        </>
      ) : (
        <>
          <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" style={{ marginTop: 16 }}>
                Redirecting to login...
              </Typography>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default App
