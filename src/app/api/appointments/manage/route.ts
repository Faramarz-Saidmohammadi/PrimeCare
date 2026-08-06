import { NextRequest, NextResponse } from "next/server";
import { findAppointmentByReference, findAppointmentByToken, toPublicAppointment, updateAppointmentByReference, updateAppointmentByToken } from "@/lib/appointment-store";
import { sendAppointmentStatusChanged } from "@/lib/email";
import { getClientIp, readJson, cleanText } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function credentials(body: Record<string, unknown>) {
  return {
    reference: cleanText(body.reference, 40).toUpperCase(),
    email: cleanText(body.email, 150).toLowerCase(),
    token: cleanText(body.token, 100),
  };
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(`appointment-lookup:${getClientIp(request)}`, 12, 5 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many lookup attempts" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { reference, email, token } = credentials(body);
  if (!token && (!reference || !email)) return NextResponse.json({ error: "Reference and email are required" }, { status: 400 });
  if (token && !/^[A-Za-z0-9_-]{24,100}$/.test(token)) return NextResponse.json({ error: "Invalid appointment link" }, { status: 400 });
  try {
    const item = token ? await findAppointmentByToken(token) : await findAppointmentByReference(reference, email);
    if (!item) return NextResponse.json({ error: "No appointment matched those details" }, { status: 404 });
    return NextResponse.json({ item: toPublicAppointment(item as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error("Appointment lookup error", error);
    return NextResponse.json({ error: "Unable to check the appointment" }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const limit = rateLimit(`appointment-cancel:${getClientIp(request)}`, 6, 5 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many cancellation attempts" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { reference, email, token } = credentials(body);
  if (!token && (!reference || !email)) return NextResponse.json({ error: "Reference and email are required" }, { status: 400 });
  if (token && !/^[A-Za-z0-9_-]{24,100}$/.test(token)) return NextResponse.json({ error: "Invalid appointment link" }, { status: 400 });
  try {
    const current = token ? await findAppointmentByToken(token) : await findAppointmentByReference(reference, email);
    if (!current) return NextResponse.json({ error: "No appointment matched those details" }, { status: 404 });
    const plain = current as unknown as Record<string, unknown>;
    if (!["pending", "confirmed"].includes(String(plain.status))) return NextResponse.json({ error: "This appointment can no longer be cancelled online" }, { status: 409 });
    const item = token
      ? await updateAppointmentByToken(token, { status: "cancelled", active: false })
      : await updateAppointmentByReference(reference, email, { status: "cancelled", active: false });
    if (!item) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    const publicItem = toPublicAppointment(item as unknown as Record<string, unknown>);
    await sendAppointmentStatusChanged(publicItem).catch((error) => console.error("Cancellation email error", error));
    return NextResponse.json({ ok: true, item: publicItem });
  } catch (error) {
    console.error("Appointment cancellation error", error);
    return NextResponse.json({ error: "Unable to cancel the appointment" }, { status: 503 });
  }
}
