import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { createContent } from "@/lib/content-store";
import { getAdminContent } from "@/lib/content";
import { readJson } from "@/lib/request";
import { validateContent } from "@/lib/validation";
import type { ContentType } from "@/types/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const type = request.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !["service", "doctor", "post"].includes(type)) return NextResponse.json({ error: "Valid content type is required" }, { status: 400 });
  try {
    const items = await getAdminContent(type);
    return NextResponse.json({ items, total: items.length, demo: !process.env.MONGODB_URI });
  } catch (error) {
    console.error("Admin content list error", error);
    return NextResponse.json({ error: "Unable to load content" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { data, errors } = validateContent(body);
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  try {
    const item = await createContent(data as Parameters<typeof createContent>[0]);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === "DUPLICATE_CONTENT" || error.message.includes("E11000"))) return NextResponse.json({ error: "A content item with this type and slug already exists" }, { status: 409 });
    console.error("Admin content create error", error);
    return NextResponse.json({ error: "Unable to create content" }, { status: 503 });
  }
}
