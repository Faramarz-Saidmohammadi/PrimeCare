import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { todayDateOnly } from "@/lib/appointments";
import { getAdminContent } from "@/lib/content";
import { dbConnect } from "@/lib/db";
import { getDemoStore } from "@/lib/demo-store";
import { Appointment } from "@/models/Appointment";
import { ContactMessage } from "@/models/ContactMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const today = todayDateOnly();
    const db = await dbConnect();
    let appointments;
    let messages;
    if (!db) {
      const store = getDemoStore();
      appointments = {
        total: store.appointments.length,
        pending: store.appointments.filter((item) => item.status === "pending").length,
        confirmed: store.appointments.filter((item) => item.status === "confirmed").length,
        today: store.appointments.filter((item) => item.date === today && item.status !== "cancelled").length,
        upcoming: store.appointments.filter((item) => item.date >= today && ["pending", "confirmed"].includes(item.status)).length,
      };
      messages = {
        total: store.messages.length,
        new: store.messages.filter((item) => item.status === "new").length,
      };
    } else {
      const [total, pending, confirmed, todayCount, upcoming, totalMessages, newMessages] = await Promise.all([
        Appointment.countDocuments({}),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "confirmed" }),
        Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } }),
        Appointment.countDocuments({ date: { $gte: today }, status: { $in: ["pending", "confirmed"] } }),
        ContactMessage.countDocuments({}),
        ContactMessage.countDocuments({ status: "new" }),
      ]);
      appointments = { total, pending, confirmed, today: todayCount, upcoming };
      messages = { total: totalMessages, new: newMessages };
    }
    const [serviceItems, doctorItems, postItems] = await Promise.all([
      getAdminContent("service"), getAdminContent("doctor"), getAdminContent("post"),
    ]);
    return NextResponse.json({ appointments, messages, content: { services: serviceItems.filter((item) => item.published).length, doctors: doctorItems.filter((item) => item.published).length, posts: postItems.filter((item) => item.published).length }, demo: !db });
  } catch (error) {
    console.error("Admin stats error", error);
    return NextResponse.json({ error: "Unable to load dashboard statistics" }, { status: 503 });
  }
}
