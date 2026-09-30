using Microsoft.EntityFrameworkCore;
using SERVICE_BOOKING_MANAGEMENT_DAO.Entities;
using SERVICE_BOOKING_MANAGEMENT_DAO.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Core;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
	protected readonly ServiceBookingManagementDBContext _context;
	protected readonly DbSet<T> _dbSet;

	public GenericRepository(ServiceBookingManagementDBContext dbContext)
	{
		_context = dbContext;
		_dbSet = _context.Set<T>();
	}

	public IQueryable<T> Entities => _context.Set<T>();

	public IQueryable<T> GetQueryable()
	{
		return _dbSet.AsQueryable();
	}

	public async Task<T?> GetByIdAsync(object id)
	{
		return await _dbSet.FindAsync(id);
	}

	public async Task<T?> FindAsync(Expression<Func<T, bool>> predicate)
	{
		return await _dbSet.FirstOrDefaultAsync(predicate);
	}

	public async Task InsertAsync(T obj)
	{
		await _dbSet.AddAsync(obj);
	}
	public async Task InsertRangeAsync(List<T> obj)
	{
		await _dbSet.AddRangeAsync(obj);
	}

	public Task UpdateAsync(T obj)
	{
		return Task.FromResult(_dbSet.Update(obj));
	}

	public async Task DeleteAsync(object entity)
	{
		_dbSet.Remove((T)entity);
		await Task.CompletedTask;
	}

	public async Task SaveAsync()
	{
		await _context.SaveChangesAsync();
	}


	public async Task<IQueryable<T>> Include(params Expression<Func<T, object>>[] includeProperties)
	{
		await Task.Delay(100);
		IQueryable<T> query = _dbSet;
		foreach (var includeProperty in includeProperties)
		{
			query = query.Include(includeProperty);
		}
		return query;
	}


}
