import type { Configuration } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID as string,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY as string,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
    windowHashTimeout: 9000,
    iframeHashTimeout: 9000,
    loadFrameTimeout: 9000
  }
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "offline_access"],
  extraQueryParameters: {
    // Request groups in the ID token
    claims: JSON.stringify({
      "id_token": {
        "groups": null
      }
    })
  }
};

export const apiScopes = {
  eReq: [`api://${import.meta.env.VITE_ENTRA_CLIENT_ID}/ApproverMatrix.ReadWriteAll`]
};