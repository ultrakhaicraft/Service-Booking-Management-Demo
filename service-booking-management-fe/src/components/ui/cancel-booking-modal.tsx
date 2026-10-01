"use client";

import { BOOKING_LIMITS, validateCancelReason } from "@/libs/validators/booking-validator";
import { bookingService } from "@/services/booking.service";
import { ApiError } from "@/types/errorType";
import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "../shared/modal";
import FormField, { fieldInputClass } from "./form-field";


interface CancelBookingModalProps {
  bookingId: string;
  bookingCode: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}

/** Reusable by both the admin and the customer booking lists. */
export default function CancelBookingModal({ bookingId, bookingCode, onClose, onSaved }: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const validationError = validateCancelReason(reason);
    setReasonError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      await bookingService.cancel(bookingId, { reason: reason.trim() });
      onSaved(`Booking ${bookingCode} was cancelled.`);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const serverReasonError = err.fieldErrors?.reason?.[0];
        setReasonError(serverReasonError);
        setFormError(serverReasonError ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Cancel booking" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-gray-700">
          You are about to cancel booking <strong>{bookingCode}</strong>. Please tell us why.
        </p>

        {formError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField
          id="cancel-reason"
          label="Cancellation reason"
          error={reasonError}
          hint={`Up to ${BOOKING_LIMITS.cancelReasonMax} characters`}
        >
          <textarea
            id="cancel-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(reasonError)}
            aria-describedby={reasonError ? "cancel-reason-error" : undefined}
            className={fieldInputClass(Boolean(reasonError))}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-gray-400 px-5 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Cancelling..." : "Cancel booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
