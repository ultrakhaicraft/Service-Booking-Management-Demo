using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_DAO.Interface;

public interface IUnitOfWork : IDisposable
{
	IGenericRepository<T> GetRepository<T>() where T : class;
	Task SaveAsync();
	Task BeginTransactionAsync();
	Task CommitTransactionAsync();
	Task RollBackAsync();

}

