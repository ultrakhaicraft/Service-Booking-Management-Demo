import { PagingQuery } from './api';

// Enum mirroring backend BookingStatus
export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Full detailed booking info (e.g., for detailed view/modal)
export interface BookingDetailDTO {
  id: string; // C# Guid
  bookingCode: string;
  customerId: string;
  customerFullName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffFullName: string;
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
  status: BookingStatus;
  customerNote?: string | null;
  cancellationReason?: string | null;
  createdAt: string; // ISO DateTime string
}

// Lightweight booking item (e.g., for list/table views)
export interface BookingViewDTO {
  id: string;
  bookingCode: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

// Payload for creating a new booking
export interface BookingCreateDTO {
  serviceId: string;
  staffId: string;
  startTime: string; // ISO DateTime string
  customerNote?: string;
}

// Payload for updating booking status (Admin / Staff)
export interface BookingUpdateStatusDTO {
  status: BookingStatus;
}

// Payload for cancelling a booking
export interface BookingCancelDTO {
  reason: string;
}

// Query filter parameters extending base pagination
export interface BookingQuery extends PagingQuery {
  date?: string; // Formatted as "YYYY-MM-DD" (DateOnly)
  status?: BookingStatus;
}

// Parameters to query available time slots
export interface AvailableSlotQuery {
  serviceId: string;
  date: string; // Formatted as "YYYY-MM-DD" (DateOnly)
  staffId?: string;
}

// Computed time slot available for selection
export interface AvailableSlotDTO {
  staffId: string;
  staffFullName: string;
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
}