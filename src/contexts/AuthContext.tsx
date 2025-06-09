import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  initialized: boolean; // new flag to avoid early reads
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false); // added

  useEffect(() => {
    // Initialize auth state from localStorage once
    const isLogged = localStorage.getItem("isLogged") === "true";
    setIsAuthenticated(isLogged);
    setInitialized(true);
  }, []);

  // Sync in case other tabs change auth state
  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(localStorage.getItem("isLogged") === "true");
    };
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const login = () => {
    localStorage.setItem("isLogged", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("isLogged");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, initialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
