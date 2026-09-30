using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

public class Account
{
	[Key]
	public Guid Id { get; set; }
	public required string FullName { get; set; }
	public required string Email { get; set; }
	public required string PasswordHash { get; set; }
	public AccountRole Role { get; set; }
}
