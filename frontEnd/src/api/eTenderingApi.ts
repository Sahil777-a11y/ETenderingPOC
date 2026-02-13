import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getTokenForApi } from "../auth/tokenService";
import { apiScopes } from "../auth/msalConfig";

const BASE_URL = `${import.meta.env.VITE_BACKEND_APPROVAL_ENDPOINT}${import.meta.env.VITE_BACKEND_PREFIX
  }`;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    try {
      const token = await getTokenForApi(apiScopes.eReq);
      headers.set("Authorization", `Bearer ${token}`);
    } catch (error) {
      console.error("Failed to get access token:", error);
    }

    headers.set("X-Content-Type-Options", "nosniff");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 Unauthorized, try to refresh the token and retry
  if (result.error && result.error.status === 401) {
    console.warn("API call failed with 401, attempting to refresh token...");
    try {
      // Force a fresh token acquisition
      await getTokenForApi(apiScopes.eReq);
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } catch (tokenError) {
      console.error("Token refresh failed:", tokenError);
      // Return the original 401 error if token refresh fails
    }
  }

  return result;
};

export const ETenderingDataAPI = createApi({
  reducerPath: "etenderingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ETendering_TAG"],
  endpoints: () => ({}),
});

export default ETenderingDataAPI;
