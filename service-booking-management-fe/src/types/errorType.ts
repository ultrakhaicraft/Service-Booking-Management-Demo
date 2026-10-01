import { ApiResponseWrapper } from "./api-and-paging-wrapper";

// Type for standard ASP.NET Core field-level validation errors
export type FieldValidationErrorMap = Record<string, string[]>;

// Typed wrapper specifically for validation error responses
export type ApiValidationErrorResponse = ApiResponseWrapper<FieldValidationErrorMap>;


export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
 
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
}