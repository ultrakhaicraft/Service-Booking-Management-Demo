"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AccountRole } from "@/types/auth";
import { getHomePathByRole, useAuth } from "@/libs/auth-provider";

interface RoleGuardProps {
  allowedRole: AccountRole;
  children: ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = user?.role === allowedRole;

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (!allowed) router.replace(getHomePathByRole(user.role)); 
  }, [isLoading, user, allowed, router]);

  if (isLoading || !allowed) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return <>{children}</>;
}
