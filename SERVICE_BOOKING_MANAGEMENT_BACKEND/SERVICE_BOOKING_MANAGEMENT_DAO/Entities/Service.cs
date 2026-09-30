using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

public class Service
{
	public Guid Id { get; set; }
	public required string Name { get; set; }
	public required string Description { get; set; }
	public int DurationMinutes { get; set; }
	public int Price { get; set; }
	public bool IsActive { get; set; }
}
