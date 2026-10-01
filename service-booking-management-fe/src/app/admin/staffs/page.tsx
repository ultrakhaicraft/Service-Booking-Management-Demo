"use client";

import { useEffect, useState } from "react";


import { staffService } from "@/services/staff.service";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import StaffFormModal from "@/components/forms/staff-form-modal";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import Pagination from "@/components/ui/pagination";
import StaffDetailModal from "@/components/ui/staff-detail-model";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-view";
import { ApiError } from "@/types/errorType";
import { StaffDetailDTO } from "@/types/staff";


const PAGE_SIZE = 5;

type ModalState =
  | { type: "create" }
  | { type: "view"; staff: StaffDetailDTO }
  | { type: "edit"; staff: StaffDetailDTO }
  | { type: "delete"; staff: StaffDetailDTO }
  | null;

const filterInputClass =
  "w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-64";

export default function AdminStaffsPage() {
  const [data, setData] = useState<PagingModel<StaffDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const items = data?.data ?? [];

  // Debounce the two search boxes so we don't call the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFullName(nameInput.trim());
      setEmail(emailInput.trim());
      setPageIndex(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput, emailInput]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    staffService
      .getStaffs(
        { fullName: fullName || undefined, email: email || undefined, pageIndex, pageSize: PAGE_SIZE },
        controller.signal
      )
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load staff.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [fullName, email, pageIndex, refreshKey]);

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

  function handleSaved(message: string) {
    setNotice(message);
    refresh();
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await staffService.remove(modal.staff.id);
      closeModal();
      setNotice("Staff member deleted successfully.");
      // Deleted the only row on this page -> step back one page.
      if (items.length === 1 && pageIndex > 1) setPageIndex(pageIndex - 1);
      else refresh();
    } catch (err: ApiError | unknown) {
      if (err instanceof ApiError && err.isConflict) {
        setDeleteError(`${err.message} You can lock this staff member instead (Update, then untick Active).`);
      } else {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete the staff member.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const hasFilters = fullName !== "" || email !== "";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Staff management</h1>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
        >
          + Create staff member
        </button>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center justify-between rounded border border-secondary bg-secondary/40 p-3 text-sm text-gray-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="px-2 text-lg leading-none">
            &times;
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search staff by name"
          className={filterInputClass}
        />
        <input
          type="search"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Search by email..."
          aria-label="Search staff by email"
          className={filterInputClass}
        />
      </div>

      {isLoading && !data ? (
        <LoadingState message="Loading staff..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <EmptyState message={hasFilters ? "No staff members match your search." : "No staff members yet. Create the first one."} />
      ) : (
        <>
          <div className={`overflow-x-auto rounded-lg border bg-white ${isLoading ? "opacity-60" : ""}`}>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/30 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Full name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{staff.fullName}</td>
                    <td className="px-4 py-3">{staff.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          staff.isActive ? "bg-secondary/50 text-accent-dark" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {staff.isActive ? "Active" : "Locked"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setModal({ type: "view", staff })}
                          className="rounded border border-gray-400 px-3 py-1 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: "edit", staff })}
                          className="rounded border border-accent-dark px-3 py-1 text-accent-dark hover:bg-secondary/30"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: "delete", staff })}
                          className="rounded border border-red-400 px-3 py-1 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
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
      )}

      {modal?.type === "create" && <StaffFormModal onClose={closeModal} onSaved={handleSaved} />}
      {modal?.type === "edit" && <StaffFormModal staff={modal.staff} onClose={closeModal} onSaved={handleSaved} />}
      {modal?.type === "view" && <StaffDetailModal staff={modal.staff} onClose={closeModal} />}
      {modal?.type === "delete" && (
        <ConfirmDialog
          title="Delete staff member"
          message={`Are you sure you want to delete "${modal.staff.fullName}"? This cannot be undone.`}
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
