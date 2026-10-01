// src/services/auth.service.ts
import { api, tokenStorage } from "@/services/api";
import type { LoginRequest, LoginResponse, MyAuthInfo } from "@/types/auth";

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const result = await api.post<LoginResponse>("/api/auth/login", request);
    tokenStorage.set(result.accessToken);
    return result;
  },

  me(signal?: AbortSignal): Promise<MyAuthInfo> {
    return api.get<MyAuthInfo>("/api/auth/me", { signal });
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return tokenStorage.get() !== null;
  },
};