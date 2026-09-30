using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

public record WorkScheduleQuery : PagingQuery
{
	public DateOnly? WorkDate { get; set; }
	public TimeOnly? StartTime { get; set; }
	public TimeOnly? EndTime { get; set; }
}

public class WorkScheduleDetailDTO
{
	public Guid Id { get; set; }
	public Guid StaffId { get; set; }
	public DateOnly WorkDate { get; set; }
	public TimeOnly StartTime { get; set; }
	public TimeOnly EndTime { get; set; }
}

public class WorkScheduleCreateDTO
{
	public DateOnly WorkDate { get; set; }
	public TimeOnly StartTime { get; set; }
	public TimeOnly EndTime { get; set; }

	//Validate Start Time before End Time within DTO
	public IEnumerable<ValidationResult> Validate(ValidationContext context)
	{
		if (StartTime >= EndTime)
		{
			yield return new ValidationResult(
			   "Start time must be before end time.",
			   [nameof(StartTime), nameof(EndTime)]);
		}
	}
}
