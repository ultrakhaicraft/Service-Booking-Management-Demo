interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pageIndex,
  totalPages,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
}: PaginationProps) {
  const buttonClass =
    "rounded-full border border-gray-400 px-4 py-1.5 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
      <span>
        Page {pageIndex} of {Math.max(totalPages, 1)} &middot; {totalCount} total
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={!hasPrevious} onClick={() => onPageChange(pageIndex - 1)} className={buttonClass}>
          Previous
        </button>
        <button type="button" disabled={!hasNext} onClick={() => onPageChange(pageIndex + 1)} className={buttonClass}>
          Next
        </button>
      </div>
    </div>
  );
}
