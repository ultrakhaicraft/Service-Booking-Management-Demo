"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import BookingStatusBadge from "@/components/ui/booking-status-badge";
import FormField, { fieldInputClass } from "@/components/ui/form-field";
import SlotPicker from "@/components/ui/slot-picker";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-view";
import { todayLocalDate, formatDate, formatTime, formatDuration, formatPrice } from "@/libs/utils";
import { BookingFormErrors, validateBookingForm, BOOKING_LIMITS } from "@/libs/validators/booking-validator";
import { serviceManagementService } from "@/services/service.service";
import { AvailableSlotDTO, BookingDetailDTO } from "@/types/booking";
import { ApiError } from "@/types/errorType";
import { ServiceDetailDTO } from "@/types/service";
import { StaffDetailDTO } from "@/types/staff";
import { staffService } from "@/services/staff.service";
import Pagination from "@/components/ui/pagination";
import { PagingModel } from "@/types/api-and-paging-wrapper";
import ServiceSelectTable from "@/components/ui/service-selected-table";
import StaffSelectTable from "@/components/ui/staff-selected-table";

const inputClass = (hasError: boolean) =>
  `w-full rounded border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    hasError ? "border-red-500 focus:ring-red-200" : "border-gray-400 focus:border-accent focus:ring-accent/40"
}`;

const sortSlots = (slots: AvailableSlotDTO[]) =>
  [...slots].sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.staffFullName.localeCompare(b.staffFullName)
  );

