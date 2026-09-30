using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Interface;

public interface IGenericRepository<T> where T : class
{
	Task<IQueryable<T>> GetQueryableAsync();
	Task<T?> GetByIdAsync(object id);
	Task InsertAsync(T obj);
	Task InsertRangeAsync(List<T> obj);
	Task UpdateAsync(T obj);
	Task DeleteAsync(object entity);
	Task SaveAsync();
	Task<T?> FindAsync(Expression<Func<T, bool>> predicate);
	Task<IQueryable<T>> Include(params Expression<Func<T, object>>[] includeProperties);
	IQueryable<T> Entities { get; }
}
