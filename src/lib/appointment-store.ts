import { getSlotCapacity } from "@/lib/appointments";
import { dbConnect } from "@/lib/db";
import { demoId, getDemoStore, type DemoAppointment } from "@/lib/demo-store";
import { Appointment } from "@/models/Appointment";
import type { AppointmentStatus, PublicAppointment } from "@/types/admin";

export type AppointmentCreate = Omit<DemoAppointment, "_id" | "createdAt" | "updatedAt" | "slotNumber" | "active">;

export class SlotFullError extends Error {
  constructor() { super("APPOINTMENT_SLOT_FULL"); }
}

export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function toPublicAppointment(item: Record<string, unknown>): PublicAppointment {
  return {
    reference: String(item.reference || ""),
    name: String(item.name || ""),
    email: String(item.email || ""),
    phone: String(item.phone || ""),
    date: String(item.date || ""),
    time: String(item.time || ""),
    reason: String(item.reason || ""),
    doctorSlug: item.doctorSlug ? String(item.doctorSlug) : undefined,
    doctorName: item.doctorName ? String(item.doctorName) : undefined,
    status: String(item.status || "pending") as AppointmentStatus,
    message: item.message ? String(item.message) : undefined,
    createdAt: new Date(String(item.createdAt || Date.now())).toISOString(),
    updatedAt: new Date(String(item.updatedAt || Date.now())).toISOString(),
  };
}

function duplicateKey(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000);
}

export async function countActiveSlot(date: string, time: string, excludeId?: string) {
  const activeStatuses = ["pending", "confirmed"];
  const db = await dbConnect();
  if (!db) return getDemoStore().appointments.filter((item) => item.date === date && item.time === time && item.active && activeStatuses.includes(item.status) && item._id !== excludeId).length;
  const query: Record<string, unknown> = { date, time, status: { $in: activeStatuses } };
  if (excludeId) query._id = { $ne: excludeId };
  return Appointment.countDocuments(query);
}

export async function reserveAppointment(data: AppointmentCreate) {
  const db = await dbConnect();
  const capacity = getSlotCapacity();
  if (!db) {
    const store = getDemoStore();
    const used = new Set(store.appointments.filter((item) => item.date === data.date && item.time === data.time && item.active).map((item) => item.slotNumber));
    const slotNumber = Array.from({ length: capacity }, (_, index) => index + 1).find((number) => !used.has(number));
    if (!slotNumber) throw new SlotFullError();
    const now = new Date().toISOString();
    const item: DemoAppointment = { _id: demoId("appointment"), ...data, slotNumber, active: true, createdAt: now, updatedAt: now };
    store.appointments.unshift(item);
    return item;
  }
  for (let slotNumber = 1; slotNumber <= capacity; slotNumber += 1) {
    try {
      return toPlain(await Appointment.create({ ...data, slotNumber, active: true }));
    } catch (error) {
      if (!duplicateKey(error)) throw error;
    }
  }
  throw new SlotFullError();
}

export async function findAppointmentByReference(reference: string, email: string) {
  const db = await dbConnect();
  if (!db) return getDemoStore().appointments.find((item) => item.reference === reference && item.email === email) || null;
  return Appointment.findOne({ reference, email }).lean();
}

export async function findAppointmentByToken(cancelToken: string) {
  const db = await dbConnect();
  if (!db) return getDemoStore().appointments.find((item) => item.cancelToken === cancelToken) || null;
  return Appointment.findOne({ cancelToken }).lean();
}

export async function findAppointmentById(id: string) {
  const db = await dbConnect();
  if (!db) return getDemoStore().appointments.find((item) => item._id === id) || null;
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return Appointment.findById(id).lean();
}

export async function updateAppointmentById(id: string, update: Record<string, unknown>) {
  const db = await dbConnect();
  if (!db) {
    const item = getDemoStore().appointments.find((entry) => entry._id === id);
    if (!item) return null;
    if (update.active === true && update.slotNumber) {
      const conflict = getDemoStore().appointments.some((entry) => entry._id !== id && entry.active && entry.date === String(update.date ?? item.date) && entry.time === String(update.time ?? item.time) && entry.slotNumber === Number(update.slotNumber));
      if (conflict) {
        const error = new Error("Duplicate slot") as Error & { code: number };
        error.code = 11000;
        throw error;
      }
    }
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    return item;
  }
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return Appointment.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
}

export async function reserveAppointmentUpdate(id: string, update: Record<string, unknown>, date: string, time: string) {
  for (let slotNumber = 1; slotNumber <= getSlotCapacity(); slotNumber += 1) {
    try {
      const item = await updateAppointmentById(id, { ...update, date, time, slotNumber, active: true });
      if (item) return item;
      return null;
    } catch (error) {
      if (!duplicateKey(error)) throw error;
    }
  }
  throw new SlotFullError();
}

export async function updateAppointmentByReference(reference: string, email: string, update: Record<string, unknown>) {
  const db = await dbConnect();
  if (!db) {
    const item = getDemoStore().appointments.find((entry) => entry.reference === reference && entry.email === email);
    if (!item) return null;
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    return item;
  }
  return Appointment.findOneAndUpdate({ reference, email }, update, { new: true, runValidators: true }).lean();
}

export async function updateAppointmentByToken(cancelToken: string, update: Record<string, unknown>) {
  const db = await dbConnect();
  if (!db) {
    const item = getDemoStore().appointments.find((entry) => entry.cancelToken === cancelToken);
    if (!item) return null;
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    return item;
  }
  return Appointment.findOneAndUpdate({ cancelToken }, update, { new: true, runValidators: true }).lean();
}

export async function deleteAppointmentById(id: string) {
  const db = await dbConnect();
  if (!db) {
    const store = getDemoStore();
    const index = store.appointments.findIndex((item) => item._id === id);
    if (index < 0) return null;
    return store.appointments.splice(index, 1)[0];
  }
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return Appointment.findByIdAndDelete(id).lean();
}
