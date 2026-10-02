
export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
 
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}
 
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}
 
export function formatDateTimeRange(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} ${formatTime(startIso)} - ${formatTime(endIso)}`;
}

export function todayLocalDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "09:00:00" -> "09:00" */
export function formatTimeOnly(time: string): string {
  return time.slice(0, 5);
}
 
/** "HH:mm"; the backend TimeOnly is safest with "HH:mm:ss". */
export function toTimeOnlyPayload(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}
 
/** "2026-10-02" -> "Fri" **/
export function formatWeekday(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "short" });
}

/** Current local time as "YYYY-MM-DDTHH:mm:ss". */
export function nowLocalDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}
 
/** True when the given booking time is now or earlier. */
export function isPast(iso: string, now: string = nowLocalDateTime()): boolean {
  return iso.slice(0, 19) <= now;
}