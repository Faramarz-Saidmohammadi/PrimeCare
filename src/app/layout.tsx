import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteEffects } from "@/components/SiteEffects";
import { getServices } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const systemFonts = {
  "--font-body": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  "--font-heading": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as React.CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "PrimeCare Dental Clinic", template: "%s | PrimeCare" },
  description: "Modern dental care, online appointment booking, and clear treatment planning.",
  manifest: "/manifest.webmanifest",
  openGraph: { title: "PrimeCare Dental Clinic", description: "Modern care for healthier, more confident smiles.", images: ["/images/og-image.svg"] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  return <html lang="en"><body style={systemFonts}><SiteEffects/><Header settings={settings}/><main>{children}</main><Footer settings={settings} services={services}/><a className="floating-book" href="/appointment" aria-label="Book an appointment">Book now</a></body></html>;
}
