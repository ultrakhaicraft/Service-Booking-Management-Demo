import { QueryParams, RequestOptions } from "@/types/api-and-paging-wrapper";
import { ApiError } from "@/types/errorType";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:7188";
 
const TOKEN_KEY = "sbm_token";


//Store and retrieve the JWT token in a cookie for server-side rendering support.
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
 
// Tolerant parser: handles ASP.NET ProblemDetails / ValidationProblemDetails and { message }.
async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let fieldErrors: Record<string, string[]> | undefined;
 
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") message = d.message;
      else if (typeof d.detail === "string") message = d.detail;
      else if (typeof d.title === "string") message = d.title;
 
      if (d.errors && typeof d.errors === "object") {
        fieldErrors = d.errors as Record<string, string[]>;
      }
    }
  } catch {
    // Non-JSON body: keep default message
  }
 
  return new ApiError(res.status, message, fieldErrors);
}

//Perform the actual fetch request and handle errors, including token expiration.
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
  return (await res.json()) as T;
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