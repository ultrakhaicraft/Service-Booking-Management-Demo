"use client";

import { useEffect, useState } from "react";


import { staffService } from "@/services/staff.service";
import { workScheduleService } from "@/services/work-schedule.service";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import ScheduleFormModal from "@/components/forms/schedule-form-modal";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import Pagination from "@/components/ui/pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-view";
import { formatWeekday, formatDate, formatTimeOnly } from "@/libs/utils";
import { ApiError } from "@/types/errorType";
import { StaffDetailDTO } from "@/types/staff";
import { WorkScheduleDetailDTO } from "@/types/work-schedule";


const PAGE_SIZE = 5;

type ModalState = { type: "create" } | { type: "delete"; schedule: WorkScheduleDetailDTO } | null;

const filterClass =
  "rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function AdminSchedulesPage() {
  // ----- staff dropdown -----
  const [staffs, setStaffs] = useState<StaffDetailDTO[]>([]);
  const [staffsLoading, setStaffsLoading] = useState(true);
  const [staffsError, setStaffsError] = useState<string | null>(null);
  const [staffsKey, setStaffsKey] = useState(0);
  const [staffId, setStaffId] = useState("");

  // ----- schedule list -----
  const [data, setData] = useState<PagingModel<WorkScheduleDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(""); // "YYYY-MM-DD" or ""
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selectedStaff = staffs.find((s) => s.id === staffId);
  const items = data?.data ?? [];

  useEffect(() => {
    const controller = new AbortController();
    setStaffsLoading(true);
    setStaffsError(null);

    staffService
      .getStaffs({ pageIndex: 1, pageSize: 100 }, controller.signal)
      .then((result) => setStaffs(result.data ?? []))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStaffsError(err instanceof ApiError ? err.message : "Failed to load staff.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setStaffsLoading(false);
      });

    return () => controller.abort();
  }, [staffsKey]);

  useEffect(() => {
    if (!staffId) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    workScheduleService
      .getScheduleByStaffId(staffId, { workDate: date || undefined, pageIndex, pageSize: PAGE_SIZE }, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load schedules.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [staffId, date, pageIndex, refreshKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const refresh = () => setRefreshKey((k) => k + 1);

  function closeModal() {
    setModal(null);
    setDeleteError(null);
  }

  function handleStaffChange(id: string) {
    setStaffId(id);
    setData(null);
    setDate("");
    setPageIndex(1);
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await workScheduleService.remove(modal.schedule.id);
      closeModal();
      setNotice("Work schedule deleted successfully.");
      if (items.length === 1 && pageIndex > 1) setPageIndex(pageIndex - 1);
      else refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setDeleteError(`${err.message} Cancel or complete the related bookings first.`);
      } else {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete the schedule.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Work schedules</h1>
        {selectedStaff && (
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
          >
            + Add schedule
          </button>
        )}
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center justify-between rounded border border-secondary bg-secondary/40 p-3 text-sm text-gray-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="px-2 text-lg leading-none">
            &times;
          </button>
        </div>
      )}

      {staffsLoading ? (
        <LoadingState message="Loading staff..." />
      ) : staffsError ? (
        <ErrorState message={staffsError} onRetry={() => setStaffsKey((k) => k + 1)} />
      ) : staffs.length === 0 ? (
        <EmptyState message="There are no staff members yet. Create one on the Staff page first." />
      ) : (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="schedule-staff" className="mb-1 block text-sm font-semibold">Staff member</label>
            <select
              id="schedule-staff"
              value={staffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className={`${filterClass} min-w-64`}
            >
              <option value="">Select a staff member...</option>
              {staffs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                  {s.isActive ? "" : " (locked)"}
                </option>
              ))}
            </select>
          </div>

          {staffId && (
            <>
              <div>
                <label htmlFor="schedule-filter-date" className="mb-1 block text-sm font-semibold">Date</label>
                <input
                  id="schedule-filter-date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setPageIndex(1);
                  }}
                  className={filterClass}
                />
              </div>
              {date && (
                <button
                  type="button"
                  onClick={() => {
                    setDate("");
                    setPageIndex(1);
                  }}
                  className="rounded-full border border-gray-400 px-5 py-2 text-sm font-semibold hover:bg-gray-100"
                >
                  Clear date
                </button>
              )}
            </>
          )}
        </div>
      )}

      {!staffsLoading && !staffsError && staffs.length > 0 && !staffId && (
        <EmptyState message="Select a staff member to see and manage their working hours." />
      )}

      {staffId &&
        (isLoading && !data ? (
          <LoadingState message="Loading schedules..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : items.length === 0 ? (
          <EmptyState
            message={
              date
                ? "No schedules on this date."
                : `${selectedStaff?.fullName ?? "This staff member"} has no work schedules yet.`
            }
          />
        ) : (
          <>
            <div className={`overflow-x-auto rounded-lg border bg-white ${isLoading ? "opacity-60" : ""}`}>
              <table className="min-w-full text-left text-sm">
                <thead className="bg-secondary/30 text-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Start</th>
                    <th className="px-4 py-3 font-semibold">End</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">
                        {formatWeekday(schedule.workDate)} {formatDate(schedule.workDate)}
                      </td>
                      <td className="px-4 py-3">{formatTimeOnly(schedule.startTime)}</td>
                      <td className="px-4 py-3">{formatTimeOnly(schedule.endTime)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setModal({ type: "delete", schedule })}
                          className="rounded border border-red-400 px-3 py-1 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
        ))}

      {modal?.type === "create" && selectedStaff && (
        <ScheduleFormModal
          staffId={selectedStaff.id}
          staffName={selectedStaff.fullName}
          onClose={closeModal}
          onSaved={(msg) => {
            setNotice(msg);
            refresh();
          }}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmDialog
          title="Delete work schedule"
          message={`Delete ${selectedStaff?.fullName ?? "this staff member"}'s schedule on ${formatDate(
            modal.schedule.workDate
          )} (${formatTimeOnly(modal.schedule.startTime)} - ${formatTimeOnly(modal.schedule.endTime)})?`}
          confirmLabel="Delete"
          isBusy={isDeleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
