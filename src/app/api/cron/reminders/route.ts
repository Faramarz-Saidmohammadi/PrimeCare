import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { parseDateOnly, todayDateOnly } from "@/lib/appointments";
import { getDemoStore } from "@/lib/demo-store";
import { sendAppointmentReminder } from "@/lib/email";
import { toPublicAppointment } from "@/lib/appointment-store";
import { Appointment } from "@/models/Appointment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tomorrowDate() {
  const date = parseDateOnly(todayDateOnly()) || new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const date = tomorrowDate();
  try {
    const db = await dbConnect();
    const items = db
      ? await Appointment.find({ date, status: "confirmed", reminderSentAt: { $exists: false } }).lean()
      : getDemoStore().appointments.filter((item) => item.date === date && item.status === "confirmed" && !item.reminderSentAt);
    let sent = 0;
    let failed = 0;
    for (const item of items) {
      try {
        const delivery = await sendAppointmentReminder(toPublicAppointment(item as unknown as Record<string, unknown>));
        if (!delivery.sent) { failed += 1; continue; }
        if (db) await Appointment.findByIdAndUpdate(item._id, { reminderSentAt: new Date() });
        else {
          const demo = getDemoStore().appointments.find((entry) => entry._id === String(item._id));
          if (demo) demo.reminderSentAt = new Date().toISOString();
        }
        sent += 1;
      } catch (error) {
        console.error("Reminder delivery failed", error);
        failed += 1;
      }
    }
    return NextResponse.json({ ok: true, date, found: items.length, sent, failed });
  } catch (error) {
    console.error("Reminder cron error", error);
    return NextResponse.json({ error: "Reminder job failed" }, { status: 503 });
  }
}
