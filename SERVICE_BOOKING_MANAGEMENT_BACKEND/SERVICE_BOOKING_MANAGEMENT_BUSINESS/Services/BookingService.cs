using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;

public class BookingService : IBookingService
{
	private readonly IUnitOfWork _unitOfWork;
	private readonly IGenericRepository<Service> _serviceRepository;
	private readonly IGenericRepository<Booking> _bookingRepository;
	private readonly IGenericRepository<Staff> _staffRepository;
	private readonly IGenericRepository<WorkSchedule> _workScheduleRepository;
	private readonly IMapper _mapper;

	public BookingService(IUnitOfWork unitOfWork, IMapper mapper)
	{
		_unitOfWork = unitOfWork;
		_serviceRepository = _unitOfWork.GetRepository<Service>();
		_bookingRepository = _unitOfWork.GetRepository<Booking>();
		_staffRepository = _unitOfWork.GetRepository<Staff>();
		_workScheduleRepository = _unitOfWork.GetRepository<WorkSchedule>();
		_mapper = mapper;
	}

	public async Task<List<AvailableSlotDTO>> GetAvailableSlotsAsync(AvailableSlotQuery query)
	{
		//Load the service to looking for
		var service = await _serviceRepository.GetQueryable().AsNoTracking()
			.Where(s=>s.Id==query.ServiceId)
			.FirstOrDefaultAsync()
			?? throw new NotFoundException("Can't find service with Id: "+query.ServiceId);

		if (!service.IsActive)
		{
			throw new BadRequestException("This service is locked and cannot be booked.");

		}

		//Define day start,day end and duration for comparison 
		var date = query.Date!.Value;
		var dayStart = date.ToDateTime(TimeOnly.MinValue);
		var dayEnd = dayStart.AddDays(1);
		var serviceDuration = TimeSpan.FromMinutes(service.DurationMinutes);

		//Get non-locked Staff, Customer can also search through Id
		//This is to check their work schedules
		var staffquery = _staffRepository.GetQueryable().Where(s => s.IsActive==true);

		if (query.StaffId.HasValue)
			staffquery = staffquery.Where(s => s.Id == query.StaffId.Value);

		//CandidateStaff is a list of staff suitable
		var candidateStaff = await staffquery.Select(s => new { s.Id, s.FullName }).ToListAsync();
		var staffIds = candidateStaff.Select(s => s.Id).ToList();

		//Get work schedules
		var shifts = await _workScheduleRepository.GetQueryable().AsNoTracking()
			.Where(w => staffIds.Contains(w.StaffId) && w.WorkDate == date)
			.ToListAsync();

		//Get booking that the staff is occupied
		var occupiedBooking = await _bookingRepository.GetQueryable().AsNoTracking()
			.Where(b => staffIds.Contains(b.StaffId)
				 && b.Status != BookingStatus.Cancelled
				 && b.StartTime < dayEnd && b.EndTime > dayStart)
			.Select(b => new { b.StaffId, b.StartTime, b.EndTime })
			.ToListAsync();

		var result = new List<AvailableSlotDTO>();


		foreach(var staff in candidateStaff)
		{
			//List of bookings already exist
			var exisitingstaffBookings = occupiedBooking.Where(b => b.StaffId == staff.Id).ToList();

			//Get shift from specific staff
			foreach(var shift in shifts.Where(w=>w.StaffId==staff.Id))
			{
				var staffShiftStart = date.ToDateTime(shift.StartTime);
				var staffShiftEnd = date.ToDateTime(shift.EndTime);

				//Loop through the staff shift from start to end with newServiceStart and increment it by 30 minutes each loop
				for (var newServiceStart = staffShiftStart; newServiceStart + serviceDuration <= staffShiftEnd; newServiceStart = newServiceStart.AddMinutes(30))
				{
					var newServiceEnd = newServiceStart + serviceDuration;

					if (newServiceStart <= Now()) continue; //Skip past slots relative to current time
					if (exisitingstaffBookings.Any(b=> newServiceStart < b.EndTime && newServiceEnd > b.StartTime))
					{
						continue;
					}

					result.Add(new AvailableSlotDTO
					{
						StaffId = staff.Id,
						StaffFullName = staff.FullName,
						StartTime = newServiceStart,
						EndTime = newServiceEnd
					});
				}
			}
		}

		return result.OrderBy(s=>s.StartTime).ThenBy(s => s.StaffFullName).ToList();
	}

