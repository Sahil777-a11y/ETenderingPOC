import { useMsal, useAccount } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "./msalConfig";

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  useEffect(() => {
    const refreshToken = async () => {
      if (account && !tokenRefreshed) {
        try {
          await instance.acquireTokenSilent({
            ...loginRequest,
            account,
            forceRefresh: false,
          });

          setTokenRefreshed(true);
          setGroupsLoaded(true);
        } catch (error) {
          console.warn('Token refresh failed:', error);
          setTokenRefreshed(true);
          setGroupsLoaded(true);
        }
      }
    };

    refreshToken();
  }, [account, instance, tokenRefreshed]);

  const login = async () => {
    try {
      const response = await instance.ssoSilent(loginRequest);
      return response;
    } catch (error) {
      console.log('Silent authentication failed, redirecting to login...');
      return instance.loginRedirect(loginRequest);
    }
  };

  const logout = () => instance.logoutRedirect();

  const getRoles = (): string[] => {
    const idToken = account?.idTokenClaims as any;
    return idToken?.roles || [];
  };

  const getGroups = (): string[] => {
    const idToken = account?.idTokenClaims as any;

    return (
      idToken?.groups ||
      idToken?.sec_groups ||
      idToken?.security_groups ||
      []
    );
  };

  const hasRole = (role: string): boolean => {
    return getRoles().includes(role);
  };

  const hasGroup = (group: string): boolean => {
    return getGroups().includes(group);
  };

  return { account, login, logout, roles: getRoles(), groups: getGroups(), hasRole, hasGroup, tokenRefreshed, groupsLoaded, authLoading: !groupsLoaded };
};
