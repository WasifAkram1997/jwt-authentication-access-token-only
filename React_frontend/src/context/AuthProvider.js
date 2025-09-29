import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000"; // FastAPI backend
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }

  const refresh = async () => {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    setAccessToken(data.access_token);
    const payload = parseJwt(data.access_token);
    setUser(payload?.sub ? { username: payload.sub } : null);
    return data.access_token;
  };

  const login = async ({ username, password }) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setAccessToken(data.access_token);
    const payload = parseJwt(data.access_token);
    setUser(payload?.sub ? { username: payload.sub } : null);
  };

  const signup = async ({ username, password }) => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Signup failed");
    return await res.json();
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}, retry = true) => {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const res = await fetch(url, { ...options, headers, credentials: "include" });

    if (res.status === 401 && retry) {
      try {
        const newToken = await refresh();
        headers.set("Authorization", `Bearer ${newToken}`);
        return await fetch(url, { ...options, headers, credentials: "include" });
      } catch {
        logout();
      }
    }
    return res;
  };

  useEffect(() => {
    refresh().catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, authFetch, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
