using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;

public class ServiceManagementService : IServiceManagementService
{
	private readonly IUnitOfWork _unitOfWork;
	private readonly IGenericRepository<Service> _serviceRepository;
	private readonly IMapper _mapper;

	public ServiceManagementService(IUnitOfWork unitOfWork, IMapper mapper)
	{
		_unitOfWork = unitOfWork;
		_serviceRepository = _unitOfWork.GetRepository<Service>();
		_mapper = mapper;
	}


	//Get a list of services
	public async Task<PagingModel<ServiceDetailDTO>> GetServicesListAsync(
	   ServiceQuery query)
	{
		//Perform Filter if needed
		var services = _serviceRepository.GetQueryable().AsNoTracking();

		if (!string.IsNullOrWhiteSpace(query.Name))
		{
			var name = query.Name.Trim();
			services = services.Where(s => s.Name.Contains(name));
		}

		if (query.IsActive.HasValue)
		{
			services = services.Where(s => s.IsActive==query.IsActive.Value);
		}

		//Filter based on price ranges
		if (query.StartPrice.HasValue)
		{
			services = services.Where(s => s.Price >= query.StartPrice.Value);
		}
			

		if (query.EndPrice.HasValue)
		{
			services = services.Where(s => s.Price <= query.EndPrice.Value);
		}
			

		var totalCount = await services.CountAsync();

		//Fetch Data, with paging done in Database side
		var data = await services
			.OrderBy(s => s.Name).ThenBy(s=>s.Id)
			.Skip((query.PageIndex - 1) * query.PageSize)
			.Take(query.PageSize)
			.ProjectTo<ServiceDetailDTO>(_mapper.ConfigurationProvider)
			.ToListAsync();

		return new PagingModel<ServiceDetailDTO>
		{
			PageIndex = query.PageIndex,
			PageSize = query.PageSize,
			TotalCount = totalCount,
			TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize),
			Data = data
		};
	}

	//Create services
	public async Task<ServiceDetailDTO> CreateServiceAsync(
		ServiceCreateDTO dto)
	{

		//Set isActive is true and handle trim in Mapper
		var services = _mapper.Map<Service>(dto);

		await _serviceRepository.InsertAsync(services);
		await _unitOfWork.SaveAsync();

		return _mapper.Map<ServiceDetailDTO>(services);
	}

	//Update service
	public async Task UpdateServiceAsync(Guid id, ServiceUpdateDTO request)
	{
		var service = await _serviceRepository.FindAsync(w => w.Id == id)
			?? throw new NotFoundException($"Services with Id: '{id}' was not found.");


		_mapper.Map(request, service);  

		await _serviceRepository.UpdateAsync(service);
		await _unitOfWork.SaveAsync();
	}

	//Delete service (Optional)
	public async Task DeleteServiceAsync(Guid id)
	{
		var services = await _serviceRepository.FindAsync(w => w.Id == id)
			?? throw new NotFoundException($"Services with Id: '{id}' was not found.");

		//Check if there is staff entity in Booking and WorkSchedule to prevent accidental deletion
		var hasBookings = await _unitOfWork.GetRepository<Booking>().GetQueryable()
			.AnyAsync(b => b.ServiceId == id);
		

		if (hasBookings)
			throw new ConflictException(
				"This service still has bookings and cannot be deleted. Deactivate them instead.");

		await _serviceRepository.DeleteAsync(services);
		await _unitOfWork.SaveAsync();
	}
}
