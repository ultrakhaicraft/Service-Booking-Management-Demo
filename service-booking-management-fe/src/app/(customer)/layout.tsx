import type { ReactNode } from "react";

import { AccountRole } from "@/types/auth";
import RoleGuard from "@/components/shared/roleguard";
import { CUSTOMER_NAV_ITEMS } from "@/libs/navigation";
import AppShell from "@/components/shared/appshell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRole={AccountRole.Customer}>
      <AppShell items={CUSTOMER_NAV_ITEMS}>{children}</AppShell>
    </RoleGuard>
  );
}
