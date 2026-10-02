using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

namespace SERVICE_BOOKING_MANAGEMENT_TESTS;

public class BookingService_CreateTests
{

	private static BookingCreateDTO Dto(Service service, Staff staff, DateTime start) =>
	   new() { ServiceId = service.Id, StaffId = staff.Id, StartTime = start };

	private static (Account customer, Service service, Staff staff) Seed(TestDB db)
	{
		var customer = db.AddCustomer();
		var service = db.AddService(60);
		var staff = db.AddStaff();
		db.AddShift(staff, TestTime.TomorrowDate, "08:00", "18:00");
		return (customer, service, staff);
	}

	// ---------- TC1: no booking in the past ----------

	[Fact]
	public async Task CreateBooking_StartTimeInThePast_ThrowsBadRequest()
	{
		using var db = new TestDB();
		var (customer, service, staff) = Seed(db);
		var sut = db.CreateBookingService();

		await Assert.ThrowsAsync<BadRequestException>(() =>
		   sut.CreateBookingAsync(customer.Id, Dto(service, staff, DateTime.Now.AddHours(-2))));
	}

	// ---------- TC2: booking must be inside working hours ----------

	[Theory]
	[InlineData(8, 30)]  // starts before the shift (shift is 09:00-12:00)
	[InlineData(11, 30)] // 11:30-12:30 runs past the end of the shift
	[InlineData(13, 0)]  // after the shift
	public async Task CreateBooking_OutsideWorkingHours_ThrowsBadRequest(int hour, int minute)
	{
		using var db = new TestDB();
		var customer = db.AddCustomer();
		var service = db.AddService(60);
		var staff = db.AddStaff();
		db.AddShift(staff, TestTime.TomorrowDate, "09:00", "12:00");
		var sut = db.CreateBookingService();

		await Assert.ThrowsAsync<BadRequestException>(() =>
			sut.CreateBookingAsync(customer.Id, Dto(service, staff, TestTime.Tomorrow(hour, minute))));
	}

	[Fact]
	public async Task CreateBooking_StaffHasNoShiftThatDay_ThrowsBadRequest()
	{
		using var db = new TestDB();
		var customer = db.AddCustomer();
		var service = db.AddService(60);
		var staff = db.AddStaff(); // no shift added
		var sut = db.CreateBookingService();

		await Assert.ThrowsAsync<BadRequestException>(() =>
			sut.CreateBookingAsync(customer.Id, Dto(service, staff, TestTime.Tomorrow(9))));
	}

	[Fact]
	public async Task CreateBooking_StartingExactlyAtShiftStartAndEndingAtShiftEnd_Succeeds()
	{
		using var db = new TestDB();
		var customer = db.AddCustomer();
		var service = db.AddService(60);
		var staff = db.AddStaff();
		db.AddShift(staff, TestTime.TomorrowDate, "09:00", "10:00"); // exactly one hour
		var sut = db.CreateBookingService();

		var result = await sut.CreateBookingAsync(customer.Id, Dto(service, staff, TestTime.Tomorrow(9)));

		Assert.Equal(TestTime.Tomorrow(10), result.EndTime);
	}

	// ---------- TC3: no overlapping bookings for the same staff member ----------

	[Theory]
	[InlineData(8, 30)] // 08:30-09:30 overlaps the start of 09:00-10:00
	[InlineData(9, 0)]  // identical time
	[InlineData(9, 30)] // 09:30-10:30 overlaps the end
	public async Task CreateBooking_OverlapsExistingBooking_ThrowsConflict(int hour, int minute)
	{
		using var db = new TestDB();
		var (customer, service, staff) = Seed(db);
		var other = db.AddCustomer();
		var sut = db.CreateBookingService();

		await sut.CreateBookingAsync(customer.Id, Dto(service, staff, TestTime.Tomorrow(9)));

		await Assert.ThrowsAsync<ConflictException>(() =>
			sut.CreateBookingAsync(other.Id, Dto(service, staff, TestTime.Tomorrow(hour, minute))));
	}
}
