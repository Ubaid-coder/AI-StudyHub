import api, { setAccessToken } from "@/lib/api";

import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthResponse,
  MeResponse,
  RefreshResponse,
  LogoutResponse,
} from "@/types/auth.types";

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  setAccessToken(response.data.data.accessToken);

  return response.data;
};

export const getCurrentUser =
  async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>(
      "/auth/me"
    );

    return response.data;
  };

export const refreshAccessToken =
  async (): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>(
      "/auth/refresh"
    );

    setAccessToken(response.data.data.accessToken);

    return response.data;
  };

export const logoutUser =
  async (): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>(
      "/auth/logout"
    );

    setAccessToken(null);

    return response.data;
  };