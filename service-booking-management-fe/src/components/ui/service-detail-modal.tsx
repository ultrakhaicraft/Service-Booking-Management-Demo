"use client";

import { formatDuration, formatPrice } from "@/libs/utils";
import { ServiceDetailDTO } from "@/types/service";
import Modal from "../shared/modal";



interface ServiceDetailModalProps {
  service: ServiceDetailDTO;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Name", value: service.name },
    { label: "Description", value: service.description },
    { label: "Duration", value: `${formatDuration(service.durationMinutes)} (${service.durationMinutes} minutes)` },
    { label: "Price", value: formatPrice(service.price) },
    { label: "Status", value: service.isActive ? "Active" : "Locked" },
    { label: "Service ID", value: service.id },
  ];

  return (
    <Modal title="Service details" onClose={onClose}>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm font-semibold text-gray-500">{row.label}</dt>
            <dd className="mt-0.5 break-words whitespace-pre-wrap text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
