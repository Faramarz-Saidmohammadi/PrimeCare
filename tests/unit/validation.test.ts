import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDateOnly, todayDateOnly } from "@/lib/appointments";
import { validateAppointment, validateContact, validateContent, validateSettings } from "@/lib/validation";

afterEach(() => vi.unstubAllEnvs());

function nextOpenDate() {
  const date = parseDateOnly(todayDateOnly())!;
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

describe("public form validation", () => {
  it("normalizes and accepts a complete appointment", () => {
    vi.stubEnv("CLINIC_TIME_ZONE", "UTC");
    const result = validateAppointment({
      name: "  Ada Lovelace  ",
      email: "ADA@EXAMPLE.COM",
      phone: "+1 (555) 010-1234",
      date: nextOpenDate(),
      time: "09:00 AM",
      reason: "Routine Checkup",
      consent: true,
    });
    expect(result.errors).toEqual([]);
    expect(result.data).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", consent: true });
  });

  it("rejects spam, invalid contact details, and missing consent", () => {
    const result = validateContact({
      name: "A",
      email: "invalid",
      phone: "abc",
      subject: "x",
      message: "short",
      website: "bot.example",
      consent: false,
    });
    expect(result.errors).toEqual(expect.arrayContaining([
      "Spam submission rejected",
      "Name is required",
      "A valid email is required",
      "Enter a valid phone number",
      "Consent is required to process your message",
    ]));
  });
});

describe("administrator content validation", () => {
  it("allows local and HTTP image paths while rejecting executable or protocol-relative URLs", () => {
    const base = { type: "service", title: "Dental care", slug: "dental-care", excerpt: "", content: "", meta: {} };
    expect(validateContent({ ...base, image: "/images/care.svg" }).errors).toEqual([]);
    expect(validateContent({ ...base, image: "https://cdn.example.com/care.jpg" }).errors).toEqual([]);
    expect(validateContent({ ...base, image: "javascript:alert(1)" }).errors).toContain("Image must use a local path or an HTTP/HTTPS URL");
    expect(validateContent({ ...base, image: "//attacker.example/care.jpg" }).errors).toContain("Image must use a local path or an HTTP/HTTPS URL");
  });

  it("validates required clinic identity fields and social links", () => {
    const result = validateSettings({
      name: "PrimeCare",
      email: "clinic@example.com",
      phone: "+1 555 0100",
      emergency: "+1 555 0199",
      address: "100 Health Street",
      hours: ["Monday–Saturday: 9:00–17:00"],
      social: { linkedin: "https://linkedin.com/company/primecare" },
    });
    expect(result.errors).toEqual([]);
  });
});
