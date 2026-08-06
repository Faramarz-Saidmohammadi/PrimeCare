import { AppointmentManager } from "@/components/AppointmentManager";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Manage Appointment" };

export default async function ManageAppointmentPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.slice(0, 100) : "";
  return <><PageHero eyebrow="Appointment status" title="Check or cancel your appointment" text="Use the secure link from your confirmation email, or enter your booking reference and email address."/><section className="section section-muted"><div className="container manage-appointment-container"><AppointmentManager initialToken={token}/></div></section></>;
}
