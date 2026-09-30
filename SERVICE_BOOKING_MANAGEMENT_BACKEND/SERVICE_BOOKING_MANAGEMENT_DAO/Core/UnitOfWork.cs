using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Core;


public class UnitOfWork : IUnitOfWork
{
	private bool disposed = false;
	private readonly ServiceBookingManagementDBContext _dbContext;
	public UnitOfWork(ServiceBookingManagementDBContext dbContext)
	{
		_dbContext = dbContext;
	}

	public IGenericRepository<T> GetRepository<T>() where T : class
	{
		return new GenericRepository<T>(_dbContext);
	}

	public async Task SaveAsync()
	{
		await _dbContext.SaveChangesAsync();
	}

	protected virtual void Dispose(bool disposing)
	{
		if (!disposed)
		{
			if (disposing)
			{
				_dbContext.Dispose();
			}
		}
		disposed = true;
	}
	public void Dispose()
	{
		Dispose(true);
		GC.SuppressFinalize(this);
	}
	
	public async Task BeginTransactionAsync()
	{
		await _dbContext.Database.BeginTransactionAsync();
	}

	
	public async Task CommitTransactionAsync()
	{
		await _dbContext.Database.CommitTransactionAsync();
	}

	
	public async Task RollBackAsync()
	{
		await _dbContext.Database.RollbackTransactionAsync();
	}
}
