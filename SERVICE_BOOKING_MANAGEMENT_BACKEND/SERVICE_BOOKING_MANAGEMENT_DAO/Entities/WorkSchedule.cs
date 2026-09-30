using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

public class WorkSchedule
{
	public Guid Id { get; set; }
	public Guid StaffId { get; set; }
	public DateOnly WorkDate { get; set; }
	public TimeOnly StartTime { get; set; }
	public TimeOnly EndTime { get; set; }

	public virtual Staff Staff { get; set; } = null!;
}
