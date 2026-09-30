using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers;

[Route("api/staffs")]
[ApiController]
public class StaffController : ControllerBase
{
	private readonly IStaffService staffService;
	private readonly IWorkScheduleService workScheduleService;

	public StaffController(IStaffService staffService, IWorkScheduleService workScheduleService)
	{
		this.staffService = staffService;
		this.workScheduleService = workScheduleService;
	}

	public IActionResult Index()
	{
		return View();
	}
}
