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

public class StaffService : IStaffService
{
	private readonly IUnitOfWork _unitOfWork;
	private readonly IGenericRepository<Staff> _staffRepository;
	private readonly IMapper _mapper;

	public StaffService(IUnitOfWork unitOfWork, IMapper mapper)
	{
		_unitOfWork = unitOfWork;
		_staffRepository = _unitOfWork.GetRepository<Staff>();
		_mapper = mapper;
	}

	//Get a list of staff
	public async Task<PagingModel<StaffDetailDTO>> GetStaffsAsync(
	   StaffQueryDto query, CancellationToken ct = default)
	{
		//Perform Filter if needed
		var staffs = _staffRepository.GetQueryable().AsNoTracking();

		if (!string.IsNullOrWhiteSpace(query.FullName))
		{
			var name = query.FullName.Trim();
			staffs = staffs.Where(s => s.FullName.Contains(name));
		}

		if (!string.IsNullOrWhiteSpace(query.Email))
		{
			var email = query.Email.Trim().ToLowerInvariant();   // emails are stored lowercased
			staffs = staffs.Where(s => s.Email.Contains(email));
		}

		if(query.IsActive.HasValue)
		{
			staffs = staffs.Where(s=>s.IsActive==query.IsActive.Value);
		}

		var totalCount = await staffs.CountAsync(ct);           

		if(totalCount <= 0)
		{
			throw new NotFoundException("Unable to find staffs, please add new staff or change the filter");
		}

		//Fetch Data, with paging done in Database side
		var data = await staffs
			.OrderBy(s => s.FullName)    
			.Skip((query.PageIndex - 1) * query.PageSize)       
			.Take(query.PageSize)                                
			.ProjectTo<StaffDetailDTO>(_mapper.ConfigurationProvider)
			.ToListAsync(ct);

		return new PagingModel<StaffDetailDTO>
		{
			PageIndex = query.PageIndex,
			PageSize = query.PageSize,
			TotalCount = totalCount,
			TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize),
			Data = data
		};
	}

	//Create staff
	public async Task<StaffDetailDTO> CreateStaffAsync(
		StaffCreateDTO dto)
	{
		var email = dto.Email.Trim();

		var emailTaken = await _staffRepository.GetQueryable().AnyAsync(s => s.Email == email);

		if (emailTaken)
			throw new ConflictException($"A staff member with email '{email}' already exists.");

		//Set isActive is true and handle trim in Mapper
		var staff = _mapper.Map<Staff>(dto);                     

		await _staffRepository.InsertAsync(staff);
		await _unitOfWork.SaveAsync();

		return _mapper.Map<StaffDetailDTO>(staff);
	}

	//Update staff
	public async Task UpdateStaffAsync(Guid id, StaffUpdateDTO request)
	{
		var staff = await _staffRepository.FindAsync(w => w.Id == id)
			?? throw new NotFoundException($"Staff '{id}' was not found.");

		var email = request.Email.Trim();
		var emailTaken = await _staffRepository.GetQueryable()
			.AnyAsync(s => s.Email == email && s.Id != id);
		if (emailTaken)
			throw new ConflictException($"A staff member with email '{email}' already exists.");

		_mapper.Map(request, staff);

		await _staffRepository.UpdateAsync(staff);
		await _unitOfWork.SaveAsync();
	}

	//Delete staff
	public async Task DeleteStaffAsync(Guid id)
	{
		var staff =  _staffRepository.FindAsync(w=>w.Id == id)
			?? throw new NotFoundException($"Staff '{id}' was not found.");

		//Check if there is staff entity in Booking and WorkSchedule to prevent accidental deletion
		var hasBookings =  await _unitOfWork.GetRepository<Booking>().GetQueryable()
			.AnyAsync(b => b.StaffId == id);
		var hasSchedules =await  _unitOfWork.GetRepository<WorkSchedule>().GetQueryable()
			.AnyAsync(w => w.StaffId == id);

		if (hasBookings || hasSchedules)
			throw new ConflictException(
				"This staff member has bookings or work schedules and cannot be deleted. Deactivate them instead.");

		await _staffRepository.DeleteAsync(staff);
		await _unitOfWork.SaveAsync();
	}
}
