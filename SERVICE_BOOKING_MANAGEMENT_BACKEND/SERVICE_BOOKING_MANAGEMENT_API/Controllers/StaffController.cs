using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[Route("api/staffs")]
[ApiController]
public class StaffController : ControllerBase
{
	private readonly IStaffService staffService;

	public StaffController(IStaffService staffService)
	{
		this.staffService = staffService;
	}

	[HttpGet]
	[Authorize]
	[ProducesResponseType(typeof(PagingModel<StaffDetailDTO>), StatusCodes.Status200OK)]
	public async Task<IActionResult> GetStaffsAsync([FromQuery] StaffQueryDto request)
	{
		

		PagingModel<StaffDetailDTO> result = await staffService.GetStaffsAsync(request);

		ApiResponseWrapper<PagingModel<StaffDetailDTO>> response = ApiResponseWrapper<PagingModel<StaffDetailDTO>>
					.Success(result, "Get all Staff Success");

		return Ok(response);
	}

	[HttpPost]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(typeof(StaffDetailDTO), StatusCodes.Status201Created)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> CreateStaff([FromBody] StaffCreateDTO dto)
	{
		var result = await staffService.CreateStaffAsync(dto);

		ApiResponseWrapper<StaffDetailDTO> response = ApiResponseWrapper<StaffDetailDTO>
					.Created(result, "Create Staff Success");

		return StatusCode(StatusCodes.Status201Created, result);
	}

	[HttpPut("{id}")]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> UpdateStaff([FromRoute] Guid id, [FromBody] StaffUpdateDTO dto)
	{
		await staffService.UpdateStaffAsync(id, dto);

		ApiResponseWrapper<string> response = ApiResponseWrapper<string>
					.Success(string.Empty, "Update Staff Success");

		return Ok(response);
	}

	[HttpDelete("{id}")]
	[Authorize(Roles = nameof(AccountRole.Admin))]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> DeleteStaff([FromRoute] Guid id)
	{
		await staffService.DeleteStaffAsync(id);
		return NoContent();
	}

	
}
