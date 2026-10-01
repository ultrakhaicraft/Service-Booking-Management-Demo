// src/services/service-management.service.ts
// NOTE: adjust the two import paths below to wherever your types actually live.
import { api } from "@/services/api";
import type { PagingModel } from "@/types/api-and-paging-wrapper";
import { StaffCreateDTO, StaffDetailDTO, StaffQueryDto, StaffUpdateDTO } from "@/types/staff";


const BASE_PATH = "/api/staffs";

export const staffService = {
  getStaffs(query: StaffQueryDto = {}, signal?: AbortSignal): Promise<PagingModel<StaffDetailDTO>> {
    // Spread into a plain object: interfaces are not assignable to QueryParams directly.
    return api.get<PagingModel<StaffDetailDTO>>(BASE_PATH, { query: { ...query }, signal });
  },

  create(dto: StaffCreateDTO): Promise<StaffDetailDTO> {
    return api.post<StaffDetailDTO>(BASE_PATH, dto);
  },

  async update(id: string, dto: StaffUpdateDTO): Promise<void> {
    await api.put<void>(`${BASE_PATH}/${id}`, dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`${BASE_PATH}/${id}`);
  },
};