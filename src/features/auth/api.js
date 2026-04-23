import { apiJSON } from "../../shared/lib/request";

const TOKEN_KEY = "flux_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function login(secret) {
  return apiJSON("/api/auth/login", {
    method: "POST",
    body: { secret },
  });
}

export function changeSecret(secret) {
  return apiJSON("/api/auth/change-secret", {
    method: "POST",
    body: { secret },
    headers: authHeader(),
  });
}
