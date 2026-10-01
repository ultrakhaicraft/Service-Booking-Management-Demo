using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[ApiController]
[Route("api/services")]
[Authorize]                                   // any logged-in user; write actions override below
public class ServiceController : ControllerBase
{
	private readonly IServiceManagementService _serviceManagementService;

	public ServiceController(IServiceManagementService serviceManagementService)
	{
		_serviceManagementService = serviceManagementService;
	}

	/// GET /api/services?name=&isActive=&startPrice=&endPrice=&pageIndex=1&pageSize=5
	[HttpGet]
	[ProducesResponseType(typeof(PagingModel<ServiceDetailDTO>), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> GetServices([FromQuery] ServiceQuery query)
	{
		//Enforce Customer to only see Active Service
		if (User.IsInRole(nameof(AccountRole.Customer)))
		{
			query.IsActive = true;
		}

		var result = await _serviceManagementService.GetServicesListAsync(query);

		ApiResponseWrapper<PagingModel<ServiceDetailDTO>> response = ApiResponseWrapper<PagingModel<ServiceDetailDTO>>
					.Created(result, "Get Services Success");

		return Ok(response);
	}

	/// POST /api/services
	[HttpPost]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(typeof(ServiceDetailDTO), StatusCodes.Status201Created)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateService([FromBody] ServiceCreateDTO dto)
	{
		var result = await _serviceManagementService.CreateServiceAsync(dto);

		ApiResponseWrapper<ServiceDetailDTO> response = ApiResponseWrapper<ServiceDetailDTO>
					.Created(result, "Create Service Success");

		return StatusCode(StatusCodes.Status201Created, response);
	}

	/// PUT /api/services/{id}   (also locks/unlocks through IsActive)
	[HttpPut("{id}")]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> UpdateService([FromRoute] Guid id, [FromBody] ServiceUpdateDTO dto)
	{
		await _serviceManagementService.UpdateServiceAsync(id, dto);
		ApiResponseWrapper<string> response = ApiResponseWrapper<string>
					.Success(string.Empty, "Update Serivce Success");

		return Ok(response);
	}

	/// DELETE /api/services/{id}   (optional; blocked when the service has bookings)
	[HttpDelete("{id}")]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> DeleteService([FromRoute] Guid id)
	{
		await _serviceManagementService.DeleteServiceAsync(id);
		return NoContent();
	}
}
