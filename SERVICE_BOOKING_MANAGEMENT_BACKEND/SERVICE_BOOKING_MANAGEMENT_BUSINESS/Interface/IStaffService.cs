using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;

public interface IStaffService
{
	public Task<PagingModel<StaffDetailDTO>> GetStaffsAsync(
	   StaffQueryDto query, CancellationToken ct = default);
	public Task<StaffDetailDTO> CreateStaffAsync(
		StaffCreateDTO dto);
	public Task UpdateStaffAsync(Guid id, StaffUpdateDTO request);

	public Task DeleteStaffAsync(Guid id);

}
