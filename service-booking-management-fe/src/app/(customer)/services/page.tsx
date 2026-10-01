"use client";

import Pagination from "@/components/ui/pagination";
import ServiceCard from "@/components/ui/service-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-view";
import { validatePriceRange } from "@/libs/validators/service-validator";
import { serviceManagementService } from "@/services/service.service";
import { PagingModel } from "@/types/api-and-paging-wrapper";
import { ApiError } from "@/types/errorType";
import { ServiceDetailDTO } from "@/types/service";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";


const PAGE_SIZE = 6;

interface PriceFilter {
  startPrice?: number;
  endPrice?: number;
}

const inputClass = (hasError: boolean) =>
  `w-full rounded border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    hasError ? "border-red-500 focus:ring-red-200" : "border-gray-400 focus:border-accent focus:ring-accent/40"
}`;

export default function CustomerServicesPage() {
  const [data, setData] = useState<PagingModel<ServiceDetailDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [name, setName] = useState("");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [priceErrors, setPriceErrors] = useState<{ startPrice?: string; endPrice?: string }>({});
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({});
  const [pageIndex, setPageIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const items = data?.data ?? [];
  const { startPrice, endPrice } = priceFilter;

  // Debounce the name search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setName(searchInput.trim());
      setPageIndex(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    serviceManagementService
      .getServices(
        { name: name || undefined, startPrice, endPrice, isActive: true, pageIndex, pageSize: PAGE_SIZE },
        controller.signal
      )
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load services.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [name, startPrice, endPrice, pageIndex, refreshKey]);

  function applyPriceFilter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validatePriceRange(minInput, maxInput);
    setPriceErrors(result.errors);
    if (result.errors.startPrice || result.errors.endPrice) return;
    setPriceFilter({ startPrice: result.startPrice, endPrice: result.endPrice });
    setPageIndex(1);
  }

  function clearFilters() {
    setSearchInput("");
    setName("");
    setMinInput("");
    setMaxInput("");
    setPriceErrors({});
    setPriceFilter({});
    setPageIndex(1);
  }

  const hasFilters = name !== "" || startPrice !== undefined || endPrice !== undefined;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Our services</h1>
      <p className="mt-1 text-gray-700">Pick a service and book a time that suits you.</p>

      <form onSubmit={applyPriceFilter} noValidate className="mt-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="search" className="mb-1 block text-sm font-semibold">Search</label>
          <input
            id="search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Service name..."
            className={inputClass(false)}
          />
        </div>

        <div>
          <label htmlFor="min-price" className="mb-1 block text-sm font-semibold">Min price (VND)</label>
          <input
            id="min-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            aria-invalid={Boolean(priceErrors.startPrice)}
            className={inputClass(Boolean(priceErrors.startPrice))}
          />
          {priceErrors.startPrice && <p className="mt-1 text-xs text-red-600">{priceErrors.startPrice}</p>}
        </div>

        <div>
          <label htmlFor="max-price" className="mb-1 block text-sm font-semibold">Max price (VND)</label>
          <input
            id="max-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            aria-invalid={Boolean(priceErrors.endPrice)}
            className={inputClass(Boolean(priceErrors.endPrice))}
          />
          {priceErrors.endPrice && <p className="mt-1 text-xs text-red-600">{priceErrors.endPrice}</p>}
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-gray-400 px-5 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-6">
        {isLoading && !data ? (
          <LoadingState message="Loading services..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
        ) : items.length === 0 ? (
          <EmptyState message={hasFilters ? "No services match your filters." : "No services are available right now."} />
        ) : (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isLoading ? "opacity-60" : ""}`}>
              {items.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
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
      </div>
    </div>
  );
}
