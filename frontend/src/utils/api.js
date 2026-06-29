// ✅ api.js — Smart fetch wrapper with silent token refresh
// Place this at: frontend/src/utils/api.js

const USER_API = import.meta.env.VITE_USER_API || "http://localhost:4001";

// ✅ Silent token refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${USER_API}/api/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // Refresh token expired — force logout
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return null;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return null;
  }
};

// ✅ Smart fetch — auto refreshes token on 401
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const makeRequest = async (accessToken) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  let res = await makeRequest(token);

  // ✅ If 401 — try refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res; // refresh failed — user redirected to login
    res = await makeRequest(newToken); // retry with new token
  }

  return res;
};

// ✅ Logout helper — clears both tokens
export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    await fetch(`${USER_API}/api/users/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};

// ✅ Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem("token") || !!localStorage.getItem("refreshToken");
};