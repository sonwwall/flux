import { useState } from "react";
import { clearToken, getToken, login as loginRequest, setToken } from "./api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));

  async function login(secret) {
    const result = await loginRequest(secret);
    if (!result?.error && result?.token) {
      setToken(result.token);
      setIsAuthenticated(true);
    }
    return result;
  }

  function logout() {
    clearToken();
    setIsAuthenticated(false);
  }

  return {
    isAuthenticated,
    login,
    logout,
    hasToken: () => Boolean(getToken()),
  };
}
