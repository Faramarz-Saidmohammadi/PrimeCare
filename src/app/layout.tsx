import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteEffects } from "@/components/SiteEffects";
import { getServices } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Manrope({ subsets: ["latin"], variable: "--font-heading" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "PrimeCare Dental Clinic", template: "%s | PrimeCare" },
  description: "Modern dental care, online appointment booking, experienced clinicians, and clear treatment planning.",
  manifest: "/manifest.webmanifest",
  openGraph: { title: "PrimeCare Dental Clinic", description: "Modern care for healthier, more confident smiles.", images: ["/images/og-image.svg"] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  return <html lang="en"><body className={`${bodyFont.variable} ${headingFont.variable}`}><SiteEffects/><Header settings={settings}/><main>{children}</main><Footer settings={settings} services={services}/><a className="floating-book" href="/appointment" aria-label="Book an appointment">Book now</a></body></html>;
}