	public async Task<BookingDetailDTO> CreateBookingAsync(Guid customerId, BookingCreateDTO dto)
	{
		var newServiceStart = dto.StartTime;

		if (newServiceStart <= Now())
			throw new BadRequestException("Booking start time must be in the future.");

		//Check for active service
		var service = await _unitOfWork.GetRepository<Service>().GetQueryable().AsNoTracking()
			.FirstOrDefaultAsync(s => s.Id == dto.ServiceId)
			?? throw new NotFoundException("Service was not found.");
		if (!service.IsActive)
			throw new BadRequestException("This service is locked and cannot be booked.");

		//Check for service staff
		var staff = await _unitOfWork.GetRepository<Staff>().GetQueryable().AsNoTracking()
			.FirstOrDefaultAsync(s => s.Id == dto.StaffId)
			?? throw new NotFoundException("Staff was not found.");
		if (!staff.IsActive)
			throw new BadRequestException("This staff member is locked and cannot be booked.");

		
		var newServiceEnd = newServiceStart.AddMinutes(service.DurationMinutes);

		// Look for one shift of that staff member on a specific date
		var date = DateOnly.FromDateTime(newServiceStart);
		var startTime = TimeOnly.FromDateTime(newServiceStart);
		var endTime = TimeOnly.FromDateTime(newServiceEnd);

		var insideShift = newServiceEnd.Date == newServiceStart.Date              
			&& await _unitOfWork.GetRepository<WorkSchedule>().GetQueryable()
				.AnyAsync(w => w.StaffId == dto.StaffId
							&& w.WorkDate == date
							&& w.StartTime <= startTime
							&& w.EndTime >= endTime);
		if (!insideShift)
			throw new BadRequestException("The booking must be entirely within the staff member's working hours.");

		// No overlap with a non-cancelled booking of the same staff member
		var bookingRepository = _unitOfWork.GetRepository<Booking>();

		var hasConflict = await bookingRepository.GetQueryable()
			.AnyAsync(b => b.StaffId == dto.StaffId
						&& b.Status != BookingStatus.Cancelled
						&& newServiceStart < b.EndTime
						&& newServiceEnd > b.StartTime);
		if (hasConflict)
			throw new ConflictException("This time slot is already booked for the selected staff member.");

		//Saving Data
		var booking = _mapper.Map<Booking>(dto);
		booking.CustomerId = customerId;
		booking.EndTime = newServiceEnd;
		booking.Status = BookingStatus.Pending;
		booking.BookingCode = await GenerateBookingCodeAsync(bookingRepository);
		booking.CreatedAt = DateTime.UtcNow;

		await bookingRepository.InsertAsync(booking);
		await _unitOfWork.SaveAsync();

		
		return await bookingRepository.GetQueryable().AsNoTracking()
			.Where(b => b.Id == booking.Id)
			.ProjectTo<BookingDetailDTO>(_mapper.ConfigurationProvider)
			.FirstAsync();
	}

