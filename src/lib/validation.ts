import { appointmentReasons, validateDateAndTime } from "@/lib/appointments";
import { cleanText } from "@/lib/request";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,40}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isSafeExternalUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeImagePath(value: string) {
  return !value || (value.startsWith("/") && !value.startsWith("//")) || isSafeExternalUrl(value);
}

export function validatePatientIdentity(input: { name: unknown; email: unknown; phone: unknown }) {
  const data = {
    name: cleanText(input.name, 100),
    email: cleanText(input.email, 150).toLowerCase(),
    phone: cleanText(input.phone, 40),
  };
  const errors: string[] = [];
  if (data.name.length < 2) errors.push("Name is required");
  if (!emailPattern.test(data.email)) errors.push("A valid email is required");
  if (!phonePattern.test(data.phone)) errors.push("A valid phone number is required");
  return { data, errors };
}

export function validateAppointment(input: Record<string, unknown>) {
  const data = {
    name: cleanText(input.name, 100),
    email: cleanText(input.email, 150).toLowerCase(),
    phone: cleanText(input.phone, 40),
    location: cleanText(input.location, 160),
    medicalRecord: cleanText(input.medicalRecord, 60),
    date: cleanText(input.date, 20),
    time: cleanText(input.time, 20),
    reason: cleanText(input.reason, 100),
    doctorSlug: cleanText(input.doctorSlug, 120),
    message: cleanText(input.message, 1000),
    website: cleanText(input.website, 100),
    consent: input.consent === true || input.consent === "true" || input.consent === "on",
  };
  const errors: string[] = [];
  if (data.website) errors.push("Spam submission rejected");
  if (data.name.length < 2) errors.push("Name is required");
  if (!emailPattern.test(data.email)) errors.push("A valid email is required");
  if (!phonePattern.test(data.phone)) errors.push("A valid phone number is required");
  if (!appointmentReasons.includes(data.reason as (typeof appointmentReasons)[number])) errors.push("Select a valid reason for the visit");
  if (data.doctorSlug && !slugPattern.test(data.doctorSlug)) errors.push("Select a valid clinician");
  if (!data.consent) errors.push("Consent is required to process the appointment request");
  errors.push(...validateDateAndTime(data.date, data.time));
  return { data, errors };
}

export function validateContact(input: Record<string, unknown>) {
  const data = {
    name: cleanText(input.name, 100),
    email: cleanText(input.email, 150).toLowerCase(),
    phone: cleanText(input.phone, 40),
    subject: cleanText(input.subject, 160),
    message: cleanText(input.message, 1500),
    website: cleanText(input.website, 100),
    consent: input.consent === true || input.consent === "true" || input.consent === "on",
  };
  const errors: string[] = [];
  if (data.website) errors.push("Spam submission rejected");
  if (data.name.length < 2) errors.push("Name is required");
  if (!emailPattern.test(data.email)) errors.push("A valid email is required");
  if (data.phone && !phonePattern.test(data.phone)) errors.push("Enter a valid phone number");
  if (data.subject.length < 3) errors.push("Subject is required");
  if (data.message.length < 10) errors.push("Message must contain at least 10 characters");
  if (!data.consent) errors.push("Consent is required to process your message");
  return { data, errors };
}

export function validateContent(input: Record<string, unknown>) {
  const type = cleanText(input.type, 20);
  const slug = cleanText(input.slug, 120).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const title = cleanText(input.title, 180);
  const excerpt = cleanText(input.excerpt, 600);
  const content = cleanText(input.content, 20_000);
  const image = cleanText(input.image, 1_000);
  const published = input.published !== false && input.published !== "false";
  const meta = input.meta && typeof input.meta === "object" && !Array.isArray(input.meta) ? input.meta as Record<string, unknown> : {};
  const errors: string[] = [];
  if (!["service", "doctor", "post"].includes(type)) errors.push("Invalid content type");
  if (title.length < 2) errors.push("Title is required");
  if (!slug || !slugPattern.test(slug)) errors.push("A valid slug is required");
  if (!isSafeImagePath(image)) errors.push("Image must use a local path or an HTTP/HTTPS URL");
  return { data: { type, slug, title, excerpt, content, image, meta, published }, errors };
}

export function validateSettings(input: Record<string, unknown>) {
  const socialInput = input.social && typeof input.social === "object" ? input.social as Record<string, unknown> : {};
  const hoursInput = Array.isArray(input.hours) ? input.hours : [];
  const data = {
    name: cleanText(input.name, 100),
    phone: cleanText(input.phone, 50),
    email: cleanText(input.email, 150).toLowerCase(),
    address: cleanText(input.address, 240),
    emergency: cleanText(input.emergency, 50),
    hours: hoursInput.map((value) => cleanText(value, 100)).filter(Boolean).slice(0, 7),
    social: {
      facebook: cleanText(socialInput.facebook, 500),
      instagram: cleanText(socialInput.instagram, 500),
      x: cleanText(socialInput.x, 500),
      linkedin: cleanText(socialInput.linkedin, 500),
    },
  };
  const errors: string[] = [];
  if (data.name.length < 2) errors.push("Clinic name is required");
  if (!phonePattern.test(data.phone)) errors.push("A valid clinic phone is required");
  if (!emailPattern.test(data.email)) errors.push("A valid clinic email is required");
  if (data.address.length < 5) errors.push("Clinic address is required");
  if (!phonePattern.test(data.emergency)) errors.push("A valid emergency phone is required");
  if (!data.hours.length) errors.push("At least one opening-hours line is required");
  for (const [network, url] of Object.entries(data.social)) {
    if (url && !isSafeExternalUrl(url)) errors.push(`${network} must be a valid HTTP/HTTPS URL`);
  }
  return { data, errors };
}
