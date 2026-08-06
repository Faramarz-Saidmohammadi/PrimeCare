import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "primecare_session";
type SessionPayload = { email: string; expiresAt: number };

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production");
  return value || "development-only-primecare-secret-change-me";
}

function sign(data: string) {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== "production" ? "admin@primecare.test" : "");
  const expectedPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "PrimeCare123!" : "");
  return Boolean(expectedEmail && expectedPassword && safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword));
}

export function createSessionToken(email: string) {
  const payload: SessionPayload = { email, expiresAt: Date.now() + 1000 * 60 * 60 * 8 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    if (!payload.email || !Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 },
};
