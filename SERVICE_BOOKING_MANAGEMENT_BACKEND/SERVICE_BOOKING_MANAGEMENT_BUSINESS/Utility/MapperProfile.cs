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
				.ForMember(d => d.IsActive, o => o.MapFrom(_ => true));
			CreateMap<StaffUpdateDTO, Staff>()
				.ForMember(d => d.Id, o => o.Ignore())
				.ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName.Trim()))
				.ForMember(d => d.Email, o => o.MapFrom(s => s.Email.Trim()));
		}
	}
}
