"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth-provider";
import { NavItem } from "@/libs/navigation";


interface HeaderProps {
  items: NavItem[];
}

export default function Header({ items }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

   const linkClass = (href: string) =>
    `rounded px-3 py-2 text-sm font-medium ${
      isActive(href) ? "bg-secondary/40 text-accent-dark" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="border-b border-secondary bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-base font-semibold text-accent-dark">Service Booking</span>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && <span className="text-sm text-gray-600">{user.fullName}</span>}
          <button
            type="button"
            onClick={logout}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded border px-3 py-1.5 text-sm md:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t px-4 py-2 md:hidden" aria-label="Mobile navigation">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-1 rounded border px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Log out{user ? ` (${user.fullName})` : ""}
          </button>
        </nav>
      )}
    </header>
  );
}
