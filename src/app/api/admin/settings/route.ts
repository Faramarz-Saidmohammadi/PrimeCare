import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings";
import { readJson } from "@/lib/request";
import { validateSettings } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ item: await getSiteSettings(), demo: !process.env.MONGODB_URI });
  } catch (error) {
    console.error("Admin settings load error", error);
    return NextResponse.json({ error: "Unable to load settings" }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { data, errors } = validateSettings(body);
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  try {
    const item = await saveSiteSettings(data);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Admin settings save error", error);
    return NextResponse.json({ error: "Unable to save settings" }, { status: 503 });
  }
}
