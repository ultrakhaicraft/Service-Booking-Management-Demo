using AutoMapper;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;
using SERVICE_BOOKING_MANAGEMENT_DAO.Core;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_TESTS;

public sealed class TestDB : IDisposable
{
	private readonly SqliteConnection _connection;
	private int _counter;
	public ServiceBookingManagementDBContext Context { get; }

	public TestDB()
	{
		_connection= new SqliteConnection("DataSource=:memory:");
		_connection.Open();
		var options = new DbContextOptionsBuilder<ServiceBookingManagementDBContext>().UseSqlite(_connection).Options;
		Context = new ServiceBookingManagementDBContext(options);
		Context.Database.EnsureCreated();
	}

	public void Dispose()
	{
		Context.Dispose();
		_connection.Dispose();
	}

	public BookingService CreateBookingService()
	{
		var unitOfWork = new UnitOfWork(Context);
		var mapper = new MapperConfiguration(cfg => cfg.AddMaps(typeof(BookingService).Assembly)).CreateMapper();
		return new BookingService(unitOfWork, mapper);
	}

	public Account AddCustomer(string fullName = "Customer")
	{
		var account = new Account
		{
			FullName = fullName,
			Email = $"user{++_counter}@test.com",
			PasswordHash = "hash",
			Role = AccountRole.Customer,
		};
		Context.Accounts.Add(account);
		Context.SaveChanges();
		return account;
	}

	public Service AddService(int durationMinutes = 60, bool isActive = true)
	{
		var service = new Service
		{
			Name = $"Service {++_counter}",
			Description = "Test service",
			DurationMinutes = durationMinutes,
			Price = 100_000,
			IsActive = isActive,
		};
		Context.Services.Add(service);
		Context.SaveChanges();
		return service;
	}

	public Staff AddStaff(string fullName = "Staff", bool isActive = true)
	{
		var staff = new Staff
		{
			FullName = fullName,
			Email = $"staff{++_counter}@test.com",
			IsActive = isActive,
		};
		Context.Staffs.Add(staff);
		Context.SaveChanges();
		return staff;
	}

	/// <param name="start">"HH:mm"</param>
	/// <param name="end">"HH:mm"</param>
	public WorkSchedule AddShift(Staff staff, DateOnly date, string start, string end)
	{
		var shift = new WorkSchedule
		{
			StaffId = staff.Id,
			WorkDate = date,
			StartTime = TimeOnly.Parse(start),
			EndTime = TimeOnly.Parse(end),
		};
		Context.WorkSchedules.Add(shift);
		Context.SaveChanges();
		return shift;
	}

	/// <summary>Inserts a booking directly (bypasses the service rules, so any time/status is possible).</summary>
	public Booking AddBooking(Account customer, Service service, Staff staff, DateTime start,
		BookingStatus status = BookingStatus.Pending)
	{
		var booking = new Booking
		{
			BookingCode = $"BK{Guid.NewGuid():N}"[..14],
			CustomerId = customer.Id,
			ServiceId = service.Id,
			StaffId = staff.Id,
			StartTime = start,
			EndTime = start.AddMinutes(service.DurationMinutes),
			Status = status,
			CreatedAt = DateTime.UtcNow,
		};
		Context.Bookings.Add(booking);
		Context.SaveChanges();
		return booking;
	}
}
