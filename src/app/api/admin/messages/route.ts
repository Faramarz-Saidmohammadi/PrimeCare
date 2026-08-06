import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { dbConnect } from "@/lib/db";
import { getDemoStore } from "@/lib/demo-store";
import { parsePositiveInt } from "@/lib/request";
import { ContactMessage } from "@/models/ContactMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const params = request.nextUrl.searchParams;
  const page = parsePositiveInt(params.get("page"), 1, 10_000);
  const limit = parsePositiveInt(params.get("limit"), 20, 100);
  const search = params.get("q")?.trim() || "";
  const status = params.get("status")?.trim() || "";
  try {
    const db = await dbConnect();
    if (!db) {
      let items = [...getDemoStore().messages];
      if (search) {
        const value = search.toLowerCase();
        items = items.filter((item) => [item.name, item.email, item.phone, item.subject, item.message].some((field) => String(field || "").toLowerCase().includes(value)));
      }
      if (status) items = items.filter((item) => item.status === status);
      const total = items.length;
      return NextResponse.json({ items: items.slice((page - 1) * limit, page * limit), total, page, pages: Math.max(1, Math.ceil(total / limit)), demo: true });
    }
    const query: Record<string, unknown> = {};
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }, { subject: pattern }, { message: pattern }];
    }
    if (["new", "read", "resolved"].includes(status)) query.status = status;
    const [items, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ContactMessage.countDocuments(query),
    ]);
    return NextResponse.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Admin messages list error", error);
    return NextResponse.json({ error: "Unable to load messages" }, { status: 503 });
  }
}
