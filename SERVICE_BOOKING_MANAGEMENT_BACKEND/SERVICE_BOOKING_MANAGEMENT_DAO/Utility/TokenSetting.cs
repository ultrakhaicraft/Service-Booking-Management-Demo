using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Utility;

public record TokenSetting
{
	public required string ValidAudience { get; set; }
	public required string ValidIssuer { get; set; }
	public required string SecretKey { get; set; }
	public int AccessTokenExpiryMinutes { get; set; } 
	public int RefreshTokenExpiryDays { get; set; }

}
