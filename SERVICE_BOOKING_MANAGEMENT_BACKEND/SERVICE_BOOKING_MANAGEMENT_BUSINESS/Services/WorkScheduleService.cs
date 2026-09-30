using AutoMapper;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Interface;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Services;

public class WorkScheduleService : IWorkScheduleService
{
	private readonly IUnitOfWork _unitOfWork;
	private readonly IGenericRepository<WorkSchedule> _workScheduleRepository;
	private readonly IMapper _mapper;

	public WorkScheduleService(IUnitOfWork unitOfWork, IGenericRepository<WorkSchedule> workScheduleRepository, IMapper mapper)
	{
		_unitOfWork = unitOfWork;
		_workScheduleRepository = workScheduleRepository;
		_mapper = mapper;
	}

	//Get schedule by staff Id

	//Create schedule for specific staff Id

	//Delete schedule by Id
}
