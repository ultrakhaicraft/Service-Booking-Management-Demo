using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

public class StaffDetailDTO
{
	public Guid Id { get; set; }
	public string FullName { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public bool IsActive { get; set; }
}

/// <summary>
/// Create Staff DTO, not needed right now but I will put it here just in case
/// </summary>
public class StaffCreateDTO
{
	[Required(ErrorMessage = "Full name is required.")]
	[StringLength(100)]
	public string FullName { get; set; } = string.Empty;

	[Required(ErrorMessage = "Email is required.")]
	[EmailAddress(ErrorMessage = "Email is not valid.")]
	[StringLength(255)]
	public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Update Staff DTO, not needed right now but I will put it here just in case
/// </summary>
public class StaffUpdateDTO
{
	[Required(ErrorMessage = "Full name is required.")]
	[StringLength(100)]
	public string FullName { get; set; } = string.Empty;

	[Required(ErrorMessage = "Email is required.")]
	[EmailAddress(ErrorMessage = "Email is not valid.")]
	[StringLength(255)]
	public string Email { get; set; } = string.Empty;

	public bool IsActive { get; set; }
}