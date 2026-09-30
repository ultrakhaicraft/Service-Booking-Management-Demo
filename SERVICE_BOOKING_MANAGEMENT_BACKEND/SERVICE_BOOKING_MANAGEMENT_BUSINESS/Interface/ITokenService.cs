using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;

public interface ITokenService
{
	public string GenerateTokens(Account account);

}
