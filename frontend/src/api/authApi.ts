import api from "@/lib/axios";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth.types";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/api/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/api/auth/login", data),

  refresh: () =>
    api.post<{ accessToken: string }>("/api/auth/refresh"),

  logout: () =>
    api.post("/api/auth/logout"),
};
