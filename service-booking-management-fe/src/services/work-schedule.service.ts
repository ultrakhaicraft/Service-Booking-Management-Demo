import { PagingModel } from "@/types/api-and-paging-wrapper";
import { StaffCreateDTO, StaffDetailDTO, StaffUpdateDTO } from "@/types/staff";
import { WorkScheduleCreateDTO, WorkScheduleDetailDTO, WorkScheduleQuery } from "@/types/work-schedule";
import { api } from "./api";


const BASE_PATH = "/api";

export const workScheduleService = {
  getScheduleByStaffId(staffId: string, query: WorkScheduleQuery = {}, signal?: AbortSignal): Promise<PagingModel<WorkScheduleDetailDTO>> {
    return api.get<PagingModel<WorkScheduleDetailDTO>>(`${BASE_PATH}/staffs/${staffId}/schedules`, { query: { ...query }, signal });
  },

  create(staffId:string, dto: WorkScheduleCreateDTO): Promise<WorkScheduleDetailDTO> {
    return api.post<WorkScheduleDetailDTO>(`${BASE_PATH}/staffs/${staffId}/schedules`, dto);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`${BASE_PATH}/staffs/schedules/${id}`);
  },
};