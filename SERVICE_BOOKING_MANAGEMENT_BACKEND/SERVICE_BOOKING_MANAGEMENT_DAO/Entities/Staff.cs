using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

public class Staff
{
	[Key]
	public Guid Id { get; set; }
	public required string FullName { get; set; }
	public required string Email { get; set; }
	public bool IsActive { get; set; }
}
