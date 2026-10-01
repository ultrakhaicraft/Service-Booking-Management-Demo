import { PagingQuery } from "./api-and-paging-wrapper";

// Query filter extending base pagination parameters
export interface WorkScheduleQuery extends PagingQuery {
  workDate?: string;  // Formatted as YYYY-MM-DD (DateOnly)
  startTime?: string; // Formatted as HH:mm:ss (TimeOnly)
  endTime?: string;   // Formatted as HH:mm:ss (TimeOnly)
}

// Full details for schedule response
export interface WorkScheduleDetailDTO {
  id: string;
  staffId: string;
  workDate: string;  // ISO Date string
  startTime: string; // ISO Time string
  endTime: string;   // ISO Time string
}

// DTO for creating a new schedule
export interface WorkScheduleCreateDTO {
  workDate: string;  // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss" or "HH:mm"
  endTime: string;   // "HH:mm:ss" or "HH:mm"
}