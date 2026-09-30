using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Utility;

//Used to run migration in DAO project level rather than in API level
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ServiceBookingManagementDBContext>
{
	public ServiceBookingManagementDBContext CreateDbContext(string[] args)
	{
		var apiPath = Path.Combine(
			Directory.GetCurrentDirectory(), "..", "SERVICE_BOOKING_MANAGEMENT_API");

		var configuration = new ConfigurationBuilder()
			.SetBasePath(apiPath)
			.AddJsonFile("appsettings.json", optional: false)
			.AddJsonFile("appsettings.Development.json", optional: true)
			.Build();

		var connectionString = configuration.GetConnectionString("DefaultConnection")
			?? throw new InvalidOperationException(
				"Connection string 'DefaultConnection' was not found in appsettings.json.");


		var options = new DbContextOptionsBuilder<ServiceBookingManagementDBContext>()
			.UseSqlServer(connectionString)      
			.Options;

		return new ServiceBookingManagementDBContext(options);
	}
}
