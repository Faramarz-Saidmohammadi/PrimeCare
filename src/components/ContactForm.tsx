"use client";

import { FormEvent, useState } from "react";

const initial = { name: "", email: "", phone: "", subject: "", message: "", website: "", consent: false };

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ loading: false, message: "", ok: false });
  const update = (key: string, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus({ loading: true, message: "", ok: false });
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send message");
      setForm(initial);
      setStatus({ loading: false, message: "Your message was saved and sent to the clinic team.", ok: true });
    } catch (error) {
      setStatus({ loading: false, message: error instanceof Error ? error.message : "Unable to send message", ok: false });
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="honeypot" aria-hidden="true"><input value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off"/></div>
      <label><span>Name *</span><input required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)}/></label>
      <label><span>Email *</span><input type="email" required autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)}/></label>
      <label><span>Phone</span><input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)}/></label>
      <label><span>Subject *</span><input required value={form.subject} onChange={(event) => update("subject", event.target.value)}/></label>
      <label className="full"><span>Message *</span><textarea required rows={7} value={form.message} onChange={(event) => update("message", event.target.value)}/></label>
      <label className="form-consent full"><input type="checkbox" required checked={form.consent} onChange={(event) => update("consent", event.target.checked)}/><span>I consent to PrimeCare using these details to respond to my enquiry. *</span></label>
      <div className="full"><button className="button" disabled={status.loading}>{status.loading ? "Sending…" : "Send message"}</button>{status.message ? <p className={status.ok ? "success" : "error"} role="status">{status.message}</p> : null}</div>
    </form>
  );
}
