using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

public class ServiceDetailDTO
{
	public Guid Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
	public int DurationMinutes { get; set; }
	public int Price { get; set; }
	public bool IsActive { get; set; }
}

public class ServiceCreateDTO
{
	[Required(ErrorMessage = "Service name is required.")]
	[StringLength(150)]
	public required string Name { get; set; }

	[StringLength(1000)]
	[Required(ErrorMessage = "Service description is required.")]
	public required string Description { get; set; }

	[Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes (24 hours).")]
	public int DurationMinutes { get; set; }
	[Range(0,int.MaxValue,ErrorMessage ="Price cannot be negative")]
	public int Price { get; set; }
}

public class ServiceUpdateDTO
{
	[Required(ErrorMessage = "Service name is required.")]
	[StringLength(150)]
	public required string Name { get; set; } = string.Empty;

	[StringLength(1000)]
	[Required(ErrorMessage = "Service description is required.")]
	public required string Description { get; set; }

	[Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes (24 hours).")]
	public int DurationMinutes { get; set; }

	[Range(0, int.MaxValue, ErrorMessage = "Price cannot be negative.")]
	public int Price { get; set; }

	public bool IsActive { get; set; }
}
