import { NextRequest, NextResponse } from "next/server";
import { appointmentReasons, validateDateAndTime } from "@/lib/appointments";
import { deleteAppointmentById, findAppointmentById, reserveAppointmentUpdate, SlotFullError, toPublicAppointment, updateAppointmentById } from "@/lib/appointment-store";
import { requireAdmin } from "@/lib/admin-api";
import { getDoctors } from "@/lib/content";
import { sendAppointmentReminder, sendAppointmentStatusChanged } from "@/lib/email";
import { cleanText, readJson } from "@/lib/request";
import { validatePatientIdentity } from "@/lib/validation";

export const runtime = "nodejs";
const statuses = new Set(["pending", "confirmed", "completed", "cancelled"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  try {
    const current = await findAppointmentById(id);
    if (!current) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    const previous = current as unknown as Record<string, unknown>;

    if (body.action === "send-reminder") {
      const delivery = await sendAppointmentReminder(toPublicAppointment(previous));
      if (!delivery.sent) return NextResponse.json({ error: "Email delivery is not configured" }, { status: 409 });
      const item = await updateAppointmentById(id, { reminderSentAt: new Date() });
      return NextResponse.json({ item, message: "Reminder sent" });
    }

    const update: Record<string, unknown> = {};
    if (body.status !== undefined) {
      const status = cleanText(body.status, 20);
      if (!statuses.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      update.status = status;
    }
    for (const [key, max] of [["name", 100], ["email", 150], ["phone", 40], ["location", 160], ["medicalRecord", 60], ["message", 1000], ["internalNotes", 2000]] as const) {
      if (body[key] !== undefined) update[key] = cleanText(body[key], max);
    }
    if (body.name !== undefined || body.email !== undefined || body.phone !== undefined) {
      const identity = validatePatientIdentity({
        name: update.name ?? previous.name,
        email: update.email ?? previous.email,
        phone: update.phone ?? previous.phone,
      });
      if (identity.errors.length) return NextResponse.json({ error: identity.errors[0], errors: identity.errors }, { status: 400 });
      if (body.name !== undefined) update.name = identity.data.name;
      if (body.email !== undefined) update.email = identity.data.email;
      if (body.phone !== undefined) update.phone = identity.data.phone;
    }
    if (body.reason !== undefined) {
      const reason = cleanText(body.reason, 100);
      if (!appointmentReasons.includes(reason as (typeof appointmentReasons)[number])) return NextResponse.json({ error: "Invalid visit reason" }, { status: 400 });
      update.reason = reason;
    }
    if (body.doctorSlug !== undefined) {
      const doctorSlug = cleanText(body.doctorSlug, 120);
      const doctors = await getDoctors();
      const doctor = doctorSlug ? doctors.find((item) => item.slug === doctorSlug) : null;
      if (doctorSlug && !doctor) return NextResponse.json({ error: "Selected clinician not found" }, { status: 400 });
      update.doctorSlug = doctorSlug;
      update.doctorName = doctor?.name || "";
    }
    if (body.date !== undefined) update.date = cleanText(body.date, 20);
    if (body.time !== undefined) update.time = cleanText(body.time, 20);

    const nextDate = String(update.date ?? previous.date ?? "");
    const nextTime = String(update.time ?? previous.time ?? "");
    const nextStatus = String(update.status ?? previous.status ?? "pending");
    const nextActive = ["pending", "confirmed"].includes(nextStatus);
    const needsReservation = nextActive && (body.date !== undefined || body.time !== undefined || body.status !== undefined || !previous.slotNumber || previous.active !== true);
    if (nextActive && needsReservation) {
      const errors = validateDateAndTime(nextDate, nextTime);
      if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }
    if (!nextActive) update.active = false;

    const item = needsReservation
      ? await reserveAppointmentUpdate(id, update, nextDate, nextTime)
      : await updateAppointmentById(id, update);
    if (!item) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    const changedForPatient = ["status", "date", "time", "doctorSlug"].some((key) => body[key] !== undefined && String(body[key]) !== String(previous[key] ?? ""));
    if (changedForPatient) await sendAppointmentStatusChanged(toPublicAppointment(item as unknown as Record<string, unknown>)).catch((error) => console.error("Appointment update email error", error));
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof SlotFullError) return NextResponse.json({ error: "That appointment slot is full" }, { status: 409 });
    console.error("Admin appointment update error", error);
    return NextResponse.json({ error: "Unable to update appointment" }, { status: 503 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const deleted = await deleteAppointmentById(id);
    if (!deleted) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin appointment delete error", error);
    return NextResponse.json({ error: "Unable to delete appointment" }, { status: 503 });
  }
}
