import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
msalInstance.initialize().then(() => {
  console.log('MSAL instance initialized');
}).catch((error) => {
  console.error('MSAL initialization failed:', error);
});