import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as healthCheck } from "@/app/api/health/route";
import { DatabaseConfigurationError, dbConnect } from "@/lib/db";

afterEach(() => vi.unstubAllEnvs());

describe("database environment policy", () => {
  it("allows the in-memory fallback only outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONGODB_URI", "");
    await expect(dbConnect()).resolves.toBeNull();
  });

  it("fails closed when production persistence is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "");
    await expect(dbConnect()).rejects.toBeInstanceOf(DatabaseConfigurationError);
  });

  it("reports a production configuration failure as unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "");
    const response = await healthCheck();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      database: "not-configured",
    });
  });
});
