import { msalInstance } from "./msalInstance";
import { loginRequest } from "./msalConfig";

export const getTokenForApi = async (scopes: string[]) => {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) {
    throw new Error("No signed in account found. Please log in first.");
  }

  try {
    // Try to acquire token silently first
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
      scopes,
    });
    return response.accessToken;
  } catch (error) {
    console.warn("Silent token acquisition failed, attempting interactive acquisition:", error);
    
    try {
      // If silent acquisition fails, try interactive acquisition
      const response = await msalInstance.acquireTokenPopup({
        ...loginRequest,
        scopes,
      });
      return response.accessToken;
    } catch (interactiveError) {
      console.error("Interactive token acquisition also failed:", interactiveError);
      throw new Error("Failed to acquire access token. Please try logging in again.");
    }
  }
};