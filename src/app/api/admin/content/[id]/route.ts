import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { findDefaultContent, parseVirtualContentId } from "@/lib/content";
import { deleteContentById, updateContentById, upsertContent } from "@/lib/content-store";
import { readJson } from "@/lib/request";
import { validateContent } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const virtual = parseVirtualContentId(id);
  const { data, errors } = validateContent(body);
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  if (virtual && (data.type !== virtual.type || data.slug !== virtual.slug)) {
    return NextResponse.json({ error: "The type and slug of built-in content cannot be changed. Create a new item instead." }, { status: 400 });
  }
  try {
    const item = virtual
      ? await upsertContent(virtual.type, virtual.slug, data as Parameters<typeof upsertContent>[2])
      : await updateContentById(id, data as Parameters<typeof updateContentById>[1]);
    if (!item) return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    console.error("Admin content update error", error);
    return NextResponse.json({ error: "Unable to update content" }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const virtual = parseVirtualContentId(id);
  try {
    if (virtual) {
      const base = findDefaultContent(virtual.type, virtual.slug);
      if (!base) return NextResponse.json({ error: "Default content not found" }, { status: 404 });
      const item = await upsertContent(virtual.type, virtual.slug, { ...base, published: false } as Parameters<typeof upsertContent>[2]);
      return NextResponse.json({ ok: true, item, action: "hidden" });
    }
    const deleted = await deleteContentById(id);
    if (!deleted) return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    const restoreDefault = request.nextUrl.searchParams.get("restoreDefault") === "true";
    return NextResponse.json({ ok: true, action: restoreDefault ? "restored" : "deleted" });
  } catch (error) {
    console.error("Admin content delete error", error);
    return NextResponse.json({ error: "Unable to delete content" }, { status: 503 });
  }
}
