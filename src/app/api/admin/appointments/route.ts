import { NextRequest, NextResponse } from "next/server";
import { generateCancelToken, generateReference } from "@/lib/appointments";
import { reserveAppointment, SlotFullError } from "@/lib/appointment-store";
import { getDoctors } from "@/lib/content";
import { sendAppointmentReceived } from "@/lib/email";
import { readJson } from "@/lib/request";
import { validateAppointment } from "@/lib/validation";
import { requireAdmin } from "@/lib/admin-api";
import { dbConnect } from "@/lib/db";
import { getDemoStore } from "@/lib/demo-store";
import { parsePositiveInt } from "@/lib/request";
import { Appointment } from "@/models/Appointment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const params = request.nextUrl.searchParams;
  const page = parsePositiveInt(params.get("page"), 1, 10_000);
  const limit = parsePositiveInt(params.get("limit"), 20, 100);
  const search = params.get("q")?.trim() || "";
  const status = params.get("status")?.trim() || "";
  const dateFrom = params.get("dateFrom")?.trim() || "";
  const dateTo = params.get("dateTo")?.trim() || "";

  try {
    const db = await dbConnect();
    if (!db) {
      let items = [...getDemoStore().appointments];
      if (search) {
        const value = search.toLowerCase();
        items = items.filter((item) => [item.reference, item.name, item.email, item.phone, item.reason].some((field) => String(field).toLowerCase().includes(value)));
      }
      if (status) items = items.filter((item) => item.status === status);
      if (dateFrom) items = items.filter((item) => item.date >= dateFrom);
      if (dateTo) items = items.filter((item) => item.date <= dateTo);
      const total = items.length;
      return NextResponse.json({ items: items.slice((page - 1) * limit, page * limit), total, page, pages: Math.max(1, Math.ceil(total / limit)), demo: true });
    }

    const query: Record<string, unknown> = {};
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [{ reference: pattern }, { name: pattern }, { email: pattern }, { phone: pattern }, { reason: pattern }];
    }
    if (["pending", "confirmed", "completed", "cancelled"].includes(status)) query.status = status;
    if (dateFrom || dateTo) query.date = { ...(dateFrom ? { $gte: dateFrom } : {}), ...(dateTo ? { $lte: dateTo } : {}) };
    const [items, total] = await Promise.all([
      Appointment.find(query).sort({ date: 1, time: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Appointment.countDocuments(query),
    ]);
    return NextResponse.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Admin appointment list error", error);
    return NextResponse.json({ error: "Unable to load appointments" }, { status: 503 });
  }
}


export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { data, errors } = validateAppointment({ ...body, consent: true, website: "" });
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  try {
    const doctors = await getDoctors();
    const doctor = data.doctorSlug ? doctors.find((item) => item.slug === data.doctorSlug) : null;
    if (data.doctorSlug && !doctor) return NextResponse.json({ error: "Selected clinician not found" }, { status: 400 });
    const requestedStatus = String(body.status || "confirmed");
    const status = ["pending", "confirmed"].includes(requestedStatus) ? requestedStatus as "pending" | "confirmed" : "confirmed";
    const item = await reserveAppointment({ ...data, reference: generateReference(), cancelToken: generateCancelToken(), doctorName: doctor?.name, status, internalNotes: String(body.internalNotes || "").slice(0, 2000) });
    await sendAppointmentReceived(item).catch((error) => console.error("Admin-created appointment email error", error));
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotFullError) return NextResponse.json({ error: "That appointment slot is full" }, { status: 409 });
    console.error("Admin appointment create error", error);
    return NextResponse.json({ error: "Unable to create appointment" }, { status: 503 });
  }
}
