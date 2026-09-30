using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;

public interface IBookingService
{
	Task<BookingDetailDTO> CreateBookingAsync(Guid customerId, BookingCreateDTO dto);
	Task<PagingModel<BookingDetailDTO>> GetMyBookingsAsync(Guid customerId, BookingQuery query);
	Task<List<AvailableSlotDTO>> GetAvailableSlotsAsync(AvailableSlotQuery query);
	Task<PagingModel<BookingDetailDTO>> GetBookingListAsync(BookingQuery query);
	Task<BookingViewDTO> CancelBookingAsync(Guid bookingId, Guid callerId, bool isAdmin, BookingCancelDTO dto);
	Task<BookingViewDTO> UpdateBookingStatusAsync(Guid bookingId, BookingUpdateStatusDTO dto);

}
