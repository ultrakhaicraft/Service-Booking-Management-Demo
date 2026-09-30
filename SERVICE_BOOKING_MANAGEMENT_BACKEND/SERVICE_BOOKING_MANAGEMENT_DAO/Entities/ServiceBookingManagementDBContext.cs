using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Entities;


public class ServiceBookingManagementDBContext : DbContext
{
	public ServiceBookingManagementDBContext(DbContextOptions<ServiceBookingManagementDBContext> options)
	: base(options) { }

	public DbSet<Account> Accounts { get; set; }
	public DbSet<Staff> Staffs { get; set; }
	public DbSet<Service> Services { get; set; }
	public DbSet<WorkSchedule> WorkSchedules { get; set; }
	public DbSet<Booking> Bookings { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Account Configuration
		modelBuilder.Entity<Account>(entity =>
		{
			entity.ToTable("Users");                    
			entity.HasKey(x => x.Id);

			entity.Property(x => x.FullName).IsRequired().HasMaxLength(100);
			entity.Property(x => x.Email).IsRequired().HasMaxLength(255);
			entity.Property(x => x.PasswordHash).IsRequired().HasMaxLength(255);

			entity.Property(x => x.Role)
				  .HasConversion<string>()
				  .HasMaxLength(20)
				  .IsRequired();

			entity.HasIndex(x => x.Email).IsUnique();
		});

		// Staff Configuration
		modelBuilder.Entity<Staff>(entity =>
		{
			entity.ToTable("Staffs");
			entity.HasKey(x => x.Id);

			entity.Property(x => x.FullName).IsRequired().HasMaxLength(100);
			entity.Property(x => x.Email).IsRequired().HasMaxLength(255);
			entity.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

			entity.HasIndex(x => x.Email).IsUnique();
		});

		// Service Configuration
		modelBuilder.Entity<Service>(entity =>
		{
			entity.ToTable("Services", t =>
			{
				t.HasCheckConstraint("CK_Services_Duration", "[DurationMinutes] > 0");
				t.HasCheckConstraint("CK_Services_Price", "[Price] >= 0");
			});

			entity.HasKey(x => x.Id);

			entity.Property(x => x.Name).IsRequired().HasMaxLength(150);
			entity.Property(x => x.Description).HasMaxLength(1000);
			entity.Property(x => x.DurationMinutes).IsRequired();
			entity.Property(x => x.Price).HasPrecision(18, 2).IsRequired();
			entity.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

			entity.HasIndex(x => x.Name);              
		});

		modelBuilder.Entity<WorkSchedule>(entity =>
		{
			entity.ToTable("WorkSchedules", t =>
				t.HasCheckConstraint("CK_WorkSchedules_StartBeforeEnd", "[StartTime] < [EndTime]"));

			entity.HasKey(x => x.Id);

			entity.Property(x => x.WorkDate).IsRequired();
			entity.Property(x => x.StartTime).IsRequired();
			entity.Property(x => x.EndTime).IsRequired();

			entity.HasOne(x => x.Staff)
				  .WithMany()                       
				  .HasForeignKey(x => x.StaffId)
				  .OnDelete(DeleteBehavior.Restrict);

			// Speeds up "schedules of staff X on day Y" and the shift-overlap check
			entity.HasIndex(x => new { x.StaffId, x.WorkDate });
		});

		modelBuilder.Entity<Booking>(entity =>
		{
			entity.ToTable("Bookings", t =>
				t.HasCheckConstraint("CK_Bookings_StartBeforeEnd", "[StartTime] < [EndTime]"));

			entity.HasKey(x => x.Id);

			entity.Property(x => x.BookingCode)
				  .IsRequired()
				  .HasMaxLength(30);

			entity.Property(x => x.Status)
				  .HasConversion<string>()          
				  .HasMaxLength(20)
				  .IsRequired();

			entity.Property(x => x.CustomerNote).HasMaxLength(500);
			entity.Property(x => x.CancellationReason).HasMaxLength(500);
			entity.Property(x => x.StartTime).IsRequired();
			entity.Property(x => x.EndTime).IsRequired();
			entity.Property(x => x.CreatedAt).IsRequired();

			entity.HasIndex(x => x.BookingCode).IsUnique();

			entity.HasOne(x => x.Customer)
				  .WithMany()
				  .HasForeignKey(x => x.CustomerId)
				  .OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(x => x.Service)
				  .WithMany()
				  .HasForeignKey(x => x.ServiceId)
				  .OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(x => x.Staff)
				  .WithMany()
				  .HasForeignKey(x => x.StaffId)
				  .OnDelete(DeleteBehavior.Restrict);

			// Used by the conflict check and available-slots
			entity.HasIndex(x => new { x.StaffId, x.StartTime, x.EndTime });

			// Used by my-bookings
			entity.HasIndex(x => new { x.CustomerId, x.StartTime });
		});
	}
}
