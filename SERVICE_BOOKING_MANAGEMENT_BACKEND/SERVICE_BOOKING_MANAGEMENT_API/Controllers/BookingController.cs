using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using SERVICE_BOOKING_MANAGEMENT_API.Utility;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System.Security.Claims;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingController : Controller
{
	private readonly IBookingService _bookingService;

	public BookingController(IBookingService bookingService)
	{
		_bookingService = bookingService;
	}


	[HttpPost]	
	[Authorize(Roles = nameof(AccountRole.Customer))]
	[ProducesResponseType(typeof(BookingDetailDTO), StatusCodes.Status201Created)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDTO dto)
	{
		var accountId = User.Claims.GetUserIdFromJwtToken();
		var result = await _bookingService.CreateBookingAsync(Guid.Parse(accountId), dto);

		ApiResponseWrapper<BookingDetailDTO> response = ApiResponseWrapper<BookingDetailDTO>
					.Success(result, "Create Booking Successful");

		return StatusCode(StatusCodes.Status201Created, response);
	}

	[HttpGet("my-bookings")]
	[Authorize]
	[ProducesResponseType(typeof(PagingModel<BookingDetailDTO>), StatusCodes.Status200OK)]
	public async Task<IActionResult> GetMyBookings([FromQuery] BookingQuery query)
	{
		var accountId = User.Claims.GetUserIdFromJwtToken();
		var result = await _bookingService.GetMyBookingsAsync(Guid.Parse(accountId), query);

		ApiResponseWrapper<PagingModel<BookingDetailDTO>> response = ApiResponseWrapper<PagingModel<BookingDetailDTO>>
					.Success(result, "Get my booking list successful");

		return Ok(response);
	}

	[HttpGet]
	[Authorize]
	[ProducesResponseType(typeof(PagingModel<BookingDetailDTO>), StatusCodes.Status200OK)]
	public async Task<IActionResult> GetBookings([FromQuery] BookingQuery query)
	{
		
		var result = await _bookingService.GetBookingListAsync( query);

		ApiResponseWrapper<PagingModel<BookingDetailDTO>> response = ApiResponseWrapper<PagingModel<BookingDetailDTO>>
					.Success(result, "Get booking list successful");

		return Ok(response);
	}

	[HttpGet("available-slots")]
	[Authorize]
	[ProducesResponseType(typeof(List<AvailableSlotDTO>), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetMyBookings([FromQuery] AvailableSlotQuery query)
	{
		var result = await _bookingService.GetAvailableSlotsAsync(query);

		ApiResponseWrapper<List<AvailableSlotDTO>> response = ApiResponseWrapper<List<AvailableSlotDTO>>
					.Success(result, "Get available slots for booking successful");

		return Ok(response);
	}

	[HttpPost("{id}/cancel")]
	[Authorize]
	[ProducesResponseType(typeof(BookingViewDTO), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> CancelBooking([FromRoute] Guid id, [FromBody] BookingCancelDTO dto)
	{
		var accountId = User.Claims.GetUserIdFromJwtToken();
		var result = await _bookingService.CancelBookingAsync(
			id, Guid.Parse(accountId), User.IsInRole(nameof(AccountRole.Admin)), dto);

		ApiResponseWrapper<BookingViewDTO> response = ApiResponseWrapper<BookingViewDTO>
					.Success(result, "Cancel booking successful");

		return Ok(response);
	}

	[HttpPatch("{id}/status")]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(typeof(BookingViewDTO), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> UpdateBookingStatus(
		Guid id, [FromBody] BookingUpdateStatusDTO dto)
	{
		var result = await _bookingService.UpdateBookingStatusAsync(id, dto);

		ApiResponseWrapper<BookingViewDTO> response = ApiResponseWrapper<BookingViewDTO>
					.Success(result, "Change Status booking successful");

		return Ok(response);
	}
}
