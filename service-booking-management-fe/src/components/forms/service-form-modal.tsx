"use client";

import { ServiceFormValues, ServiceFormErrors, validateServiceForm, SERVICE_LIMITS } from "@/libs/validators/service-validator";
import { serviceManagementService } from "@/services/service.service";
import { ApiError } from "@/types/errorType";
import { ServiceDetailDTO } from "@/types/service";
import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "../shared/modal";
import FormField, { fieldInputClass } from "../ui/form-field";


interface ServiceFormModalProps {
  /** Pass a service to edit it; omit to create a new one. */
  service?: ServiceDetailDTO;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function ServiceFormModal({ service, onClose, onSaved }: ServiceFormModalProps) {
  const isEdit = service !== undefined;

  const [values, setValues] = useState<ServiceFormValues>({
    name: service?.name ?? "",
    description: service?.description ?? "",
    durationMinutes: service ? String(service.durationMinutes) : "",
    price: service ? String(service.price) : "",
    isActive: service?.isActive ?? true,
  });
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const validation = validateServiceForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      durationMinutes: Number(values.durationMinutes),
      price: Number(values.price),
    };

    setIsSubmitting(true);
    try {
      if (service) {
        await serviceManagementService.update(service.id, { ...payload, isActive: values.isActive });
        onSaved("Service updated successfully.");
      } else {
        await serviceManagementService.create(payload);
        onSaved("Service created successfully.");
      }
      onClose();
    } catch (err: ApiError | unknown) {
      if (err instanceof ApiError) {
        const serverErrors: ServiceFormErrors = {
          name: err.fieldErrors?.name?.[0],
          description: err.fieldErrors?.description?.[0],
          durationMinutes: err.fieldErrors?.durationMinutes?.[0],
          price: err.fieldErrors?.price?.[0],
        };
        setErrors(serverErrors);
        setFormError(Object.values(serverErrors).some(Boolean) ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? "Update service" : "Create service"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField id="service-name" label="Name" error={errors.name}>
          <input
            id="service-name"
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "service-name-error" : undefined}
            className={fieldInputClass(Boolean(errors.name))}
          />
        </FormField>

        <FormField id="service-description" label="Description" error={errors.description}>
          <textarea
            id="service-description"
            rows={4}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "service-description-error" : undefined}
            className={fieldInputClass(Boolean(errors.description))}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="service-duration"
            label="Duration (minutes)"
            error={errors.durationMinutes}
            hint={`${SERVICE_LIMITS.durationMin} - ${SERVICE_LIMITS.durationMax} minutes`}
          >
            <input
              id="service-duration"
              type="number"
              inputMode="numeric"
              step={1}
              value={values.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.durationMinutes)}
              aria-describedby={errors.durationMinutes ? "service-duration-error" : undefined}
              className={fieldInputClass(Boolean(errors.durationMinutes))}
            />
          </FormField>

          <FormField id="service-price" label="Price (VND)" error={errors.price} hint="Whole number, 0 or more">
            <input
              id="service-price"
              type="number"
              inputMode="numeric"
              step={1}
              value={values.price}
              onChange={(e) => setField("price", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "service-price-error" : undefined}
              className={fieldInputClass(Boolean(errors.price))}
            />
          </FormField>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 accent-accent"
            />
            Active (customers can book this service; untick to lock it)
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
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create service"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
