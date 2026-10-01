using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;
using SERVICE_BOOKING_MANAGEMENT_DAO.Core;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;

public static class BusinessLogicDI
{
	public static void AddApplication(this IServiceCollection services, IConfiguration configuration)
	{
		services.AddRepository();
		services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MapperProfile).Assembly)); 
		services.AddServices(configuration);
	}

	public static void AddRepository(this IServiceCollection services)
	{
		services.AddScoped<IUnitOfWork, UnitOfWork>();
		services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

	}

	

	public static void AddServices(this IServiceCollection services, IConfiguration configuration)
	{
		
		services.AddScoped<IAuthService, AuthService>();
		services.AddScoped<ITokenService, TokenService>();
		services.AddScoped<IStaffService, StaffService>();
		services.AddScoped<IWorkScheduleService, WorkScheduleService>();
		services.AddScoped<IBookingService, BookingService>();
		services.AddScoped<IServiceManagementService, ServiceManagementService>();

	}
}
