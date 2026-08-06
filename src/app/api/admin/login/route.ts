import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookie, validateAdminCredentials } from "@/lib/auth";
import { getClientIp, readJson, cleanText } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limit = rateLimit(`login:${getClientIp(request)}`, 6, 5 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many login attempts" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const email = cleanText(body.email, 150).toLowerCase();
  const password = cleanText(body.password, 500);
  if (!validateAdminCredentials(email, password)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, createSessionToken(email), sessionCookie.options);
  return response;
}
