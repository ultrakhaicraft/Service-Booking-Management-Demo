import { StaffDetailDTO } from "@/types/staff";
import Modal from "../shared/modal";

interface StaffDetailModalProps {
  staff: StaffDetailDTO;
  onClose: () => void;
}

export default function StaffDetailModal({staff, onClose}: StaffDetailModalProps) {
    const rows: {label: string; value: string}[] = [
        {label: "Full name", value: staff.fullName},
        {label: "Email", value: staff.email},
        {label: "Status", value: staff.isActive ? "Active" : "Locked"},
        {label: "Staff ID", value: staff.id},
    ];

    return(
        <Modal title="Staff details" onClose={onClose}>
            <dl className="space-y-3">
                {rows.map((row)=>(
                    <div key={row.label}>
                        <dt className="text-sm font-semibold text-gray-500">{row.label}</dt>
                        <dd className="mt-0.5 break-words text-gray-900">{row.value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-6 flex justify-end">
                <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95">
                    Close
                </button>
            </div>
        </Modal>
    )
}