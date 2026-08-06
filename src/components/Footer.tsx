import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import type { Service } from "@/types/site";
import type { SiteSettings } from "@/types/admin";

export function Footer({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const socialLinks = [
    ["facebook", "Facebook", settings.social.facebook],
    ["instagram", "Instagram", settings.social.instagram],
    ["x", "X", settings.social.x],
    ["linkedin", "LinkedIn", settings.social.linkedin],
  ].filter(([, , href]) => Boolean(href));

  return (
    <footer className="pc-footer">
      <div className="container pc-footer-top">
        <div className="pc-footer-brand">
          <Logo light/>
          <p>The goal of our clinic is to provide friendly, caring dentistry and the highest level of general, cosmetic and specialist dental treatments.</p>
          {socialLinks.length ? <div className="pc-socials" aria-label="Social links">{socialLinks.map(([key, label, href]) => <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label}>{label.slice(0, 2)}</a>)}</div> : null}
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href="/">Home</Link><Link href="/about">About Us</Link><Link href="/doctors">Our Doctors</Link><Link href="/contact">Contact Us</Link><Link href="/appointment/manage">Manage Appointment</Link>
        </div>
        <div>
          <h3>Our Services</h3>
          {services.slice(0, 5).map((service) => <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>)}
        </div>
        <div className="pc-footer-contact">
          <h3>Contact Info</h3>
          <a href={`mailto:${settings.email}`}><Icon name="mail" size={18}/><span>{settings.email}</span></a>
          <a href={`tel:${settings.phone}`}><Icon name="phone" size={18}/><span>{settings.phone}</span></a>
          <div><Icon name="map" size={18}/><span>{settings.address}</span></div>
        </div>
      </div>
      <div className="container pc-footer-bottom">
        <span>Copyright © {new Date().getFullYear()} {settings.name}. All Rights Reserved.</span>
        <div><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms & Conditions</Link></div>
      </div>
    </footer>
  );
}
