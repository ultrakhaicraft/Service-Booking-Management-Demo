using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SERVICE_BOOKING_MANAGEMENT_BUSINESS.Model;

public record PagingModel<T>
{
	public int PageIndex { get; set; }
	public int TotalPages { get; set; }
	public int PageSize { get; set; }
	public int TotalCount { get; set; }
	public bool HasPrevious => PageIndex > 1;
	public bool HasNext => PageIndex < TotalPages;
	public List<T>? Data { get; set; }

}

public record PagingQuery
{
	[Range(1, int.MaxValue,ErrorMessage ="Page Index must be 1 or above")]
	public int PageIndex { get; set; } = 1;
	[Range(1, int.MaxValue, ErrorMessage = "Page Size must be 1 or above")]
	public int PageSize { set; get; } = 5;
}
