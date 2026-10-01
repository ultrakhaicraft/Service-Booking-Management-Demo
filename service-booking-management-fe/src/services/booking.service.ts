import { PagingModel } from "@/types/api-and-paging-wrapper";
import { BookingQuery, BookingDetailDTO, AvailableSlotQuery, AvailableSlotDTO, BookingCreateDTO, BookingCancelDTO, BookingViewDTO, BookingUpdateStatusDTO } from "@/types/booking";
import { api } from "./api";

const BASE_PATH = "/api/bookings";
 
export const bookingService = {
  /** GET /api/bookings: every booking (admin screen). Filter by date (YYYY-MM-DD) and status. */
  getBookings(query: BookingQuery = {}, signal?: AbortSignal): Promise<PagingModel<BookingDetailDTO>> {
    return api.get<PagingModel<BookingDetailDTO>>(BASE_PATH, { query: { ...query }, signal });
  },
 
  /** GET /api/bookings/my-bookings: the logged-in customer's own bookings. */
  getMyBookings(query: BookingQuery = {}, signal?: AbortSignal): Promise<PagingModel<BookingDetailDTO>> {
    return api.get<PagingModel<BookingDetailDTO>>(`${BASE_PATH}/my-bookings`, { query: { ...query }, signal });
  },
 
  /** GET /api/bookings/available-slots?serviceId=&date=&staffId= (returns a plain list, not paged). */
  getAvailableSlots(query: AvailableSlotQuery, signal?: AbortSignal): Promise<AvailableSlotDTO[]> {
    return api.get<AvailableSlotDTO[]>(`${BASE_PATH}/available-slots`, { query: { ...query }, signal });
  },
 
  /** POST /api/bookings (Customer only). Send the slot's startTime string exactly as received. 409 = slot taken. */
  create(dto: BookingCreateDTO): Promise<BookingDetailDTO> {
    return api.post<BookingDetailDTO>(BASE_PATH, dto);
  },
 
  /** POST /api/bookings/{id}/cancel: owner or admin; Pending and Confirmed only. A reason is required. */
  cancel(id: string, dto: BookingCancelDTO): Promise<BookingViewDTO> {
    return api.post<BookingViewDTO>(`${BASE_PATH}/${id}/cancel`, dto);
  },
 
  /** PATCH /api/bookings/{id}/status (Admin): only Pending -> Confirmed -> Completed. */
  updateStatus(id: string, dto: BookingUpdateStatusDTO): Promise<BookingViewDTO> {
    return api.patch<BookingViewDTO>(`${BASE_PATH}/${id}/status`, dto);
  },
};
 