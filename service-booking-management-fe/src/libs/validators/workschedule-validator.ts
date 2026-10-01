export interface ScheduleFormValues {
  workDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}
 
export type ScheduleFormErrors = Partial<Record<keyof ScheduleFormValues, string>>;
 
export function validateScheduleForm(values: ScheduleFormValues): ScheduleFormErrors {
  const errors: ScheduleFormErrors = {};
 
  if (!values.workDate) errors.workDate = "Work date is required";
  if (!values.startTime) errors.startTime = "Start time is required";
  if (!values.endTime) errors.endTime = "End time is required";
 
  // "HH:mm" strings compare correctly as text.
  if (values.startTime && values.endTime && values.startTime >= values.endTime) {
    errors.endTime = "End time must be after the start time";
  }
 
  return errors;
}