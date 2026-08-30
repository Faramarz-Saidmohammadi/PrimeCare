import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, validateAdminCredentials, verifySessionToken } from "@/lib/auth";

afterEach(() => vi.unstubAllEnvs());

describe("administrator authentication", () => {
  it("validates configured credentials exactly", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@primecare.test");
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery staple");
    expect(validateAdminCredentials("owner@primecare.test", "correct horse battery staple")).toBe(true);
    expect(validateAdminCredentials("Owner@primecare.test", "correct horse battery staple")).toBe(false);
    expect(validateAdminCredentials("owner@primecare.test", "wrong password")).toBe(false);
  });

  it("creates a verifiable session and rejects tampering", () => {
    vi.stubEnv("AUTH_SECRET", "a-test-secret-that-is-long-and-unique-enough-for-session-signing");
    const token = createSessionToken("owner@primecare.test");
    expect(verifySessionToken(token)?.email).toBe("owner@primecare.test");

    const [payload, signature] = token.split(".");
    const tampered = `${payload}.${signature.slice(0, -1)}${signature.endsWith("A") ? "B" : "A"}`;
    expect(verifySessionToken(tampered)).toBeNull();
    expect(verifySessionToken("not-a-session")).toBeNull();
  });
});
