using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[ApiController]
[Authorize(Roles = nameof(AccountRole.Admin))]
public class WorkScheduleController : Controller
{
	private readonly IWorkScheduleService workScheduleService;

	public WorkScheduleController(IWorkScheduleService workScheduleService)
	{
		this.workScheduleService = workScheduleService;
	}

	[HttpGet("staffs/{id}/schedules")]
	[ProducesResponseType(typeof(PagingModel<WorkScheduleDetailDTO>), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetSchedules(
	[FromRoute] Guid id, [FromQuery] WorkScheduleQuery query, CancellationToken ct)
	{
		var result = await workScheduleService.GetSchedulesByStaffId(id, query, ct);

		ApiResponseWrapper<PagingModel<WorkScheduleDetailDTO>> response = ApiResponseWrapper<PagingModel<WorkScheduleDetailDTO>>
				.Success(result, "Get all Schedule Based on Staff Id Success");


		return Ok(response);
	}


	[HttpPost("staffs/{id}/schedules")]
	[ProducesResponseType(typeof(WorkScheduleDetailDTO), StatusCodes.Status201Created)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> CreateSchedule([FromRoute] Guid id, [FromBody] WorkScheduleCreateDTO dto)
	{
		var result = await workScheduleService.CreateSchedule(id, dto);

		ApiResponseWrapper<WorkScheduleDetailDTO> response = ApiResponseWrapper<WorkScheduleDetailDTO>
				.Success(result, "Create Schedule Based on Staff Id Success");

		return StatusCode(StatusCodes.Status201Created, response);
	}

	[HttpDelete("staffs/schedules/{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status409Conflict)]
	public async Task<IActionResult> DeleteSchedule([FromRoute]  Guid id)
	{
		await workScheduleService.DeleteScheduleAsync(id);
		return NoContent();
	}
}
