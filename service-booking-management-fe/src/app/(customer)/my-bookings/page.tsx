"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { bookingService } from "@/services/booking.service";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import { BookingStatus } from "@/types/booking";
import type { BookingDetailDTO } from "@/types/booking";
import BookingDetailModal from "@/components/ui/booking-detail-modal";
import BookingStatusBadge from "@/components/ui/booking-status-badge";
import CancelBookingModal from "@/components/ui/cancel-booking-modal";
import Pagination from "@/components/ui/pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-view";
import { formatDateTimeRange } from "@/libs/utils";
import { ApiError } from "@/types/errorType";

const PAGE_SIZE = 5;

type StatusFilter = "all" | BookingStatus;

type ModalState =
  | { type: "view"; booking: BookingDetailDTO }
  | { type: "cancel"; booking: BookingDetailDTO }
  | null;

const filterClass =
  "rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function MyBookingsPage() {
  const [data, setData] = useState<PagingModel<BookingDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(""); // "YYYY-MM-DD" or ""
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const items = data?.data ?? [];
  const status = statusFilter === "all" ? undefined : statusFilter;
  const hasFilters = date !== "" || statusFilter !== "all";

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    bookingService
      .getMyBookings({ date: date || undefined, status, pageIndex, pageSize: PAGE_SIZE }, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load your bookings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [date, status, pageIndex, refreshKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const refresh = () => setRefreshKey((k) => k + 1);
  const closeModal = () => setModal(null);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-gray-900">My bookings</h1>
        <Link
          href="/booking"
          className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
        >
          + Book a service
        </Link>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center justify-between rounded border border-secondary bg-secondary/40 p-3 text-sm text-gray-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="px-2 text-lg leading-none">
            &times;
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="filter-date" className="mb-1 block text-sm font-semibold">Date</label>
          <input
            id="filter-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPageIndex(1);
            }}
            className={filterClass}
          />
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1 block text-sm font-semibold">Status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPageIndex(1);
            }}
            className={filterClass}
          >
            <option value="all">All statuses</option>
            {Object.values(BookingStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setDate("");
              setStatusFilter("all");
              setPageIndex(1);
            }}
            className="rounded-full border border-gray-400 px-5 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && !data ? (
        <LoadingState message="Loading your bookings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <div className="space-y-3">
          <EmptyState message={hasFilters ? "No bookings match your filters." : "You have no bookings yet."} />
          {!hasFilters && (
            <div className="text-center">
              <Link href="/services" className="font-semibold text-accent-dark hover:underline">
                Browse our services
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={`overflow-x-auto rounded-lg border bg-white ${isLoading ? "opacity-60" : ""}`}>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/30 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Staff</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((booking) => {
                  const canCancel =
                    booking.status === BookingStatus.Pending || booking.status === BookingStatus.Confirmed;
                  return (
                    <tr key={booking.id}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">{booking.bookingCode}</td>
                      <td className="px-4 py-3">{booking.serviceName}</td>
                      <td className="px-4 py-3">{booking.staffFullName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTimeRange(booking.startTime, booking.endTime)}</td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setModal({ type: "view", booking })}
                            className="rounded border border-gray-400 px-3 py-1 hover:bg-gray-100"
                          >
                            View
                          </button>
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "cancel", booking })}
                              className="rounded border border-red-400 px-3 py-1 text-red-700 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && (
            <Pagination
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              hasPrevious={data.hasPrevious}
              hasNext={data.hasNext}
              onPageChange={setPageIndex}
            />
          )}
        </>
      )}

      {modal?.type === "view" && (
        <BookingDetailModal booking={modal.booking} onClose={closeModal} showCustomer={false} />
      )}
      {modal?.type === "cancel" && (
        <CancelBookingModal
          bookingId={modal.booking.id}
          bookingCode={modal.booking.bookingCode}
          onClose={closeModal}
          onSaved={(message) => {
            setNotice(message);
            refresh();
          }}
        />
      )}
    </div>
  );
}
