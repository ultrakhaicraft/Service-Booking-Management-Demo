"use client";

import Pagination from "@/components/ui/pagination";
import { PagingModel } from "@/types/api-and-paging-wrapper";
import { StaffDetailDTO } from "@/types/staff";

interface StaffSelectTableProps {
  staffs: PagingModel<StaffDetailDTO>;
  selectedStaffId: string;
  onSelectStaff: (staffId: string) => void;
  onPageChange: (pageIndex: number) => void;
}

export default function StaffSelectTable({
  staffs,
  selectedStaffId,
  onSelectStaff,
  onPageChange,
}: StaffSelectTableProps) {

  // Toggle handler: deselects if the same staff is clicked again
  const handleStaffClick = (id: string) => {
    if (selectedStaffId === id) {
      onSelectStaff(""); // or null depending on your state type
    } else {
      onSelectStaff(id);
    }
  };
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 text-center">Select</th>
              <th scope="col" className="px-4 py-3">Full Name</th>
              <th scope="col" className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staffs.data?.map((stf) => (
              <tr
                key={stf.id}
                onClick={() => handleStaffClick(stf.id)}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedStaffId === stf.id ? "bg-accent/10 font-medium" : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="radio"
                    name="selectedStaff"
                    checked={selectedStaffId === stf.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleStaffClick(stf.id)}
                    className="text-accent focus:ring-accent"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{stf.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{stf.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          pageIndex={staffs.pageIndex}
          totalPages={staffs.totalPages}
          totalCount={staffs.totalCount}
          hasPrevious={staffs.hasPrevious}
          hasNext={staffs.hasNext}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}