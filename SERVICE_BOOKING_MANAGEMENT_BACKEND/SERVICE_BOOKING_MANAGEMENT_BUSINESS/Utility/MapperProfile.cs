using AutoMapper;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility
{
	public class MapperProfile : Profile
	{
		public MapperProfile() {

			//Staff
			CreateMap<Staff, StaffDetailDTO>();
			CreateMap<StaffCreateDTO, Staff>()
				.ForMember(d => d.Id, o => o.Ignore())
				.ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName.Trim()))
				.ForMember(d => d.Email, o => o.MapFrom(s => s.Email.Trim()))
				.ForMember(d => d.IsActive, o => o.MapFrom(_ => true)); //Set IsActive is true when created
			CreateMap<StaffUpdateDTO, Staff>()
				.ForMember(d => d.Id, o => o.Ignore())
				.ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName.Trim()))
				.ForMember(d => d.Email, o => o.MapFrom(s => s.Email.Trim()));

			//Work Schedule
			CreateMap<WorkSchedule, WorkScheduleDetailDTO>();
			CreateMap<WorkScheduleCreateDTO, WorkSchedule>()
				.ForMember(d => d.Id, o => o.Ignore())      // server-generated
				.ForMember(d => d.StaffId, o => o.Ignore())
				.ForMember(d => d.Staff, o => o.Ignore());

			//Services
			CreateMap<Service, ServiceDetailDTO>();
			CreateMap<ServiceCreateDTO, Service>()
				.ForMember(d => d.Id, o => o.Ignore())
				.ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
				.ForMember(d => d.Description, o => o.MapFrom(s => (s.Description ?? string.Empty).Trim()))
				.ForMember(d => d.IsActive, o => o.MapFrom(_ => true));  //Set IsActive is true when created
			CreateMap<ServiceUpdateDTO, Service>()
				.ForMember(d => d.Id, o => o.Ignore())
				.ForMember(d => d.Name, o => o.MapFrom(s => s.Name.Trim()))
				.ForMember(d => d.Description, o => o.MapFrom(s => (s.Description ?? string.Empty).Trim()));

			//Booking
			CreateMap<Booking, BookingDetailDTO>();
			CreateMap<Booking, BookingViewDTO>();

			CreateMap<BookingCreateDTO, Booking>()
			.ForMember(d => d.CustomerNote, o => o.MapFrom(s =>
				string.IsNullOrWhiteSpace(s.CustomerNote) ? null : s.CustomerNote.Trim()))
			.ForMember(d => d.Id, o => o.Ignore())
			.ForMember(d => d.BookingCode, o => o.Ignore())
			.ForMember(d => d.CustomerId, o => o.Ignore())
			.ForMember(d => d.EndTime, o => o.Ignore())
			.ForMember(d => d.Status, o => o.Ignore())
			.ForMember(d => d.CancellationReason, o => o.Ignore())
			.ForMember(d => d.CreatedAt, o => o.Ignore())
			.ForMember(d => d.Customer, o => o.Ignore())
			.ForMember(d => d.Service, o => o.Ignore())
			.ForMember(d => d.Staff, o => o.Ignore());

		}


	}
}
