"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountRole } from "@/types/auth";
import { getHomePathByRole, useAuth } from "@/libs/auth-provider";
import { ApiError } from "@/types/errorType";

type FieldErrors = { email?: string; password?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = "Email is not valid";
  if (!password) errors.password = "Password is required";
  return errors;
}

// Only follow same-site paths, and never send a Customer into /admin (or vice versa).
function resolveRedirect(redirect: string | null, role: string): string {
  const home = getHomePathByRole(role);
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return home;
  const isAdminPath = redirect.startsWith("/admin");
  if (isAdminPath !== (role === AccountRole.Admin)) return home;
  return redirect;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in -> skip the login page.
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(resolveRedirect(searchParams.get("redirect"), user.role));
    }
  }, [isLoading, user, router, searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      router.replace(resolveRedirect(searchParams.get("redirect"), result.role));
    } catch (err: ApiError | unknown) {
      if (err instanceof ApiError) {
        setFieldErrors({
          email: err.fieldErrors?.email?.[0],
          password: err.fieldErrors?.password?.[0],
        });
        setFormError(err.fieldErrors ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 sm:p-12"
    >
      <h1 className="font-serif text-4xl font-bold text-gray-900">Log in</h1>
      <p className="mt-4 text-gray-700">Sign in to book and manage your appointments.</p>

      {formError && (
        <div role="alert" className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="mt-8">
        <label htmlFor="email" className="mb-2 block font-semibold text-gray-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={inputClass(Boolean(fieldErrors.email))}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="font-semibold text-gray-900">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="flex items-center gap-2 font-semibold text-accent-dark hover:underline"
          >
            <EyeIcon off={showPassword} />
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          className={inputClass(Boolean(fieldErrors.password))}
        />
        {fieldErrors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 h-14 min-w-40 rounded-full bg-accent px-10 text-lg font-semibold text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  // useSearchParams() requires a Suspense boundary for production builds.
  return (
   <div className="relative flex min-h-screen flex-col bg-primary">
      {/* Decorative vertical stripe on the left edge */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-secondary" />

      <header className="flex items-center gap-3 px-8 py-5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-gray-900"
        >
          SB
        </span>
        <span className="font-semibold text-gray-900">Service Booking</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {/* useSearchParams() requires a Suspense boundary for production builds. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>

      <footer className="px-8 py-5 text-sm text-gray-700">
        &copy; {new Date().getFullYear()} Service Booking Management System
      </footer>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `h-12 w-full rounded border px-3 text-base focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-400 focus:border-accent focus:ring-accent/40"
  }`;
}

function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}
