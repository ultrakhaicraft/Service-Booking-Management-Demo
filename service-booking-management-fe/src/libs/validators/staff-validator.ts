export const STAFF_DATA_LIMITS = {
    fullNameMax: 100,
    emailMax: 100,
} as const;
 
export interface StaffFormValues {
  fullName: string;
  email: string;
  isActive: boolean;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type StaffFormField = "fullName" | "email";
export type StaffFormErrors = Partial<Record<StaffFormField, string>>;

export function validateStaffForm(values: StaffFormValues): StaffFormErrors {
  const errors: StaffFormErrors = {};
 
  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = "Staff fullname is required";
  else if (fullName.length > STAFF_DATA_LIMITS.fullNameMax) {
    errors.fullName = `Full name must be at most ${STAFF_DATA_LIMITS.fullNameMax} characters`;
  }
 
  const email = values.email.trim();
  if (!email) errors.email = "Staff email is required";
  else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Invalid email format";
  }
  else if (email.length > STAFF_DATA_LIMITS.emailMax) {
    errors.email = `Email must be at most ${STAFF_DATA_LIMITS.emailMax} characters`;
  }
 
  return errors;
}
