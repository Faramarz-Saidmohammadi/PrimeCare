import crypto from "node:crypto";

export const weekdaySlots = ["09:00 AM", "11:00 AM", "01:30 PM", "03:30 PM", "05:30 PM"] as const;
export const saturdaySlots = ["09:00 AM", "11:00 AM", "01:30 PM", "03:30 PM"] as const;
export const appointmentReasons = [
  "Routine Checkup",
  "New Patient Visit",
  "Specific Concern",
  "Emergency",
  "Cosmetic Consultation",
  "Orthodontic Consultation",
] as const;

export function getSlotCapacity() {
  const parsed = Number.parseInt(process.env.APPOINTMENT_SLOT_CAPACITY || "2", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 20) : 2;
}

export function getAppointmentHorizonDays() {
  const parsed = Number.parseInt(process.env.APPOINTMENT_HORIZON_DAYS || "180", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 365) : 180;
}

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

export function todayDateOnly() {
  const timeZone = process.env.CLINIC_TIME_ZONE || "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function slotsForDate(value: string) {
  const date = parseDateOnly(value);
  if (!date) return [] as string[];
  const day = date.getUTCDay();
  if (day === 0) return [] as string[];
  return [...(day === 6 ? saturdaySlots : weekdaySlots)];
}

export function validateDateAndTime(dateValue: string, timeValue: string) {
  const errors: string[] = [];
  const date = parseDateOnly(dateValue);
  if (!date) return ["A valid appointment date is required"];

  const today = parseDateOnly(todayDateOnly())!;
  const max = new Date(today);
  max.setUTCDate(max.getUTCDate() + getAppointmentHorizonDays());
  if (date < today) errors.push("Appointment date cannot be in the past");
  if (date > max) errors.push(`Appointments can only be requested up to ${getAppointmentHorizonDays()} days ahead`);
  const slots = slotsForDate(dateValue);
  if (!slots.length) errors.push("The clinic is closed on Sundays");
  if (!slots.includes(timeValue)) errors.push("The selected time is not available on that date");
  return errors;
}

export function generateReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `PC-${date}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

export function generateCancelToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function appointmentStatusLabel(status: string) {
  return ({ pending: "Pending confirmation", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" } as Record<string, string>)[status] || status;
}
