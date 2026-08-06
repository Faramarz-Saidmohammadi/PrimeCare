import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/lib/message-store";
import { sendAdminNotification } from "@/lib/email";
import { escapeHtml, getClientIp, readJson } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { validateContact } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limit = rateLimit(`contact:${getClientIp(request)}`, 5, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { data, errors } = validateContact(body);
  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  try {
    const saved = await createMessage(data);
    await sendAdminNotification(
      `Website message: ${saved.subject}`,
      `<h2>New website message</h2><p><strong>From:</strong> ${escapeHtml(saved.name)} (${escapeHtml(saved.email)})</p><p><strong>Phone:</strong> ${escapeHtml(saved.phone || "Not provided")}</p><p><strong>Subject:</strong> ${escapeHtml(saved.subject)}</p><p>${escapeHtml(saved.message).replaceAll("\n", "<br>")}</p>`,
      saved.email,
    ).catch((error) => console.error("Contact notification error", error));
    return NextResponse.json({ ok: true, id: String(saved._id) }, { status: 201 });
  } catch (error) {
    console.error("Contact creation error", error);
    return NextResponse.json({ error: "Your message could not be saved. Please call the clinic or try again." }, { status: 503 });
  }
}
