import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  return <><PageHero eyebrow="Contact PrimeCare" title="Speak with our clinic team" text="Contact us about appointments, services, records, insurance, or a current treatment plan."/><section className="section"><div className="container contact-grid"><div className="contact-details"><h2>Clinic information</h2><p>For urgent pain, swelling, trauma, or uncontrolled bleeding, call the emergency line rather than waiting for an email response.</p><a href={`tel:${settings.phone}`}><span><Icon name="phone"/></span><div><small>General enquiries</small><strong>{settings.phone}</strong></div></a><a href={`mailto:${settings.email}`}><span><Icon name="mail"/></span><div><small>Email</small><strong>{settings.email}</strong></div></a><div><span><Icon name="map"/></span><div><small>Clinic address</small><strong>{settings.address}</strong></div></div><a className="map-placeholder" href={mapUrl} target="_blank" rel="noreferrer"><Icon name="map" size={40}/><strong>{settings.name} Dental Clinic</strong><span>{settings.address}</span><small>Open in Google Maps</small></a></div><div><h2>Send a message</h2><ContactForm/></div></div></section></>;
}
