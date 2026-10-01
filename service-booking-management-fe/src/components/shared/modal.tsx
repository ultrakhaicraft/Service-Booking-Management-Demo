"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on the backdrop
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-serif text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 text-2xl leading-none text-gray-500 hover:bg-gray-100"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
