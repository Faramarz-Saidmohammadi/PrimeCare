"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import type { SiteSettings } from "@/types/admin";

const links = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/services", "Services"],
  ["/doctors", "Doctors"],
  ["/gallery", "Gallery"],
  ["/blog", "Blog"],
  ["/contact", "Contact Us"],
];

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = open && window.innerWidth <= 900 ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="pc-topbar">
        <div className="container pc-topbar-inner">
          <span>Need Help?</span>
          <a href={`tel:${settings.phone}`}><Icon name="phone" size={15}/>{settings.phone}</a>
          <span className="pc-topbar-message">Trusted dental care for your whole family</span>
        </div>
      </div>
      <header ref={headerRef} className={`pc-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container pc-header-inner">
          <Logo/>
          <nav className={`pc-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
            {links.map(([href, label]) => <Link key={href} href={href} className={active(href) ? "active" : ""} aria-current={active(href) ? "page" : undefined}>{label}</Link>)}
            <Link href="/appointment" className="pc-mobile-appointment">Make Appointment</Link>
          </nav>
          <Link href="/appointment" className="pc-header-cta">Make Appointment <Icon name="arrow" size={18}/></Link>
          <button type="button" className="pc-menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}><Icon name={open ? "x" : "menu"}/></button>
        </div>
      </header>
      {open ? <button className="mobile-menu-overlay" aria-label="Close menu" onClick={() => setOpen(false)}/> : null}
    </>
  );
}