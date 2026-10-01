"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AccountRole } from "@/types/auth";
import { useAuth } from "@/libs/auth-provider";
import RoleGuard from "@/components/shared/roleguard";
import AppShell from "@/components/shared/appshell";
import { ADMIN_NAV_ITEMS } from "@/libs/navigation";

// AdminLayout is a wrapper that check if the user is an admin. If not, it redirects to the login page or the customer-home page.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === AccountRole.Admin;

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (!isAdmin) router.replace("/customer-home");
  }, [isLoading, user, isAdmin, router]);

  // Never render admin content until we know the user is an admin.
  if (isLoading || !isAdmin) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <RoleGuard allowedRole={AccountRole.Admin}>
      <AppShell items={ADMIN_NAV_ITEMS}>{children}</AppShell>
    </RoleGuard>
  );
}
