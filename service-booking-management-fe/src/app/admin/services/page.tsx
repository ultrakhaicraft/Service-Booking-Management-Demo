"use client";

import ServiceFormModal from "@/components/forms/service-form-modal";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import Pagination from "@/components/ui/pagination";
import ServiceDetailModal from "@/components/ui/service-detail-modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-view";
import { formatDuration, formatPrice } from "@/libs/utils";
import { serviceManagementService } from "@/services/service.service";
import { PagingModel } from "@/types/api-and-paging-wrapper";
import { ApiError } from "@/types/errorType";
import { ServiceDetailDTO } from "@/types/service";
import { useEffect, useState } from "react";


const PAGE_SIZE = 5;

type StatusFilter = "all" | "active" | "locked";

type ModalState =
  | { type: "create" }
  | { type: "view"; service: ServiceDetailDTO }
  | { type: "edit"; service: ServiceDetailDTO }
  | { type: "delete"; service: ServiceDetailDTO }
  | null;

export default function AdminServicesPage() {
  const [data, setData] = useState<PagingModel<ServiceDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [name, setName] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isActiveFilter = statusFilter === "all" ? undefined : statusFilter === "active";
  const items = data?.data ?? [];

  // Debounce the search box so we don't call the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setName(searchInput.trim());
      setPageIndex(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load the list whenever filters, page or refreshKey change.
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    serviceManagementService
      .getServices(
        { name: name || undefined, isActive: isActiveFilter, pageIndex, pageSize: PAGE_SIZE },
        controller.signal
      )
      .then(setData)
      .catch((err: ApiError | DOMException | unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load services.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [name, isActiveFilter, pageIndex, refreshKey]);

  // Auto-hide the success message.
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

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await serviceManagementService.remove(modal.service.id);
      closeModal();
      setNotice("Service deleted successfully.");
      // Deleted the only row on this page -> step back one page.
      if (items.length === 1 && pageIndex > 1) setPageIndex(pageIndex - 1);
      else refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setDeleteError(
          "This service already has bookings and cannot be deleted. Lock it instead (Update, then untick Active)."
        );
      } else {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete the service.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const hasFilters = name !== "" || statusFilter !== "all";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Service management</h1>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
        >
          + Create service
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search services by name"
          className="w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPageIndex(1);
          }}
          aria-label="Filter by status"
          className="rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      {isLoading && !data ? (
        <LoadingState message="Loading services..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <EmptyState message={hasFilters ? "No services match your filters." : "No services yet. Create the first one."} />
      ) : (
        <>
          <div className={`overflow-x-auto rounded-lg border bg-white ${isLoading ? "opacity-60" : ""}`}>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/30 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((service) => (
                  <tr key={service.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                    <td className="px-4 py-3">{formatDuration(service.durationMinutes)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatPrice(service.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.isActive ? "bg-secondary/50 text-accent-dark" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {service.isActive ? "Active" : "Locked"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setModal({ type: "view", service })}
                          className="rounded border border-gray-400 px-3 py-1 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: "edit", service })}
                          className="rounded border border-accent-dark px-3 py-1 text-accent-dark hover:bg-secondary/30"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: "delete", service })}
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

      {modal?.type === "create" && <ServiceFormModal onClose={closeModal} onSaved={(msg) => { setNotice(msg); refresh(); }} />}
      {modal?.type === "edit" && (
        <ServiceFormModal service={modal.service} onClose={closeModal} onSaved={(msg) => { setNotice(msg); refresh(); }} />
      )}
      {modal?.type === "view" && <ServiceDetailModal service={modal.service} onClose={closeModal} />}
      {modal?.type === "delete" && (
        <ConfirmDialog
          title="Delete service"
          message={`Are you sure you want to delete "${modal.service.name}"? This cannot be undone.`}
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
