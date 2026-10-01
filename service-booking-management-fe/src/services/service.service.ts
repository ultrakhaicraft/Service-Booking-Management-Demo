// src/services/service-management.service.ts
// NOTE: adjust the two import paths below to wherever your types actually live.
import { api } from "@/services/api";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import { ServiceQuery, ServiceDetailDTO, ServiceCreateDTO, ServiceUpdateDTO } from "@/types/service";


const BASE_PATH = "/api/services";

export const serviceManagementService = {
  /** GET /api/services?name=&isActive=&startPrice=&endPrice=&pageIndex=&pageSize= */
  getServices(query: ServiceQuery = {}, signal?: AbortSignal): Promise<PagingModel<ServiceDetailDTO>> {
    // Spread into a plain object: interfaces are not assignable to QueryParams directly.
    return api.get<PagingModel<ServiceDetailDTO>>(BASE_PATH, { query: { ...query }, signal });
  },

  /** POST /api/services (Admin) */
  create(dto: ServiceCreateDTO): Promise<ServiceDetailDTO> {
    return api.post<ServiceDetailDTO>(BASE_PATH, dto);
  },

  /** PUT /api/services/{id} (Admin). Also used to lock/unlock via isActive, so send the full DTO. */
  async update(id: string, dto: ServiceUpdateDTO): Promise<void> {
    await api.put<void>(`${BASE_PATH}/${id}`, dto);
  },

  /** DELETE /api/services/{id} (Admin). Backend answers 409 if the service already has bookings. */
  async remove(id: string): Promise<void> {
    await api.delete<void>(`${BASE_PATH}/${id}`);
  },
};