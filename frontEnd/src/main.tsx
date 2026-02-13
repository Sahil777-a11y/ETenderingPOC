import React from "react";
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from '@mui/material';
import theme from './components/theme.ts'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter as Router } from 'react-router';
import { AuthProvider } from "./auth/AuthProvider";

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/provider/store.ts";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Router>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);