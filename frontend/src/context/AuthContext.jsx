import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || "");
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(Boolean(token));

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch {
        localStorage.removeItem("access_token");
        setToken("");
        setUser(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = (accessToken) => {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loadingProfile, isAuthenticated: Boolean(token), login, logout }),
    [loadingProfile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
