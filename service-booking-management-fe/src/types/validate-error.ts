import { ApiResponseWrapper } from "./api-and-paging-wrapper";

// Type for standard ASP.NET Core field-level validation errors
export type FieldValidationErrorMap = Record<string, string[]>;

// Typed wrapper specifically for validation error responses
export type ApiValidationErrorResponse = ApiResponseWrapper<FieldValidationErrorMap>;