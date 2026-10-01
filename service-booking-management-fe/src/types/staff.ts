import { PagingQuery } from "./api-and-paging-wrapper";

// Query filter extending base pagination parameters
export interface StaffQueryDto extends PagingQuery {
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

// Full details for staff response
export interface StaffDetailDTO {
  id: string; // C# Guid maps to string in TS
  fullName: string;
  email: string;
  isActive: boolean;
}

// DTO for creating a new staff member
export interface StaffCreateDTO {
  fullName: string;
  email: string;
}

// DTO for updating an existing staff member
export interface StaffUpdateDTO {
  fullName: string;
  email: string;
  isActive: boolean;
}