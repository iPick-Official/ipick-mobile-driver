import React, { createContext, useContext, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { connectSocket, disconnectSocket } from "../utils/useSocket";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const id = localStorage.getItem("id");
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const accessToken = localStorage.getItem("accessToken");
  const isLogged = localStorage.getItem("isLogged") === "true";
  const localAuthToken = localStorage.getItem("authToken");

  useEffect(() => {
    setIsAuthenticated(isLogged);
    setInitialized(true);
    if (isLogged && userId) {
      connectSocket(userId);
    }
  }, []);

  useEffect(() => {
    setIsAuthenticated(isLogged);
    setInitialized(true);

    const userId = localStorage.getItem("userId");
    if (isLogged && userId) {
    }
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(isLogged);
    };
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const login = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found during login");
      return;
    }

    localStorage.setItem("isLogged", "true");
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setLoading(true);

    try {
      if (userId && userType && accessToken) {
        await fetch(
          `${
            import.meta.env.VITE_API_ENDPOINT
          }/auth/logout/${userType}/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      disconnectSocket();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isLogged");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      localStorage.removeItem("authToken");

      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, initialized }}
    >
      {children}
      <Loading isOpen={loading} message="Logging out..." />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
