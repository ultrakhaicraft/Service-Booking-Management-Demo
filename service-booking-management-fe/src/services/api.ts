// Base HTTP client. All service files (auth, booking, ...) go through this.

import { ApiResponseWrapper, QueryParams, RequestOptions } from "@/types/api-and-paging-wrapper";
import { ApiError } from "@/types/errorType";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7188";

export const TOKEN_KEY = "sbm_token";

// Stored in a cookie (not localStorage)
export const tokenStorage = {
  get(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${TOKEN_KEY}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
  },
  set(token: string, maxAgeSeconds = 60 * 60 * 24): void {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  },
  clear(): void {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  },
};


function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

// Backend ModelState keys are PascalCase ("Email"); form fields are camelCase ("email").
function normalizeFieldErrors(raw: Record<string, unknown>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = Array.isArray(value) ? value.map(String) : [String(value)];
  }
  return result;
}

// Handles ApiResponseWrapper ({ message, error }) and, as a fallback,
// ASP.NET ProblemDetails ({ title, detail, errors }) which [ApiController] auto-returns.
async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let fieldErrors: Record<string, string[]> | undefined;

  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const d = body as Record<string, unknown>;
      if (typeof d.message === "string" && d.message) message = d.message;
      else if (typeof d.detail === "string") message = d.detail;
      else if (typeof d.title === "string") message = d.title;

      // wrapper.error: either a string message or a field -> messages map
      if (typeof d.error === "string" && d.error) {
        message = d.error;
      } else if (d.error && typeof d.error === "object") {
        fieldErrors = normalizeFieldErrors(d.error as Record<string, unknown>);
      } else if (d.errors && typeof d.errors === "object") {
        fieldErrors = normalizeFieldErrors(d.errors as Record<string, unknown>);
      }
    }
  } catch {
    // Empty / non-JSON body (e.g. JWT middleware 401): keep default message
  }

  return new ApiError(res.status, message, fieldErrors);
}

async function request<T>(
  method: string,
  path: string,
  { query, body, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Cannot reach the server. Please try again.");
  }

  if (!res.ok) {
    const error = await toApiError(res);
    // Expired/invalid token on a protected call -> force re-login.
    // Skip for the login call itself, where 401 means "wrong credentials".
    if (error.isUnauthorized && !path.endsWith("/api/auth/login") && typeof window !== "undefined") {
      tokenStorage.clear();
      window.location.href = "/login";
    }
    throw error;
  }

  if (res.status === 204) return undefined as T;

  // Success responses are ApiResponseWrapper<T>: return only the payload.
  const successBody  = (await res.json()) as ApiResponseWrapper<T> | T;
  if (successBody  && typeof successBody  === "object" && "statusCode" in successBody  && "message" in successBody ) {
    return (successBody  as ApiResponseWrapper<T>).data as T;
  }
  return successBody as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "body">) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("PUT", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
    request<T>("PATCH", path, { ...opts, body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "body">) => request<T>("DELETE", path, opts),
};