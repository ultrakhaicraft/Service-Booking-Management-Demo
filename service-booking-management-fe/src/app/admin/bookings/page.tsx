"use client";

import { useEffect, useState } from "react";

import { bookingService } from "@/services/booking.service";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import { BookingStatus } from "@/types/booking";
import type { BookingDetailDTO } from "@/types/booking";
import { ApiError } from "@/types/errorType";

const PAGE_SIZE = 5;

type StatusFilter = "all" | BookingStatus;

type ModalState =
  | { type: "view"; booking: BookingDetailDTO }
  | { type: "cancel"; booking: BookingDetailDTO }
  | { type: "status"; booking: BookingDetailDTO; next: BookingStatus }
  | null;

const filterClass =
  "rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function AdminBookingsPage() {
  const [data, setData] = useState<PagingModel<BookingDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(""); // "YYYY-MM-DD" or ""
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = data?.data ?? [];
  const status = statusFilter === "all" ? undefined : statusFilter;

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    bookingService
      .getBookings({ date: date || undefined, status, pageIndex, pageSize: PAGE_SIZE }, controller.signal)
      .then(setData)
      .catch((err: unknown | ApiError | DOMException) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load bookings.");
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

  function closeModal() {
    setModal(null);
    setActionError(null);
  }

  function handleSaved(message: string) {
    setNotice(message);
    refresh();
  }

  async function handleStatusChange() {
    if (modal?.type !== "status") return;
    const { booking, next } = modal;
    setIsUpdating(true);
    setActionError(null);
    try {
      await bookingService.updateStatus(booking.id, { status: next });
      closeModal();
      setNotice(`Booking ${booking.bookingCode} is now ${next}.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update the booking status.");
    } finally {
      setIsUpdating(false);
    }
  }

  const hasFilters = date !== "" || statusFilter !== "all";
  const actionButton = "rounded border px-3 py-1 whitespace-nowrap";

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold text-gray-900">Booking management</h1>

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
        <LoadingState message="Loading bookings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <EmptyState message={hasFilters ? "No bookings match your filters." : "No bookings yet."} />
      ) : (
        <>
          <div className={`overflow-x-auto rounded-lg border bg-white ${isLoading ? "opacity-60" : ""}`}>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/30 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Staff</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((booking) => {
                  const canConfirm = booking.status === BookingStatus.Pending;
                  const canComplete = booking.status === BookingStatus.Confirmed;
                  const canCancel = canConfirm || canComplete;
                  return (
                    <tr key={booking.id}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">{booking.bookingCode}</td>
                      <td className="px-4 py-3">{booking.customerFullName}</td>
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
                            className={`${actionButton} border-gray-400 hover:bg-gray-100`}
                          >
                            View
                          </button>
                          {canConfirm && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", booking, next: BookingStatus.Confirmed })}
                              className={`${actionButton} border-accent-dark text-accent-dark hover:bg-secondary/30`}
                            >
                              Confirm
                            </button>
                          )}
                          {canComplete && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", booking, next: BookingStatus.Completed })}
                              className={`${actionButton} border-accent-dark text-accent-dark hover:bg-secondary/30`}
                            >
                              Complete
                            </button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "cancel", booking })}
                              className={`${actionButton} border-red-400 text-red-700 hover:bg-red-50`}
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

      {modal?.type === "view" && <BookingDetailModal booking={modal.booking} onClose={closeModal} />}
      {modal?.type === "cancel" && (
        <CancelBookingModal
          bookingId={modal.booking.id}
          bookingCode={modal.booking.bookingCode}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === "status" && (
        <ConfirmDialog
          title={modal.next === BookingStatus.Confirmed ? "Confirm booking" : "Complete booking"}
          message={`Mark booking ${modal.booking.bookingCode} (${modal.booking.customerFullName}) as ${modal.next}?`}
          confirmLabel={modal.next === BookingStatus.Confirmed ? "Confirm" : "Complete"}
          variant="primary"
          isBusy={isUpdating}
          error={actionError}
          onConfirm={handleStatusChange}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
