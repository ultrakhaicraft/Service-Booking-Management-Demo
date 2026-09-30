using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

public class Booking
{
	public Guid Id { get; set; }
	public required string BookingCode { get; set; } 
	public Guid CustomerId { get; set; } 
	public Guid ServiceId { get; set; } 
	public Guid StaffId { get; set; }
	public DateTime StartTime { get; set; }
	public DateTime EndTime { get; set; }
	public BookingStatus Status { get; set; }  // e.g. "Pending", "Confirmed", "Completed", "Cancelled"
	public string? CustomerNote { get; set; }
	public string? CancellationReason { get; set; }
	public DateTime CreatedAt { get; set; }

	public virtual Account Customer { get; set; } = null!;
	public virtual Service Service { get; set; } = null!;
	public virtual Staff Staff { get; set; } = null!;
}
