"use client";

import { useAuth } from "@/libs/auth-provider";


interface HelloUserProps {
  subtitle: string;
}

export default function HelloUser({ subtitle }: HelloUserProps) {
  const { user } = useAuth();
  if (!user) return null; // the role guard already ensures a user exists

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Hello, {user.fullName}!</h1>
      <p className="mt-1 text-sm text-gray-500">
        {user.email} &middot; {user.role}
      </p>
      <p className="mt-4 text-gray-700">{subtitle}</p>
    </section>
  );
}
