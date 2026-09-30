using Microsoft.AspNetCore.Mvc;

namespace SERVICE_BOOKING_MANAGEMENT_API.Controllers
{
	public class AuthController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
