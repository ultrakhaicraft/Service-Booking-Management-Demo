using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_TESTS;

public class BookingService_QueryTests
{


	// ---------- TC4: a customer only sees their own bookings ----------

	[Fact]
	public async Task GetMyBookings_ReturnsOnlyTheCallersBookings()
	{
		using var db = new TestDB();
		var alice = db.AddCustomer("Alice");
		var bob = db.AddCustomer("Bob");
		var service = db.AddService(60);
		var staff = db.AddStaff();
		db.AddBooking(alice, service, staff, TestTime.Tomorrow(9));
		db.AddBooking(alice, service, staff, TestTime.Tomorrow(11));
		db.AddBooking(bob, service, staff, TestTime.Tomorrow(13));
		var sut = db.CreateBookingService();

		var result = await sut.GetMyBookingsAsync(alice.Id, new BookingQuery { PageIndex = 1, PageSize = 10 });

		Assert.Equal(2, result.TotalCount);
		Assert.All(result.Data!, b => Assert.Equal(alice.Id, b.CustomerId));
	}
}
