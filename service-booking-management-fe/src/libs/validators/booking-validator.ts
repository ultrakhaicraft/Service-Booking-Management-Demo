export const BOOKING_LIMITS = {
  cancelReasonMax: 500,
  noteMax: 500,
} as const;
 
export function validateCancelReason(reason: string): string | undefined {
  const text = reason.trim();
  if (!text) return "A cancellation reason is required";
  if (text.length > BOOKING_LIMITS.cancelReasonMax) {
    return `Reason must be at most ${BOOKING_LIMITS.cancelReasonMax} characters`;
  }
  return undefined;
}

export interface BookingFormInput {
  serviceId: string;
  date: string; // "YYYY-MM-DD" or ""
  hasSlot: boolean;
  note: string;
  today: string; // "YYYY-MM-DD" in local time, "" if not known yet
}
 
export interface BookingFormErrors {
  serviceId?: string;
  date?: string;
  slot?: string;
  customerNote?: string;
}
 
export function validateBookingForm({ serviceId, date, hasSlot, note, today }: BookingFormInput): BookingFormErrors {
  const errors: BookingFormErrors = {};
 
  if (!serviceId) errors.serviceId = "Please choose a service";
 
  if (!date) errors.date = "Please choose a date";
  else if (today && date < today) errors.date = "The date cannot be in the past";
 
  if (!errors.serviceId && !errors.date && !hasSlot) errors.slot = "Please pick a time slot";
 
  if (note.trim().length > BOOKING_LIMITS.noteMax) {
    errors.customerNote = `Note must be at most ${BOOKING_LIMITS.noteMax} characters`;
  }
 
  return errors;
}