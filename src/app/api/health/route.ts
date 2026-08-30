import { NextResponse } from "next/server";
import { DatabaseConfigurationError, dbConnect } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await dbConnect();
    if (db) await db.connection.db?.admin().ping();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: db ? "connected" : "demo-mode",
      email: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? "configured" : "not-configured",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      return NextResponse.json({
        ok: false,
        timestamp: new Date().toISOString(),
        database: "not-configured",
        error: "Database configuration is required in production",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    console.error("Health check failed", error);
    return NextResponse.json({ ok: false, timestamp: new Date().toISOString(), database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