function BookingForm() {
  const searchParams = useSearchParams();

  const [today, setToday] = useState(""); // set after mount to avoid a server/client date mismatch

  const [staffs, setStaffs] = useState<PagingModel<StaffDetailDTO> | null>(null);
  const [staffsLoading, setStaffsLoading] = useState(true);
  const [staffsError, setStaffsError] = useState<string | null>(null);
  const [staffsKey, setStaffsKey] = useState(0);
  const [staffId, setStaffId] = useState(searchParams.get("staffId") ?? "");
  const [staffSearchInput, setStaffSearchInput] = useState("");
  const [staffPageIndex, setStaffPageIndex] = useState(1);



  const [services, setServices] = useState<PagingModel<ServiceDetailDTO> | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [servicesKey, setServicesKey] = useState(0);
  const [serviceSearchInput, setServiceSearchInput] = useState("");
  const [servicePageIndex, setServicePageIndex] = useState(1);
  const [serviceId, setServiceId] = useState(searchParams.get("serviceId") ?? "");


  
  const [date, setDate] = useState("");

  const [slots, setSlots] = useState<AvailableSlotDTO[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsKey, setSlotsKey] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotDTO | null>(null);

  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<BookingDetailDTO | null>(null);

  const selectedService = services?.data?.find((s) => s.id === serviceId);
  const selectedStaff = staffs?.data?.find((s) => s.id === staffId);

  useEffect(() => {
    setToday(todayLocalDate());
  }, []);

  // Load the active services for the dropdown (no "get by id" endpoint, so one big page).
  useEffect(() => {
    const controller = new AbortController();
    setServicesLoading(true);
    setServicesError(null);

    serviceManagementService
      .getServices({ name: serviceSearchInput || undefined, isActive: true, pageIndex: servicePageIndex, pageSize: 5 }, controller.signal)
      .then((result) => {
        const list = result.data ?? [];
        setServices(result);
        // Ignore a ?serviceId= that is not an active service.
        setServiceId((current) => (list.some((s) => s.id === current) ? current : ""));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setServicesError(err instanceof ApiError ? err.message : "Failed to load services.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setServicesLoading(false);
      });

    return () => controller.abort();
  }, [servicesKey, serviceSearchInput, servicePageIndex]);

  useEffect(() => {
    const controller = new AbortController();
    setStaffsLoading(true);
    setStaffsError(null);

     staffService
      .getStaffs({ fullName: staffSearchInput || undefined, isActive: true, pageIndex: staffPageIndex, pageSize: 5 }, controller.signal)
      .then((result) => {
        const list = result.data ?? [];
        setStaffs(result);
        // Ignore a ?staffId= that is not an active staff member.
        setStaffId((current) => (list.some((s) => s.id === current) ? current : ""));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStaffsError(err instanceof ApiError ? err.message : "Failed to load staff members.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setStaffsLoading(false);
      });
  }, [staffsKey, staffSearchInput, staffPageIndex]);

  // Load the available slots whenever service or date changes.
  useEffect(() => {
    if (!serviceId || !date || (today && date < today)) {
      setSlots(null);
      setSlotsError(null);
      return;
    }

    const controller = new AbortController();
    setSlotsLoading(true);
    setSlotsError(null);

    bookingService
      .getAvailableSlots({ serviceId, date, staffId }, controller.signal)
      .then((result) => setSlots(sortSlots(result)))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSlots(null);
        setSlotsError(err instanceof ApiError ? err.message : "Failed to load available slots.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });

    return () => controller.abort();
  }, [serviceId, date, today, slotsKey]);

  function handleServiceChange(value: string) {
    setServiceId(value);
    setSelectedSlot(null);
    setErrors((prev) => ({ ...prev, serviceId: undefined, slot: undefined }));
  }

   function handleStaffChange(value: string) {
    setStaffId(value);
    setSelectedSlot(null);
    setErrors((prev) => ({ ...prev, serviceId: undefined, slot: undefined }));
  }

  function handleDateChange(value: string) {
    setDate(value);
    setSelectedSlot(null);
    setErrors((prev) => ({ ...prev, date: undefined, slot: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const validation = validateBookingForm({ serviceId, date, hasSlot: selectedSlot !== null, note, today });
    setErrors(validation);
    if (Object.values(validation).some(Boolean) || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const booking = await bookingService.create({
        serviceId,
        staffId: selectedSlot.staffId,
        startTime: selectedSlot.startTime, // echoed exactly as the API returned it (no timezone conversion)
        customerNote: note.trim() || undefined,
      });
      setCreated(booking);
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setFormError(`${err.message} The list of slots has been refreshed, please pick another one.`);
        setSelectedSlot(null);
        setSlotsKey((k) => k + 1);
      } else if (err instanceof ApiError) {
        const noteError = err.fieldErrors?.customerNote?.[0];
        setErrors({ customerNote: noteError });
        setFormError(noteError ? null : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setCreated(null);
    setServiceId("");
    setDate("");
    setSlots(null);
    setSelectedSlot(null);
    setNote("");
    setErrors({});
    setFormError(null);
  }

  // ---------- Success screen ----------
  if (created) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Booking requested!</h1>
        <p className="mt-4 text-gray-700">
          Your booking code is <strong>{created.bookingCode}</strong>.
        </p>
        <div className="mt-3">
          <BookingStatusBadge status={created.status} />
        </div>
        <p className="mt-4 text-sm text-gray-600">
          {created.serviceName} with {created.staffFullName} on {formatDate(created.startTime)},{" "}
          {formatTime(created.startTime)} - {formatTime(created.endTime)}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/my-bookings"
            className="rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
          >
            View my bookings
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-gray-400 px-6 py-2 font-semibold hover:bg-gray-100"
          >
            Book another service
          </button>
        </div>
      </section>
    );
  }

  // ---------- Form ----------
  const sectionClass = "rounded-2xl border border-gray-200 bg-white p-6";
  const headingClass = "mb-4 font-serif text-xl font-bold text-gray-900";

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-gray-900">Book a service</h1>
      <p className="mt-1 text-gray-700">Choose a service and a date, then pick a time slot.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {formError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <section className={sectionClass}>
          <h2 className={headingClass}>1. Choose a service</h2>

          <label htmlFor="search" className="mb-1 block text-sm font-semibold">Search Service</label>
          <input
            id="search"
            type="search"
            value={serviceSearchInput}
            onChange={(e) => setServiceSearchInput(e.target.value)}
            placeholder="Search services..."
            className={inputClass(false)}
          />

          {servicesLoading ? (
            <LoadingState message="Loading services..." />
          ) : servicesError ? (
            <ErrorState message={servicesError} onRetry={() => setServicesKey((k) => k + 1)} />
          ) : services?.data?.length === 0 ? (
            <EmptyState message="No services are available right now." />
          ) : (
              <ServiceSelectTable
                services={services!}
                selectedServiceId={serviceId}
                onSelectService={handleServiceChange}
                onPageChange={setServicePageIndex}
              />
          )}
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>2. Choose a staff</h2>
          <label htmlFor="search" className="mb-1 block text-sm font-semibold">Search Staff</label>
          <input
            id="search"
            type="search"
            value={staffSearchInput}
            onChange={(e) => setStaffSearchInput(e.target.value)}
            placeholder="Search staff..."
            className={inputClass(false)}
          />

          {staffsLoading ? (
            <LoadingState message="Loading staff..." />
          ) : staffsError ? (
            <ErrorState message={staffsError} onRetry={() => setStaffsKey((k) => k + 1)} />
          ) : staffs?.data?.length === 0 ? (
            <EmptyState message="No staff are available right now." />
          ) : (
            <StaffSelectTable
              staffs={staffs!}
              selectedStaffId={staffId}
              onSelectStaff={handleStaffChange}
              onPageChange={setStaffPageIndex}
            />

          )}     
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>3. Choose a date</h2>
          <FormField id="booking-date" label="Date" error={errors.date}>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={today || undefined}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "booking-date-error" : undefined}
              className={`${fieldInputClass(Boolean(errors.date))} sm:max-w-xs`}
            />
          </FormField>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>4. Pick a time slot</h2>
          {!serviceId || !date || errors.date ? (
            <p className="text-sm text-gray-600">Choose a service and a valid date to see the available slots.</p>
          ) : slotsLoading && !slots ? (
            <LoadingState message="Loading available slots..." />
          ) : slotsError ? (
            <ErrorState message={slotsError} onRetry={() => setSlotsKey((k) => k + 1)} />
          ) : slots && slots.length === 0 ? (
            <EmptyState message="No available slots on this date. Try another day." />
          ) : slots ? (
            <div className={slotsLoading ? "opacity-60" : ""}>
              <SlotPicker slots={slots} selected={selectedSlot} disabled={isSubmitting} onSelect={setSelectedSlot} />
            </div>
          ) : null}
          {errors.slot && <p className="mt-2 text-sm text-red-600">{errors.slot}</p>}
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>4. Add a note (optional)</h2>
          <FormField
            id="booking-note"
            label="Note for the staff"
            error={errors.customerNote}
            hint={`Up to ${BOOKING_LIMITS.noteMax} characters`}
          >
            <textarea
              id="booking-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.customerNote)}
              aria-describedby={errors.customerNote ? "booking-note-error" : undefined}
              className={fieldInputClass(Boolean(errors.customerNote))}
            />
          </FormField>
        </section>

        {selectedService && selectedSlot && (
          <section className="rounded-2xl border border-accent bg-secondary/30 p-6">
            <h2 className={headingClass}>Summary</h2>
            <p className="text-gray-900">
              <strong>{selectedService.name}</strong> with <strong>{selectedSlot.staffFullName}</strong>
            </p>
            <p className="mt-1 text-gray-700">
              {formatDate(selectedSlot.startTime)}, {formatTime(selectedSlot.startTime)} -{" "}
              {formatTime(selectedSlot.endTime)} &middot; {formatPrice(selectedService.price)}
            </p>
          </section>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 min-w-48 rounded-full bg-accent px-8 text-lg font-semibold text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}

export default function BookingPage() {
  // useSearchParams() requires a Suspense boundary for production builds.
  return (
    <Suspense fallback={<LoadingState />}>
      <BookingForm />
    </Suspense>
  );
}
