import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateCancelToken,
  generateReference,
  getAppointmentHorizonDays,
  getSlotCapacity,
  parseDateOnly,
  slotsForDate,
  todayDateOnly,
  validateDateAndTime,
} from "@/lib/appointments";

afterEach(() => vi.unstubAllEnvs());

function futureOpenDate(offset = 1) {
  const date = parseDateOnly(todayDateOnly())!;
  date.setUTCDate(date.getUTCDate() + offset);
  while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

describe("appointment schedule", () => {
  it("strictly parses real calendar dates", () => {
    expect(parseDateOnly("2028-02-29")?.toISOString()).toBe("2028-02-29T00:00:00.000Z");
    expect(parseDateOnly("2027-02-29")).toBeNull();
    expect(parseDateOnly("08/30/2026")).toBeNull();
  });

  it("closes on Sunday and uses the shorter Saturday schedule", () => {
    expect(slotsForDate("2026-08-30")).toEqual([]);
    expect(slotsForDate("2026-08-29")).toHaveLength(4);
    expect(slotsForDate("2026-08-31")).toHaveLength(5);
  });

  it("bounds capacity and booking horizon configuration", () => {
    vi.stubEnv("APPOINTMENT_SLOT_CAPACITY", "500");
    vi.stubEnv("APPOINTMENT_HORIZON_DAYS", "500");
    expect(getSlotCapacity()).toBe(20);
    expect(getAppointmentHorizonDays()).toBe(365);

    vi.stubEnv("APPOINTMENT_SLOT_CAPACITY", "invalid");
    vi.stubEnv("APPOINTMENT_HORIZON_DAYS", "0");
    expect(getSlotCapacity()).toBe(2);
    expect(getAppointmentHorizonDays()).toBe(180);
  });

  it("accepts only an available time on an allowed date", () => {
    vi.stubEnv("CLINIC_TIME_ZONE", "UTC");
    const date = futureOpenDate();
    const validTime = slotsForDate(date)[0];
    expect(validateDateAndTime(date, validTime)).toEqual([]);
    expect(validateDateAndTime(date, "02:17 AM")).toContain("The selected time is not available on that date");
    expect(validateDateAndTime("2020-01-01", "09:00 AM")).toContain("Appointment date cannot be in the past");
  });
});

describe("appointment identifiers", () => {
  it("creates references in the documented format", () => {
    expect(generateReference()).toMatch(/^PC-\d{6}-[A-F0-9]{16}$/);
  });

  it("creates high-entropy URL-safe cancellation tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, generateCancelToken));
    expect(tokens.size).toBe(100);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });
});
