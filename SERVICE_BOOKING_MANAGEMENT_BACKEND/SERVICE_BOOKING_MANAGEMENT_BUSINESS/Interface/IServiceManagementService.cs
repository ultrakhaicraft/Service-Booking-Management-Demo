using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;

public interface IServiceManagementService
{
	public Task<PagingModel<ServiceDetailDTO>> GetServicesListAsync(
	   ServiceQuery query);
	public Task<ServiceDetailDTO> CreateServiceAsync(
		ServiceCreateDTO dto);
	public Task UpdateServiceAsync(Guid id, ServiceUpdateDTO request);

	public Task DeleteServiceAsync(Guid id);

}
