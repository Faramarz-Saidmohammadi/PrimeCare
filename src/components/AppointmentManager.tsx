"use client";

import { FormEvent, useEffect, useState } from "react";
import type { PublicAppointment } from "@/types/admin";

export function AppointmentManager({ initialToken = "" }: { initialToken?: string }) {
  const [credentials, setCredentials] = useState({ reference: "", email: "" });
  const [item, setItem] = useState<PublicAppointment | null>(null);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [state, setState] = useState({ loading: false, message: "", ok: false });

  async function request(method: "POST" | "PATCH", token = "") {
    setState({ loading: true, message: "", ok: false });
    try {
      const response = await fetch("/api/appointments/manage", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(token ? { token } : credentials) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to manage appointment");
      setItem(data.item);
      if (method === "POST") setActiveToken(token);
      setState({ loading: false, message: method === "PATCH" ? "The appointment was cancelled." : "Appointment found.", ok: true });
    } catch (error) {
      if (method === "POST") setItem(null);
      setState({ loading: false, message: error instanceof Error ? error.message : "Unable to manage appointment", ok: false });
    }
  }

  useEffect(() => {
    if (initialToken) void request("POST", initialToken);
    // The secure token is read once from the server-rendered page query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  async function lookup(event: FormEvent) {
    event.preventDefault();
    await request("POST");
  }

  async function cancel() {
    if (!window.confirm("Cancel this appointment request?")) return;
    await request("PATCH", activeToken);
  }

  return (
    <div className="appointment-manager">
      <form onSubmit={lookup} className="appointment-lookup-form">
        <label><span>Appointment reference</span><input required value={credentials.reference} onChange={(event) => setCredentials({ ...credentials, reference: event.target.value.toUpperCase() })} placeholder="PC-260806-ABC123"/></label>
        <label><span>Email used for booking</span><input type="email" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} placeholder="name@example.com"/></label>
        <button className="button" disabled={state.loading}>{state.loading ? "Checking…" : "Check appointment"}</button>
      </form>
      {state.message ? <p className={state.ok ? "success" : "error"} role="status">{state.message}</p> : null}
      {item ? <section className="appointment-status-card"><div className="appointment-status-heading"><div><small>Reference</small><strong>{item.reference}</strong></div><span className={`badge status-${item.status}`}>{item.status}</span></div><dl><div><dt>Patient</dt><dd>{item.name}</dd></div><div><dt>Date</dt><dd>{item.date}</dd></div><div><dt>Time</dt><dd>{item.time}</dd></div><div><dt>Reason</dt><dd>{item.reason}</dd></div><div><dt>Clinician</dt><dd>{item.doctorName || "Any available dentist"}</dd></div></dl>{["pending", "confirmed"].includes(item.status) ? <button className="cancel-appointment-button" onClick={cancel} disabled={state.loading}>Cancel appointment</button> : null}</section> : null}
    </div>
  );
}
