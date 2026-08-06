import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return <><PageHero eyebrow="Legal" title="Privacy policy" text="How PrimeCare collects, uses, stores, and protects information submitted through this website."/><section className="section"><article className="container legal-document"><h2>Information we collect</h2><p>We collect information you provide through appointment and contact forms, including your name, contact details, appointment preferences, medical-record reference when supplied, and any message you send.</p><h2>How information is used</h2><p>Information is used to respond to enquiries, arrange and manage appointments, provide reminders, maintain clinic administration records, and protect the website against misuse.</p><h2>Storage and access</h2><p>Production records are stored in the clinic&apos;s configured database and are accessible only to authorised administrators. Email notifications may be processed by the configured email provider.</p><h2>Retention and deletion</h2><p>Records are retained only as long as needed for clinic operations, legal obligations, or dispute resolution. Contact the clinic to request access, correction, or deletion where applicable.</p><h2>Contact</h2><p>Questions about privacy can be sent to <a href={`mailto:${settings.email}`}>{settings.email}</a> or discussed by calling <a href={`tel:${settings.phone}`}>{settings.phone}</a>.</p></article></section></>;
}
