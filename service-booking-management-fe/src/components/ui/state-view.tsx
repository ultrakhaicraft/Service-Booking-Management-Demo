export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div role="status" className="p-8 text-center text-gray-600">
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full border border-red-400 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-lg border bg-white p-8 text-center text-gray-600">{message}</div>;
}
