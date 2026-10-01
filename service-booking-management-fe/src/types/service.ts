import { PagingQuery } from "./api-and-paging-wrapper";

// Query filter extending base pagination parameters
export interface ServiceQuery extends PagingQuery {
  name?: string;
  startPrice?: number;
  endPrice?: number;
  isActive?: boolean;
}

// Full details for service response
export interface ServiceDetailDTO {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

// DTO for creating a service
export interface ServiceCreateDTO {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

// DTO for updating a service
export interface ServiceUpdateDTO {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}