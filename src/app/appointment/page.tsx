import Link from "next/link";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "Book an Appointment" };

export default async function AppointmentPage({ searchParams }: { searchParams: Promise<{ doctor?: string; reason?: string }> }) {
  const [settings, query] = await Promise.all([getSiteSettings(), searchParams]);
  return <><PageHero eyebrow="Online booking" title="Request your dental appointment" text="Choose an available date and time. A staff member will review the request and email you when it is confirmed."/><section className="section section-muted"><div className="container appointment-page-grid"><aside><h2>Before you submit</h2><p>Your selected time is temporarily reserved after submission, but the visit is only final when its status is confirmed. For urgent symptoms, call the clinic directly.</p><div className="appointment-note"><Icon name="phone"/><span><small>Emergency line</small><strong>{settings.emergency}</strong></span></div><div className="appointment-note"><Icon name="clock"/><span><small>Opening hours</small>{settings.hours.map((hour) => <strong key={hour}>{hour}</strong>)}</span></div><Link className="text-link appointment-manage-link" href="/appointment/manage">Already booked? Check or cancel your appointment →</Link></aside><div className="booking-panel light-panel"><AppointmentForm initialDoctorSlug={query.doctor || ""} initialReason={query.reason || "Routine Checkup"}/></div></div></section></>;
}
