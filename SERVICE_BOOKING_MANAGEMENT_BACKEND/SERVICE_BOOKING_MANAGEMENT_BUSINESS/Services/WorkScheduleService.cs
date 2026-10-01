using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Core;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;

public class WorkScheduleService : IWorkScheduleService
{
	private readonly IUnitOfWork _unitOfWork;
	private readonly IGenericRepository<WorkSchedule> _workScheduleRepository;
	private readonly IGenericRepository<Staff> _staffRepository;
	private readonly IGenericRepository<Booking> _bookingRepository;
	private readonly IMapper _mapper;

	public WorkScheduleService(IUnitOfWork unitOfWork, IMapper mapper)
	{
		_unitOfWork = unitOfWork;
		_workScheduleRepository = _unitOfWork.GetRepository<WorkSchedule>();
		_staffRepository = _unitOfWork.GetRepository<Staff>();
		_bookingRepository = _unitOfWork.GetRepository<Booking>();
		_mapper = mapper;
	}

	//Get list of schedules by staff Id
	public async Task<PagingModel<WorkScheduleDetailDTO>> GetSchedulesByStaffId(Guid StaffId,
	   WorkScheduleQuery query, CancellationToken ct = default)
	{
		//Get by Staff Id
		var staffExists = await _staffRepository.GetQueryable().AnyAsync(s => s.Id == StaffId, ct);
		if (!staffExists)
			throw new NotFoundException($"Staff '{StaffId}' was not found.");

		var schedules = _workScheduleRepository.GetQueryable()
			.AsNoTracking()
			.Where(w => w.StaffId == StaffId);

		//Filter WorkDate, StartTime and EndTime

		if (query.WorkDate.HasValue)
			schedules = schedules.Where(w => w.WorkDate == query.WorkDate.Value);

		if (query.StartTime.HasValue)
			schedules = schedules.Where(w => w.StartTime >= query.StartTime.Value);

		if (query.EndTime.HasValue)
			schedules = schedules.Where(w => w.EndTime <= query.EndTime.Value);


		var totalCount = await schedules.CountAsync(ct);

		if(totalCount <= 0)
		{
			throw new NotFoundException("Unable to find schedules from this staff, please add new schedule or change the filter");
		}

		//Fetch Data, with paging done in Database side
		var data = await schedules
			.Skip((query.PageIndex - 1) * query.PageSize)
			.Take(query.PageSize)
			.ProjectTo<WorkScheduleDetailDTO>(_mapper.ConfigurationProvider) 
			.ToListAsync(ct);

		return new PagingModel<WorkScheduleDetailDTO>
		{
			PageIndex = query.PageIndex,
			PageSize = query.PageSize,
			TotalCount = totalCount,
			TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize),
			Data = data
		};
	}

	//Create a singular schedule for a specific staff Id
	public async Task<WorkScheduleDetailDTO> CreateSchedule(Guid StaffId,
			WorkScheduleCreateDTO dto)
	{
		if (dto.StartTime >= dto.EndTime)
			throw new BadRequestException("Start time must be before end time.");

		var schedules = _workScheduleRepository.GetQueryable().AsNoTracking();

		var staff = await _staffRepository.GetQueryable().AsNoTracking()
			.Where(v => v.Id == StaffId)
			.FirstOrDefaultAsync();

		if(staff == null)
		{
			throw new NotFoundException($"Staff '{StaffId}' was not found.");
		}

		//Không đặt lịch với nhân viên bị khóa.
		if (staff.IsActive == false)
		{
			throw new BadRequestException("This Staff is locked because IsActive is false, please use other staff or set IsActive back to true");
		}

		//Không tạo hai ca làm việc bị trùng cho cùng nhân viên.
		var date = dto.WorkDate;
		var start = dto.StartTime;
		var end = dto.EndTime;

		var IsOverlapped = await schedules.AnyAsync(w => w.StaffId == StaffId
								&& w.WorkDate == date
								&& start < w.StartTime
								&& end > w.EndTime);

		if (IsOverlapped)
			throw new ConflictException("This shift overlaps an existing shift of the same staff member.");

		//Set isActive is true and handle trim in Mapper
		var workSchedule = _mapper.Map<WorkSchedule>(dto);
		workSchedule.StaffId = StaffId;          


		await _workScheduleRepository.InsertAsync(workSchedule);
		await _unitOfWork.SaveAsync();

		return _mapper.Map<WorkScheduleDetailDTO>(workSchedule);
	}

	//Delete a singular schedule by Id
	public async Task DeleteScheduleAsync(Guid id)
	{
		var workSchedule = await _workScheduleRepository.FindAsync(w => w.Id == id)
			?? throw new NotFoundException($"Schedule with Id: '{id}' was not found.");

		var shiftStart = workSchedule.WorkDate.ToDateTime(workSchedule.StartTime);
		var shiftEnd = workSchedule.WorkDate.ToDateTime(workSchedule.EndTime);

		var hasActiveBookings = await _bookingRepository.GetQueryable()
			.AnyAsync(b => b.StaffId == workSchedule.StaffId
						&& (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed)
						&& b.StartTime < shiftEnd
						&& b.EndTime > shiftStart);

		if (hasActiveBookings)
			throw new ConflictException("This shift has active bookings and cannot be deleted.");

		await _workScheduleRepository.DeleteAsync(workSchedule);
		await _unitOfWork.SaveAsync();
	}
}


	


