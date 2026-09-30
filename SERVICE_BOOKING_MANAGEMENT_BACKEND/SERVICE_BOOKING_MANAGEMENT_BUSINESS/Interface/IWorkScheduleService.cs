using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;

public interface IWorkScheduleService
{
	public Task<PagingModel<WorkScheduleDetailDTO>> GetSchedulesByStaffId(Guid StaffId,
	   WorkScheduleQuery query, CancellationToken ct = default);
	public Task<WorkScheduleDetailDTO> CreateSchedule(Guid StaffId,
			WorkScheduleCreateDTO dto);
	public Task DeleteScheduleAsync(Guid id);

}
