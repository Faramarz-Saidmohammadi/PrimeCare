import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { deleteMessageById, updateMessageById } from "@/lib/message-store";
import { cleanText, readJson } from "@/lib/request";

export const runtime = "nodejs";
const statuses = new Set(["new", "read", "resolved"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) {
    const status = cleanText(body.status, 20);
    if (!statuses.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    update.status = status;
  }
  if (body.internalNotes !== undefined) update.internalNotes = cleanText(body.internalNotes, 2000);
  try {
    const item = await updateMessageById(id, update);
    if (!item) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Admin message update error", error);
    return NextResponse.json({ error: "Unable to update message" }, { status: 503 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const deleted = await deleteMessageById(id);
    if (!deleted) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin message delete error", error);
    return NextResponse.json({ error: "Unable to delete message" }, { status: 503 });
  }
}
