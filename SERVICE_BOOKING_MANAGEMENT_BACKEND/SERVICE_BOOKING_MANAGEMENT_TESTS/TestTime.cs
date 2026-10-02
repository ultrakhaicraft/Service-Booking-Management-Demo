using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_TESTS;

public static class TestTime
{
	/// <summary>
	/// Get tomorrow date while still keeping hour and minutes
	/// </summary>
	/// <param name="hour"></param>
	/// <param name="minute"></param>
	/// <returns></returns>
	public static DateTime Tomorrow(int hour, int minute = 0) =>
	   DateTime.Today.AddDays(1).AddHours(hour).AddMinutes(minute);

	/// <summary>
	/// Get tomorrow Date
	/// </summary>
	public static DateOnly TomorrowDate => DateOnly.FromDateTime(DateTime.Today.AddDays(1));
}