	public async Task<PagingModel<BookingDetailDTO>> GetMyBookingsAsync(Guid customerId, BookingQuery query)
	{
		//Get booking that belong to their customer 
		var bookings = _unitOfWork.GetRepository<Booking>().GetQueryable()
		.AsNoTracking()
		.Where(b => b.CustomerId == customerId);

		bookings = ApplyBookingFilters(bookings, query);

		if (bookings is null)
		{
			throw new NotFoundException("Unable to find your list of bookings");
		}

		var totalCount = await bookings.CountAsync();

		var data = await bookings
			.OrderByDescending(b => b.StartTime).ThenBy(b => b.Id)   // newest first, stable order
			.Skip((query.PageIndex - 1) * query.PageSize)
			.Take(query.PageSize)
			.ProjectTo<BookingDetailDTO>(_mapper.ConfigurationProvider)
			.ToListAsync();

		return new PagingModel<BookingDetailDTO>
		{
			PageIndex = query.PageIndex,
			PageSize = query.PageSize,
			TotalCount = totalCount,
			TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize),
			Data = data
		};
	}

	public async Task<PagingModel<BookingDetailDTO>> GetBookingListAsync(BookingQuery query)
	{
		//Get booking that belong to their customer 
		var bookings = _unitOfWork.GetRepository<Booking>().GetQueryable().AsNoTracking();

		bookings = ApplyBookingFilters(bookings, query);

		if (bookings is null)
		{
			throw new NotFoundException("Unable to find the list of bookings");
		}

		var totalCount = await bookings.CountAsync();

		var data = await bookings
			.OrderByDescending(b => b.StartTime).ThenBy(b => b.Id)   // newest first, stable order
			.Skip((query.PageIndex - 1) * query.PageSize)
			.Take(query.PageSize)
			.ProjectTo<BookingDetailDTO>(_mapper.ConfigurationProvider)
			.ToListAsync();

		return new PagingModel<BookingDetailDTO>
		{
			PageIndex = query.PageIndex,
			PageSize = query.PageSize,
			TotalCount = totalCount,
			TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize),
			Data = data
		};
	}

	public async Task<BookingViewDTO> CancelBookingAsync(
	Guid bookingId, Guid callerId, bool isAdmin, BookingCancelDTO dto)
	{
		var reason = dto.Reason?.Trim();
		if (string.IsNullOrWhiteSpace(reason))
			throw new BadRequestException("A cancellation reason is required.");

		var bookingRepository = _unitOfWork.GetRepository<Booking>();

		var booking = await bookingRepository.GetQueryable()      
			.FirstOrDefaultAsync(b => b.Id == bookingId);

		// Missing, or someone else's booking and the caller isn't admin
		if (booking is null || (!isAdmin && booking.CustomerId != callerId))
			throw new NotFoundException($"Booking '{bookingId}' was not found.");

		if (booking.Status == BookingStatus.Cancelled)
			throw new ConflictException("This booking is already cancelled.");
		if (booking.Status == BookingStatus.Completed)
			throw new ConflictException("A completed booking cannot be cancelled.");
		if (booking.StartTime <= Now() && booking.Status == BookingStatus.Confirmed)
			throw new ConflictException("A booking that has already started cannot be cancelled.");

		booking.Status = BookingStatus.Cancelled;
		booking.CancellationReason = reason;

		await bookingRepository.UpdateAsync(booking);
		await _unitOfWork.SaveAsync();

		return await bookingRepository.GetQueryable().AsNoTracking()
			.Where(b => b.Id == bookingId)
			.ProjectTo<BookingViewDTO>(_mapper.ConfigurationProvider)
			.FirstAsync();
	}

	public async Task<BookingViewDTO> UpdateBookingStatusAsync(Guid bookingId, BookingUpdateStatusDTO dto)
	{
		var newStatus = dto.Status
			?? throw new BadRequestException("Status is required.");

		if (newStatus == BookingStatus.Cancelled)
			throw new BadRequestException(
				"To cancel a booking use POST /api/bookings/{id}/cancel (a reason is required).");

		var bookingRepository = _unitOfWork.GetRepository<Booking>();

		var booking = await bookingRepository.GetQueryable()      // tracked, so changes are saved
			.FirstOrDefaultAsync(b => b.Id == bookingId)
			?? throw new NotFoundException($"Booking '{bookingId}' was not found.");

		var allowed = (booking.Status, newStatus) switch
		{
			(BookingStatus.Pending, BookingStatus.Confirmed) => true,
			(BookingStatus.Confirmed, BookingStatus.Completed) => true,
			_ => false
		};

		if (!allowed)
			throw new ConflictException(
				$"A booking cannot move from {booking.Status} to {newStatus}.");

		booking.Status = newStatus;

		await bookingRepository.UpdateAsync(booking);
		await _unitOfWork.SaveAsync();

		return await bookingRepository.GetQueryable().AsNoTracking()
			.Where(b => b.Id == bookingId)
			.ProjectTo<BookingViewDTO>(_mapper.ConfigurationProvider)
			.FirstAsync();
	}

	/// <summary>
	/// Used for compare service start time with current time
	/// </summary>
	/// <returns></returns>
	private static DateTime Now() => DateTime.Now;

	private static async Task<string> GenerateBookingCodeAsync(
	IGenericRepository<Booking> repository)
	{
		for (var attempt = 0; attempt < 5; attempt++)
		{
			var code = $"BK-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
			var exists = await repository.GetQueryable().AnyAsync(b => b.BookingCode == code);
			if (!exists) return code;
		}
		throw new InvalidOperationException("Could not generate a unique booking code.");
	}

	private static IQueryable<Booking> ApplyBookingFilters(IQueryable<Booking> bookings, BookingQuery query)
	{
		if (query.Date.HasValue)
		{
			var dayStart = query.Date.Value.ToDateTime(TimeOnly.MinValue);
			var dayEnd = dayStart.AddDays(1);
			bookings = bookings.Where(b => b.StartTime >= dayStart && b.StartTime < dayEnd);
		}

		if (query.Status.HasValue)
			bookings = bookings.Where(b => b.Status == query.Status.Value);

		return bookings;
	}

}
