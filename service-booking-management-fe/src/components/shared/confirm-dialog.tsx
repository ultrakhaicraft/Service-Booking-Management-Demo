"use client";

import type { ReactNode } from "react";
import Modal from "./modal";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  isBusy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  isBusy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-gray-700">{message}</p>

      {error && (
        <div role="alert" className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="rounded-full border border-gray-400 px-5 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isBusy}
          className={`rounded-full px-6 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-accent text-gray-900 hover:brightness-95"
          }`}
        >
          {isBusy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
