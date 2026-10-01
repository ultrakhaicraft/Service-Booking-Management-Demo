using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Utility;
using System.Data.Common;
using System.Text;

namespace SERVICE_BOOKING_MANAGEMENT_API
{
	public static class DependencyInjection
	{
		public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
		{
			services.ConfigSwagger();
			services.AddAuthentication(configuration.GetSection("TokenSettings").Get<TokenSetting>());
			services.AddDatabase(configuration.GetConnectionString("DefaultConnection") ?? string.Empty);
			services.ConfigCors();
		}

		public static void ConfigCors(this IServiceCollection services)
		{
			services.AddCors(options => options.AddPolicy("AllowFrontEndOrigins", builder =>
					builder.WithOrigins("https://localhost:3000")
						   .AllowAnyHeader()
						   .AllowAnyMethod()
						   .AllowCredentials()
						   )
			);
		}

		public static void ConfigSwagger(this IServiceCollection services)
		{
			services.AddEndpointsApiExplorer();
			services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo
				{
					Version = "v1",
					Title = "School Medical API",
					Description = "API for School Medical System"
				});
				c.CustomSchemaIds(type => type.FullName);
				c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
						{
							In = ParameterLocation.Header,
							Description = "Please enter a valid token",
							Name = "Authorization",
							Type = SecuritySchemeType.Http,
							BearerFormat = "JWT",
							Scheme = "Bearer"
						});
				c.AddSecurityRequirement(new OpenApiSecurityRequirement
						{
							{
								new OpenApiSecurityScheme
								{
									Reference = new OpenApiReference
									{
										Type = ReferenceType.SecurityScheme,
										Id = "Bearer"
									}
								},
								new string[]{}
							}
						});
				
				c.UseInlineDefinitionsForEnums();
			});

		}

		public static void AddDatabase(this IServiceCollection services, string connectionString)
		{
			if (string.IsNullOrEmpty(connectionString))
			{
				throw new InvalidOperationException("Database connection string is not configured properly.");
			}

			services.AddDbContext<ServiceBookingManagementDBContext>(options =>
			{
				options.UseSqlServer(connectionString);
			});
		}

		public static void AddAuthentication(this IServiceCollection services, TokenSetting tokenSettings)
		{
			if (tokenSettings == null)
			{
				throw new InvalidOperationException("Token settings are not configured properly.");
			}

			if (tokenSettings.SecretKey == null)
			{
				throw new InvalidOperationException("Token settings are not configured properly.");
			}
			
			services
				.AddAuthentication(op =>
				{
					op.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
					op.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
					op.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
				})
				.AddJwtBearer(options =>
				{
					options.SaveToken = true;
					options.RequireHttpsMetadata = false;
					options.TokenValidationParameters = new TokenValidationParameters()
					{
						ValidateIssuer = true,
						ValidateAudience = true,
						ValidAudience = tokenSettings.ValidAudience,
						ValidIssuer = tokenSettings.ValidIssuer,
						ValidateIssuerSigningKey = true,
						IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenSettings.SecretKey))
					};

				});
			
		}
	}

	public class DBConnection
	{
		public string? ConnectionString { get; set; } = string.Empty;
	}
}
