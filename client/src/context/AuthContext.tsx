"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logoutUser,
} from "@/services/auth.service";

import { setAccessToken } from "@/lib/axios";

import type {
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessTokenState] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;

  // Check existing authentication when app starts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await refreshAccessToken();

        const token = response.data.accessToken;

        setAccessTokenState(token);
        setAccessToken(token);

        const meResponse = await getCurrentUser();

        setUser(meResponse.data.user);
      } catch (error) {
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (
    data: RegisterRequest
  ) => {
    await registerUser(data);
  };

  const login = async (
    data: LoginRequest
  ) => {
    const response = await loginUser(data);

    const token = response.data.accessToken;

    setAccessTokenState(token);
    setAccessToken(token);

    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    }
  };

  const refresh = async (): Promise<string | null> => {
    try {
      const response = await refreshAccessToken();

      const token = response.data.accessToken;

      setAccessTokenState(token);
      setAccessToken(token);

      return token;
    } catch {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);

      return null;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    refreshAccessToken: refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};