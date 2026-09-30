using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

public class LoginRequest
{
	[Required]
	public required string Email { get; set; }
	[Required]
	public required string Password { get; set; }
}

public class LoginResponse : MyAuthInfo
{
	public required string AccessToken { get; set; }

}

public class MyAuthInfo
{
	public required string FullName { get; set; }
	public required string Email { get; set; }
	public required string Role { get; set; }
	public required string AccountId { get; set; }
}
