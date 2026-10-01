"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { workScheduleService } from "@/services/work-schedule.service";
import { toTimeOnlyPayload } from "@/libs/utils";
import { ScheduleFormValues, ScheduleFormErrors, validateScheduleForm } from "@/libs/validators/workschedule-validator";
import { ApiError } from "@/types/errorType";
import Modal from "../shared/modal";
import FormField, { fieldInputClass } from "../ui/form-field";

interface ScheduleFormModalProps {
  staffId: string;
  staffName: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function ScheduleFormModal({ staffId, staffName, onClose, onSaved }: ScheduleFormModalProps) {
  const [values, setValues] = useState<ScheduleFormValues>({ workDate: "", startTime: "", endTime: "" });
  const [errors, setErrors] = useState<ScheduleFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof ScheduleFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const validation = validateScheduleForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      await workScheduleService.create(staffId, {
        workDate: values.workDate,
        startTime: toTimeOnlyPayload(values.startTime),
        endTime: toTimeOnlyPayload(values.endTime),
      });
      onSaved("Work schedule added successfully.");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const serverErrors: ScheduleFormErrors = {
          workDate: err.fieldErrors?.workDate?.[0],
          startTime: err.fieldErrors?.startTime?.[0],
          endTime: err.fieldErrors?.endTime?.[0],
        };
        setErrors(serverErrors);
        // 409 (overlap), 404 (staff gone) and other non-field errors show as a banner.
        setFormError(Object.values(serverErrors).some(Boolean) ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Add work schedule" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-gray-700">
          Staff member: <strong>{staffName}</strong>
        </p>

        {formError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField id="schedule-date" label="Work date" error={errors.workDate}>
          <input
            id="schedule-date"
            type="date"
            value={values.workDate}
            onChange={(e) => setField("workDate", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.workDate)}
            aria-describedby={errors.workDate ? "schedule-date-error" : undefined}
            className={fieldInputClass(Boolean(errors.workDate))}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="schedule-start" label="Start time" error={errors.startTime}>
            <input
              id="schedule-start"
              type="time"
              value={values.startTime}
              onChange={(e) => setField("startTime", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.startTime)}
              aria-describedby={errors.startTime ? "schedule-start-error" : undefined}
              className={fieldInputClass(Boolean(errors.startTime))}
            />
          </FormField>

          <FormField id="schedule-end" label="End time" error={errors.endTime}>
            <input
              id="schedule-end"
              type="time"
              value={values.endTime}
              onChange={(e) => setField("endTime", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.endTime)}
              aria-describedby={errors.endTime ? "schedule-end-error" : undefined}
              className={fieldInputClass(Boolean(errors.endTime))}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-gray-400 px-5 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
