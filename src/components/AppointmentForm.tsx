"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { appointmentReasons } from "@/lib/appointments";

type DoctorOption = { slug: string; name: string; role?: string };
type Slot = { time: string; available: boolean; remaining: number };

type Props = {
  compact?: boolean;
  initialDoctorSlug?: string;
  initialReason?: string;
};

function localDateString(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
}

export function AppointmentForm({ compact = false, initialDoctorSlug = "", initialReason = "Routine Checkup" }: Props) {
  const makeInitial = () => ({
    name: "",
    email: "",
    phone: "",
    location: "",
    medicalRecord: "",
    date: "",
    time: "",
    reason: appointmentReasons.includes(initialReason as (typeof appointmentReasons)[number]) ? initialReason : "Routine Checkup",
    doctorSlug: initialDoctorSlug,
    message: "",
    website: "",
    consent: false,
  });
  const [form, setForm] = useState(makeInitial);
  const [minDate, setMinDate] = useState(() => localDateString(new Date()));
  const [maxDate, setMaxDate] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [state, setState] = useState<{ loading: boolean; message: string; ok: boolean; reference?: string }>({ loading: false, message: "", ok: false });

  useEffect(() => {
    const today = new Date();
    fetch("/api/appointments")
      .then((response) => response.json())
      .then((data) => {
        setDoctors(data.doctors || []);
        setMinDate(String(data.minDate || localDateString(today)));
        if (data.maxDate) setMaxDate(String(data.maxDate));
        else {
          const max = new Date(today);
          max.setDate(max.getDate() + Number(data.horizonDays || 180));
          setMaxDate(localDateString(max));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!form.date) return;
    const controller = new AbortController();
    fetch(`/api/appointments?date=${encodeURIComponent(form.date)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load times");
        setDoctors(data.doctors || []);
        setSlots(data.slots || []);
        setForm((current) => current.time && !(data.slots || []).some((slot: Slot) => slot.time === current.time && slot.available) ? { ...current, time: "" } : current);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSlots([]);
        setState({ loading: false, message: error instanceof Error ? error.message : "Unable to load available times", ok: false });
      })
      .finally(() => setAvailabilityLoading(false));
    return () => controller.abort();
  }, [form.date]);

  const availableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots]);
  const update = (key: string, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState({ loading: true, message: "", ok: false });
    try {
      const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit appointment");
      const reference = String(data.reference || "");
      setForm(makeInitial());
      setSlots([]);
      setState({ loading: false, message: "Your appointment request was saved. Keep the reference number below to check or cancel it.", ok: true, reference });
    } catch (error) {
      setState({ loading: false, message: error instanceof Error ? error.message : "Unable to submit appointment", ok: false });
    }
  }

  return (
    <form className={`appointment-form ${compact ? "compact" : ""}`} onSubmit={submit}>
      <div className="honeypot" aria-hidden="true"><label>Website<input value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off"/></label></div>
      <label><span>Full name *</span><input required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Enter your full name"/></label>
      <label><span>Email *</span><input type="email" required autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@example.com"/></label>
      <label><span>Phone *</span><input type="tel" required autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Your phone number"/></label>
      <label><span>Location</span><input autoComplete="address-level2" value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="City or area"/></label>
      <label><span>Medical record</span><input value={form.medicalRecord} onChange={(event) => update("medicalRecord", event.target.value)} placeholder="Optional record number"/></label>
      <label><span>Preferred clinician</span><select value={form.doctorSlug} onChange={(event) => update("doctorSlug", event.target.value)}><option value="">Any available dentist</option>{doctors.map((doctor) => <option value={doctor.slug} key={doctor.slug}>{doctor.name}{doctor.role ? ` — ${doctor.role}` : ""}</option>)}</select></label>
      <label><span>Preferred date *</span><input type="date" min={minDate} max={maxDate || undefined} required value={form.date} onChange={(event) => { const date = event.target.value; setSlots([]); setAvailabilityLoading(Boolean(date)); setForm((current) => ({ ...current, date, time: "" })); }}/></label>
      <label><span>Preferred time *</span><select required disabled={!form.date || availabilityLoading} value={form.time} onChange={(event) => update("time", event.target.value)}><option value="">{availabilityLoading ? "Loading available times…" : form.date ? (availableSlots.length ? "Choose an available time" : "No times available") : "Choose a date first"}</option>{slots.map((slot) => <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}{slot.available ? ` — ${slot.remaining} left` : " — full"}</option>)}</select></label>
      <label><span>Reason for visit *</span><select required value={form.reason} onChange={(event) => update("reason", event.target.value)}>{appointmentReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label>
      <label className="full"><span>Additional details</span><textarea rows={compact ? 3 : 5} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Tell us anything the clinic should know"/></label>
      <label className="form-consent full"><input type="checkbox" required checked={form.consent} onChange={(event) => update("consent", event.target.checked)}/><span>I consent to PrimeCare using these details to arrange and manage my appointment. *</span></label>
      <div className="form-submit full">
        <button className="button" disabled={state.loading || availabilityLoading || !form.time}>{state.loading ? "Submitting…" : "Request appointment"}</button>
        {state.message ? <div className={state.ok ? "success form-result" : "error"} role="status"><p>{state.message}</p>{state.reference ? <><strong className="appointment-reference">{state.reference}</strong><Link href="/appointment/manage">Check or cancel this appointment</Link></> : null}</div> : null}
      </div>
    </form>
  );
}