import { BookingStatus } from "@/types/booking";

const STYLES: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: "bg-amber-100 text-amber-800",
  [BookingStatus.Confirmed]: "bg-secondary/50 text-accent-dark",
  [BookingStatus.Completed]: "bg-accent/30 text-gray-900",
  [BookingStatus.Cancelled]: "bg-gray-200 text-gray-700",
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] ?? "bg-gray-200 text-gray-700"}`}>
      {status}
    </span>
  );
}
