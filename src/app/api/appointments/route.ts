import { NextRequest, NextResponse } from "next/server";
import { generateCancelToken, generateReference, getAppointmentHorizonDays, getSlotCapacity, parseDateOnly, slotsForDate, todayDateOnly } from "@/lib/appointments";
import { countActiveSlot, reserveAppointment, SlotFullError } from "@/lib/appointment-store";
import { sendAdminNotification, sendAppointmentReceived } from "@/lib/email";
import { getDoctors } from "@/lib/content";
import { getClientIp, escapeHtml, readJson } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { validateAppointment } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bookingWindow() {
  const minDate = todayDateOnly();
  const max = parseDateOnly(minDate)!;
  max.setUTCDate(max.getUTCDate() + getAppointmentHorizonDays());
  return { minDate, maxDate: max.toISOString().slice(0, 10), horizonDays: getAppointmentHorizonDays() };
}

function validateDateForAvailability(value: string) {
  const date = parseDateOnly(value);
  if (!date) return "A valid date is required";
  const today = parseDateOnly(todayDateOnly())!;
  const max = new Date(today);
  max.setUTCDate(max.getUTCDate() + getAppointmentHorizonDays());
  if (date < today) return "Date cannot be in the past";
  if (date > max) return `Date must be within ${getAppointmentHorizonDays()} days`;
  if (date.getUTCDay() === 0) return "The clinic is closed on Sundays";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date")?.trim() || "";
    const doctors = await getDoctors();
    if (!date) return NextResponse.json({ doctors, slots: [], capacity: getSlotCapacity(), ...bookingWindow() });
    const dateError = validateDateForAvailability(date);
    if (dateError) return NextResponse.json({ error: dateError, doctors, slots: [], ...bookingWindow() }, { status: 400 });
    const capacity = getSlotCapacity();
    const slots = await Promise.all(slotsForDate(date).map(async (time) => {
      const used = await countActiveSlot(date, time);
      return { time, available: used < capacity, remaining: Math.max(0, capacity - used) };
    }));
    return NextResponse.json({ date, doctors, slots, capacity, ...bookingWindow() });
  } catch (error) {
    console.error("Availability error", error);
    return NextResponse.json({ error: "Unable to load appointment availability" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`appointment:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { data, errors } = validateAppointment(body);
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

  try {
    const doctors = await getDoctors();
    const doctor = data.doctorSlug ? doctors.find((item) => item.slug === data.doctorSlug) : null;
    if (data.doctorSlug && !doctor) return NextResponse.json({ error: "The selected clinician is no longer available" }, { status: 400 });

    const used = await countActiveSlot(data.date, data.time);
    if (used >= getSlotCapacity()) return NextResponse.json({ error: "That appointment time has just become unavailable. Select another time." }, { status: 409 });

    const saved = await reserveAppointment({
      ...data,
      reference: generateReference(),
      cancelToken: generateCancelToken(),
      doctorName: doctor?.name,
      status: "pending",
      internalNotes: "",
    });

    const mailData = {
      reference: saved.reference,
      name: saved.name,
      email: saved.email,
      phone: saved.phone,
      date: saved.date,
      time: saved.time,
      reason: saved.reason,
      doctorName: saved.doctorName,
      status: saved.status,
      message: saved.message,
      cancelToken: saved.cancelToken,
    };
    await Promise.allSettled([
      sendAppointmentReceived(mailData),
      sendAdminNotification(
        `New appointment request: ${saved.name} (${saved.reference})`,
        `<h2>New appointment request</h2><p><strong>Reference:</strong> ${escapeHtml(saved.reference)}</p><p><strong>Name:</strong> ${escapeHtml(saved.name)}</p><p><strong>Email:</strong> ${escapeHtml(saved.email)}</p><p><strong>Phone:</strong> ${escapeHtml(saved.phone)}</p><p><strong>Date:</strong> ${escapeHtml(saved.date)} at ${escapeHtml(saved.time)}</p><p><strong>Reason:</strong> ${escapeHtml(saved.reason)}</p>`,
        saved.email,
      ),
    ]);

    return NextResponse.json({
      ok: true,
      reference: saved.reference,
      status: saved.status,
      manageUrl: "/appointment/manage",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotFullError) return NextResponse.json({ error: "That appointment time has just become unavailable. Select another time." }, { status: 409 });
    console.error("Appointment creation error", error);
    return NextResponse.json({ error: "The appointment could not be saved. Please call the clinic or try again." }, { status: 503 });
  }
}
