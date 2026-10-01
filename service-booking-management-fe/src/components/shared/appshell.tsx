import type { ReactNode } from "react";
import Header from "../ui/header";
import { NavItem } from "@/libs/navigation";
import Footer from "../ui/footer";


interface AppShellProps {
  items: NavItem[];
  children: ReactNode;
}
export default function AppShell({ items, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <Header items={items} />
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
      <Footer />
    </div>
  );
}

