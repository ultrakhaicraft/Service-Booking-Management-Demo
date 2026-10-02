export const SERVICE_LIMITS = {
  nameMax: 150,
  descriptionMax: 1000,
  durationMin: 20,
  durationMax: 1440,
  priceMin: 0,
  priceMax: 2_147_483_647, // C# int.MaxValue
} as const;
 
export interface ServiceFormValues {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  isActive: boolean;
}

export interface PriceRangeResult {
  errors: { startPrice?: string; endPrice?: string };
  startPrice?: number;
  endPrice?: number;
}
 
export type ServiceFormField = "name" | "description" | "durationMinutes" | "price";
export type ServiceFormErrors = Partial<Record<ServiceFormField, string>>;
 
const INTEGER_REGEX = /^-?\d+$/;
 
export function validateServiceForm(values: ServiceFormValues): ServiceFormErrors {
  const errors: ServiceFormErrors = {};
 
  const name = values.name.trim();
  if (!name) errors.name = "Service name is required";
  else if (name.length > SERVICE_LIMITS.nameMax) {
    errors.name = `Service name must be at most ${SERVICE_LIMITS.nameMax} characters`;
  }
 
  const description = values.description.trim();
  if (!description) errors.description = "Service description is required";
  else if (description.length > SERVICE_LIMITS.descriptionMax) {
    errors.description = `Description must be at most ${SERVICE_LIMITS.descriptionMax} characters`;
  }
 
  const duration = values.durationMinutes.trim();
  if (!duration) errors.durationMinutes = "Duration is required";
  else if (!INTEGER_REGEX.test(duration)) errors.durationMinutes = "Duration must be a whole number";
  else if (Number(duration) < SERVICE_LIMITS.durationMin || Number(duration) > SERVICE_LIMITS.durationMax) {
    errors.durationMinutes = `Duration must be between ${SERVICE_LIMITS.durationMin} and ${SERVICE_LIMITS.durationMax} minutes`;
  }
 
  const price = values.price.trim();
  if (!price) errors.price = "Price is required";
  else if (!INTEGER_REGEX.test(price)) errors.price = "Price must be a whole number";
  else if (Number(price) < SERVICE_LIMITS.priceMin) errors.price = "Price cannot be negative";
  else if (Number(price) > SERVICE_LIMITS.priceMax) errors.price = "Price is too large";
 
  return errors;
}

 
function parsePriceInput(raw: string): { value?: number; error?: string } {
  const text = raw.trim();
  if (!text) return {}; // empty = no bound
  if (!INTEGER_REGEX.test(text)) return { error: "Must be a whole number" };
  const value = Number(text);
  if (value < SERVICE_LIMITS.priceMin) return { error: "Cannot be negative" };
  if (value > SERVICE_LIMITS.priceMax) return { error: "Value is too large" };
  return { value };
}
 
export function validatePriceRange(minRaw: string, maxRaw: string): PriceRangeResult {
  const min = parsePriceInput(minRaw);
  const max = parsePriceInput(maxRaw);
  const errors: PriceRangeResult["errors"] = {};
 
  if (min.error) errors.startPrice = min.error;
  if (max.error) errors.endPrice = max.error;
  if (!errors.startPrice && !errors.endPrice && min.value !== undefined && max.value !== undefined && min.value > max.value) {
    errors.endPrice = "Max price must be at least the min price";
  }
 
  return { errors, startPrice: min.value, endPrice: max.value };
}