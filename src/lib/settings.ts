import { site } from "@/data/site";
import { dbConnect } from "@/lib/db";
import { getDemoStore } from "@/lib/demo-store";
import { SiteSettingsModel } from "@/models/SiteSettings";
import type { SiteSettings } from "@/types/admin";

const defaults: SiteSettings = {
  ...site,
  social: { facebook: "", instagram: "", x: "", linkedin: "" },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await dbConnect();
  if (!db) {
    const demo = getDemoStore().settings;
    return { ...defaults, ...demo, social: { ...defaults.social, ...(demo?.social || {}) } };
  }
  const doc = await SiteSettingsModel.findOne({ key: "main" }).lean();
  if (!doc) return defaults;
  return {
    name: String(doc.name || defaults.name),
    phone: String(doc.phone || defaults.phone),
    email: String(doc.email || defaults.email),
    address: String(doc.address || defaults.address),
    emergency: String(doc.emergency || defaults.emergency),
    hours: Array.isArray(doc.hours) && doc.hours.length ? doc.hours.map(String) : defaults.hours,
    social: { ...defaults.social, ...(doc.social || {}) },
  };
}

export async function saveSiteSettings(settings: SiteSettings) {
  const db = await dbConnect();
  if (!db) {
    getDemoStore().settings = settings;
    return { ...settings, _id: "demo-settings", updatedAt: new Date().toISOString() };
  }
  return SiteSettingsModel.findOneAndUpdate(
    { key: "main" },
    { ...settings, key: "main" },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
}
