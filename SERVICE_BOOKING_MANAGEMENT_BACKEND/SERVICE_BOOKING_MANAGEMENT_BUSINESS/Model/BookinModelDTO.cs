using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model
{
	public class BookingDetailDTO
	{
		public Guid Id { get; set; }
		public required string BookingCode { get; set; }
		public Guid CustomerId { get; set; }
		public string CustomerFullName { get; set; } = string.Empty;  
		public Guid ServiceId { get; set; }
		public string ServiceName { get; set; } = string.Empty;
		public Guid StaffId { get; set; }
		public string StaffFullName { get; set; } = string.Empty;
		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }
		public BookingStatus Status { get; set; }  
		public string? CustomerNote { get; set; }
		public string? CancellationReason { get; set; }
		public DateTime CreatedAt { get; set; }
	}

	public class BookingViewDTO
	{
		public Guid Id { get; set; }
		public required string BookingCode { get; set; }
		public Guid ServiceId { get; set; }
		public Guid StaffId { get; set; }
		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }
		public BookingStatus Status { get; set; }

	}

	public class BookingCreateDTO
	{
		public Guid ServiceId { get; set; }
		public Guid StaffId { get; set; }
		public DateTime StartTime { get; set; }

		[StringLength(500)]
		public string? CustomerNote { get; set; }
	}

	public class BookingUpdateStatusDTO
	{
		[Required(ErrorMessage = "Status is required.")]
		[EnumDataType(typeof(BookingStatus))]
		public BookingStatus? Status { get; set; }
	}

	public class BookingCancelDTO
	{
		[Required(ErrorMessage = "A cancellation reason is required.")]
		[StringLength(500)]
		public string Reason { get; set; } = string.Empty;
	}

	public record BookingQuery : PagingQuery
	{
		public DateOnly? Date { get; set; }
		public BookingStatus? Status { get; set; }
	}

	public class AvailableSlotQuery
	{
		[Required] public Guid? ServiceId { get; set; }
		[Required] public DateOnly? Date { get; set; }
		public Guid? StaffId { get; set; }             
	}

	// Computed by the service, never mapped from an entity
	public class AvailableSlotDTO
	{
		public Guid StaffId { get; set; }
		public string StaffFullName { get; set; } = string.Empty;
		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }
	}
}
