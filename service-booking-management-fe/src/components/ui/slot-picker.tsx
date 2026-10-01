"use client";

import { formatTime } from "@/libs/utils";
import type { AvailableSlotDTO } from "@/types/booking";

export const slotKey = (slot: AvailableSlotDTO) => `${slot.staffId}|${slot.startTime}`;

interface SlotPickerProps {
  slots: AvailableSlotDTO[];
  selected: AvailableSlotDTO | null;
  disabled?: boolean;
  onSelect: (slot: AvailableSlotDTO) => void;
}

export default function SlotPicker({ slots, selected, disabled = false, onSelect }: SlotPickerProps) {
  return (
    <div role="radiogroup" aria-label="Available time slots" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => {
        const isSelected = selected !== null && slotKey(selected) === slotKey(slot);
        return (
          <button
            key={slotKey(slot)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(slot)}
            className={`rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${
              isSelected
                ? "border-accent bg-secondary/40 ring-2 ring-accent"
                : "border-gray-300 bg-white hover:border-accent hover:bg-secondary/20"
            }`}
          >
            <span className="block font-semibold text-gray-900">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
            <span className="block text-sm text-gray-600">{slot.staffFullName}</span>
          </button>
        );
      })}
    </div>
  );
}
