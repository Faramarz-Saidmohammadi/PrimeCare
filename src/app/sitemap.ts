import type { MetadataRoute } from "next";
import { getDoctors, getPosts, getServices } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const [services, doctors, posts] = await Promise.all([getServices(), getDoctors(), getPosts()]);
  const staticRoutes = ["", "/about", "/services", "/doctors", "/gallery", "/blog", "/contact", "/appointment", "/appointment/manage", "/privacy", "/terms"].map((route) => ({ url: `${base}${route}`, lastModified: new Date() }));
  return [
    ...staticRoutes,
    ...services.map((service) => ({ url: `${base}/services/${service.slug}`, lastModified: new Date() })),
    ...doctors.map((doctor) => ({ url: `${base}/doctors/${doctor.slug}`, lastModified: new Date() })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: new Date() })),
  ];
}
