"use client";
import { StaffFormErrors, StaffFormValues, validateStaffForm } from "@/libs/validators/staff-validator";
import { StaffDetailDTO } from "@/types/staff";
import { FormEvent, useState } from "react";
import Modal from "../shared/modal";
import { staffService } from "@/services/staff.service";
import { ApiError } from "@/types/errorType";
import FormField, { fieldInputClass } from "../ui/form-field";


interface StaffFormModalProps {
  staff?: StaffDetailDTO; //If staff is empty, create a new staff member; otherwise, edit the existing one.
  onClose: () => void;
  onSaved: (message: string) => void;
}


export default function StaffFormModal({ staff, onClose, onSaved }: StaffFormModalProps) {
  const isEdit = staff !== undefined;

  const [values, setValues] = useState<StaffFormValues>({
    fullName: staff?.fullName ?? "",
    email: staff?.email ?? "",
    isActive: staff?.isActive ?? true,
  });
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof StaffFormValues>(key: K, value: StaffFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const validation = validateStaffForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = { fullName: values.fullName.trim(), email: values.email.trim() };

    setIsSubmitting(true);
    try {
      if (staff) {
        await staffService.update(staff.id, { ...payload, isActive: values.isActive });
        onSaved("Staff member updated successfully.");
      } else {
        await staffService.create(payload);
        onSaved("Staff member created successfully.");
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const serverErrors: StaffFormErrors = {
          fullName: err.fieldErrors?.fullName?.[0],
          email: err.fieldErrors?.email?.[0],
        };
        setErrors(serverErrors);
        // 409 (e.g. duplicate email) and other non-field errors show as a banner.
        setFormError(Object.values(serverErrors).some(Boolean) ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? "Update staff member" : "Create staff member"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField id="staff-fullname" label="Full name" error={errors.fullName}>
          <input
            id="staff-fullname"
            type="text"
            value={values.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "staff-fullname-error" : undefined}
            className={fieldInputClass(Boolean(errors.fullName))}
          />
        </FormField>

        <FormField id="staff-email" label="Email" error={errors.email}>
          <input
            id="staff-email"
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "staff-email-error" : undefined}
            className={fieldInputClass(Boolean(errors.email))}
          />
        </FormField>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 accent-accent"
            />
            Active (can receive bookings; untick to lock)
          </label>
        )}

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
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create staff member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}