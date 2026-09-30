using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using SERVICE_BOOKING_MANAGEMENT_API.Utility;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
	private readonly IAuthService _authService;

	public AuthController(IAuthService authService)
	{
		_authService = authService;
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest request)
	{
		if (!ModelState.IsValid)
		{
			var errors = ModelState
			.Where(kvp => kvp.Value?.Errors.Count > 0)
			.ToDictionary(
				kvp => kvp.Key,
				kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
			);

			return BadRequest(ApiResponseWrapper<object>.ValidationError(errors));
		}


		LoginResponse result = await _authService.Login(request);

		ApiResponseWrapper<LoginResponse> response = ApiResponseWrapper<LoginResponse>
					.Success(result, "Login Success");

		return Ok(response);
	}

	[HttpGet("me")]
	public async Task<IActionResult> Me()
	{
		var accountId = User.Claims.GetUserIdFromJwtToken();

		MyAuthInfo result = await _authService.MyAuthInfo(Guid.Parse(accountId));

		ApiResponseWrapper<MyAuthInfo> response = ApiResponseWrapper<MyAuthInfo>
					.Success(result, "Login Success");

		return Ok(response);
	}
}
