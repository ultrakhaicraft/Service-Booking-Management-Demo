"use client";


import { formatDateTimeRange, formatDateTime } from "@/libs/utils";
import type { BookingDetailDTO } from "@/types/booking";
import Modal from "../shared/modal";

interface BookingDetailModalProps {
  booking: BookingDetailDTO;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Booking code", value: booking.bookingCode },
    { label: "Customer", value: booking.customerFullName },
    { label: "Service", value: booking.serviceName },
    { label: "Staff", value: booking.staffFullName },
    { label: "Time", value: formatDateTimeRange(booking.startTime, booking.endTime) },
    { label: "Customer note", value: booking.customerNote || "-" },
  ];
  if (booking.cancellationReason) {
    rows.push({ label: "Cancellation reason", value: booking.cancellationReason });
  }
  rows.push({ label: "Created", value: formatDateTime(booking.createdAt) });

  return (
    <Modal title="Booking details" onClose={onClose}>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm font-semibold text-gray-500">Status</dt>
          <dd className="mt-1">
            <BookingStatusBadge status={booking.status} />
          </dd>
        </div>
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm font-semibold text-gray-500">{row.label}</dt>
            <dd className="mt-0.5 break-words whitespace-pre-wrap text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
