"use client";

import Pagination from "@/components/ui/pagination";
import { formatPrice } from "@/libs/utils";
import { PagingModel } from "@/types/api-and-paging-wrapper";
import { ServiceDetailDTO } from "@/types/service";

interface ServiceSelectTableProps {
  services: PagingModel<ServiceDetailDTO>;
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onPageChange: (pageIndex: number) => void;
}

export default function ServiceSelectTable({
  services,
  selectedServiceId,
  onSelectService,
  onPageChange,
}: ServiceSelectTableProps) {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 text-center">Select</th>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Description</th>
              <th scope="col" className="px-4 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.data?.map((srv) => (
              <tr
                key={srv.id}
                onClick={() => onSelectService(srv.id)}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedServiceId === srv.id ? "bg-accent/10 font-medium" : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="radio"
                    name="selectedService"
                    checked={selectedServiceId === srv.id}
                    onChange={() => onSelectService(srv.id)}
                    className="text-accent focus:ring-accent"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{srv.name}</td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-500" title={srv.description}>
                  {srv.description || "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(srv.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          pageIndex={services.pageIndex}
          totalPages={services.totalPages}
          totalCount={services.totalCount}
          hasPrevious={services.hasPrevious}
          hasNext={services.hasNext}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}