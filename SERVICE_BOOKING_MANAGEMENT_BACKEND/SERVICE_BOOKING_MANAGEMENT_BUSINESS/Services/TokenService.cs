using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;

public class TokenService : ITokenService
{
	private readonly IConfigurationSection tokenSettings;
	private readonly IUnitOfWork _unitOfWork;
	private readonly IHttpContextAccessor _httpContextAccessor;

	public TokenService(IConfiguration configuration, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
	{
		tokenSettings = configuration.GetSection("TokenSettings");
		_unitOfWork = unitOfWork;
		_httpContextAccessor = httpContextAccessor;
	}

	public string GenerateTokens(Account account)
	{
		string accessToken = GenerateAccessToken(account);
		if (string.IsNullOrEmpty(accessToken))
		{
			throw new InternalServerException("Unable to generate access token");
		}

		return (accessToken);
	}
	private string GenerateAccessToken(Account account)
	{
		TokenSetting tokenModel = tokenSettings.Get<TokenSetting>();
		if (tokenModel == null)
		{
			throw new AppException("tokenModel cannot be null");
		}

		var authClaims = new List<Claim>
		{
			new Claim("AccountId", account.Id.ToString()),
			new Claim(ClaimTypes.Name, account.FullName?? "N/A"),
			new Claim(ClaimTypes.Email, account.Email ?? "N/A"),
			new Claim(ClaimTypes.Role, account.Role.ToString() ?? "N/A"),
			new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
		};


		var authSignKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenModel?.SecretKey ?? ""));
		var expirationTime = DateTime.UtcNow.AddMinutes(Convert.ToDouble(tokenModel?.AccessTokenExpiryMinutes));
		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Issuer = tokenModel?.ValidIssuer,
			Audience = tokenModel?.ValidAudience,
			Expires = expirationTime,
			SigningCredentials = new SigningCredentials(authSignKey, SecurityAlgorithms.HmacSha256),
			Subject = new ClaimsIdentity(authClaims)
		};
		var tokenHandler = new JwtSecurityTokenHandler();
		var token = tokenHandler.CreateToken(tokenDescriptor);
		var tokenString = tokenHandler.WriteToken(token);
		
		return tokenString;
	}
}
