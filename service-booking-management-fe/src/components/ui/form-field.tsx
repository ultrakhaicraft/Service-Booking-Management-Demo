import type { ReactNode } from "react";

export function fieldInputClass(hasError: boolean): string {
  return `w-full rounded border px-3 py-2 text-base focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-400 focus:border-accent focus:ring-accent/40"
  }`;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export default function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold text-gray-900">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
