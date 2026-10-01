"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AccountRole } from "@/types/auth";
import type { LoginRequest, LoginResponse, MyAuthInfo } from "@/types/auth";
import { ADMIN_HOME_PATH, CUSTOMER_HOME_PATH } from "./navigation";

interface AuthContextValue {
  user: MyAuthInfo | null;
  /** True until the initial session check (/me) has finished. */
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function getHomePathByRole(role: string): string {
  return role === AccountRole.Admin ? ADMIN_HOME_PATH : CUSTOMER_HOME_PATH;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MyAuthInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on first load / page refresh.
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    authService
      .me(controller.signal)
      .then(setUser)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        authService.logout(); // invalid/expired token
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authService.login(request);
    setUser({
      fullName: result.fullName,
      email: result.email,
      role: result.role,
      accountId: result.accountId,
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
