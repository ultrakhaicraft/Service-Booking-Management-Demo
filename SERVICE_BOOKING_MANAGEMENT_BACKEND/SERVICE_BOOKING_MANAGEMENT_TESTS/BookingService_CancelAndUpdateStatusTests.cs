using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_TESTS
{
	public class BookingService_CancelAndUpdateStatusTests
	{

		private static (Account customer, Booking booking) SeedBooking(TestDB db, BookingStatus status, DateTime start)
		{
			var customer = db.AddCustomer();
			var service = db.AddService(60);
			var staff = db.AddStaff();
			var booking = db.AddBooking(customer, service, staff, start, status);
			return (customer, booking);
		}

		private static BookingCancelDTO Reason(string reason = "Changed my mind") => new() { Reason = reason };

		// ---------- TC6: cancelling a completed booking ----------

		[Fact]
		public async Task Cancel_CompletedBooking_ThrowsConflict()
		{
			using var db = new TestDB();
			var (customer, booking) = SeedBooking(db, BookingStatus.Completed, DateTime.Now.AddDays(-1));
			var sut = db.CreateBookingService();

			await Assert.ThrowsAsync<ConflictException>(() =>
				sut.CancelBookingAsync(booking.Id, customer.Id, false, Reason()));
		}

		[Fact]
		public async Task Cancel_AlreadyCancelledBooking_ThrowsConflict()
		{
			using var db = new TestDB();
			var (customer, booking) = SeedBooking(db, BookingStatus.Cancelled, TestTime.Tomorrow(9));
			var sut = db.CreateBookingService();

			await Assert.ThrowsAsync<ConflictException>(() =>
				sut.CancelBookingAsync(booking.Id, customer.Id, false, Reason()));
		}
	}
}
