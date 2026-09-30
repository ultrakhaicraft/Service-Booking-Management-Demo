using Azure.Core;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services
{
	public class AuthService : IAuthService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ITokenService _tokenUtils;

		public AuthService(IUnitOfWork unitOfWork, ITokenService jwtUtils)
		{
			_unitOfWork = unitOfWork;
			_tokenUtils = jwtUtils;
		}

		public async Task<LoginResponse> Login(LoginRequest request)
		{
			var account = await _unitOfWork.GetRepository<Account>().FindAsync(user => user.Email == request.Email);
			if (account == null)
			{
				throw new UnauthorizedException("Unable to find Email");
			}
			if (!BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
			{
				throw new UnauthorizedException("Password is incorrect");
			}


			var tokens = _tokenUtils.GenerateTokens(account);

			

			var responseModel = new LoginResponse
			{

				FullName = account.FullName,
				Email = account.Email,
				AccountId = account.Id.ToString(),
				Role = account.Role.ToString(),
				AccessToken = tokens
			};
			return responseModel;
		}

		/// <summary>
		/// Return AuthInfo by extracting accountId from Token Claims
		/// </summary>
		/// <param name="accountId"></param>
		/// <returns></returns>
		/// <exception cref="NotImplementedException"></exception>
		public async Task<MyAuthInfo> MyAuthInfo(Guid accountId)
		{
			var account = await _unitOfWork.GetRepository<Account>().FindAsync(user => user.Id == accountId);
			if (account == null)
			{
				throw new UnauthorizedException("Unable to find Email");
			}

			var response = new MyAuthInfo
			{
				FullName = account.FullName,
				Email = account.Email,
				AccountId = account.Id.ToString(),
				Role = account.Role.ToString(),
			};

			return response;

		}
	}
}
