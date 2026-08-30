import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAppointmentByReference, reserveAppointment, SlotFullError } from "@/lib/appointment-store";
import { getDemoStore, type DemoAppointment } from "@/lib/demo-store";

function appointment(index: number): Omit<DemoAppointment, "_id" | "createdAt" | "updatedAt" | "slotNumber" | "active"> {
  return {
    reference: `PC-260831-00000${index}`,
    cancelToken: `token-${index}`,
    name: `Patient ${index}`,
    email: `patient${index}@example.com`,
    phone: "+1 555 0100",
    date: "2026-08-31",
    time: "09:00 AM",
    reason: "Routine Checkup",
    consent: true,
    status: "pending",
  };
}

beforeEach(() => {
  vi.stubEnv("MONGODB_URI", "");
  vi.stubEnv("APPOINTMENT_SLOT_CAPACITY", "2");
  getDemoStore().appointments.length = 0;
});

describe("atomic demo reservations", () => {
  it("continues to find appointments created with the previous reference length", async () => {
    const saved = await reserveAppointment(appointment(1));
    const found = await findAppointmentByReference(saved.reference, saved.email);
    expect(found?._id).toBe(saved._id);
  });

  it("accepts two concurrent reservations and rejects the third", async () => {
    const results = await Promise.allSettled([
      reserveAppointment(appointment(1)),
      reserveAppointment(appointment(2)),
      reserveAppointment(appointment(3)),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    const rejection = results.find((result) => result.status === "rejected");
    expect(rejection).toBeDefined();
    if (rejection?.status === "rejected") expect(rejection.reason).toBeInstanceOf(SlotFullError);
    expect(getDemoStore().appointments.map((item) => item.slotNumber).sort()).toEqual([1, 2]);
  });
});
