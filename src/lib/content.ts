import { doctors, posts, services } from "@/data/site";
import { dbConnect } from "@/lib/db";
import { getDemoStore, type DemoContentItem } from "@/lib/demo-store";
import { ContentItem } from "@/models/ContentItem";
import type { ContentType } from "@/types/admin";
import type { Doctor, Post, Service } from "@/types/site";

type ContentRecord = {
  _id?: unknown;
  type: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  meta?: Record<string, unknown>;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function serviceFromRecord(d: ContentRecord): Service {
  return {
    slug: d.slug,
    title: d.title,
    shortTitle: String(d.meta?.shortTitle || d.title),
    excerpt: d.excerpt || "",
    description: d.content || "",
    image: d.image || "/images/service-general.svg",
    icon: String(d.meta?.icon || "tooth"),
    features: Array.isArray(d.meta?.features) ? d.meta!.features!.map(String) : [],
  };
}

function doctorFromRecord(d: ContentRecord): Doctor {
  return {
    slug: d.slug,
    name: d.title,
    role: String(d.meta?.role || "Dentist"),
    qualification: String(d.meta?.qualification || ""),
    experience: String(d.meta?.experience || ""),
    image: d.image || "/images/doctor-amina.svg",
    bio: d.content || d.excerpt || "",
    specialties: Array.isArray(d.meta?.specialties) ? d.meta!.specialties!.map(String) : [],
  };
}

function postFromRecord(d: ContentRecord): Post {
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt || "",
    content: String(d.content || "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
    image: d.image || "/images/blog-healthy.svg",
    date: String(d.meta?.date || ""),
    category: String(d.meta?.category || "Dental Care"),
    readTime: String(d.meta?.readTime || "5 min read"),
  };
}

export function defaultContentRecords(type?: ContentType): ContentRecord[] {
  const all: ContentRecord[] = [
    ...services.map((item) => ({ type: "service" as const, slug: item.slug, title: item.title, excerpt: item.excerpt, content: item.description, image: item.image, meta: { shortTitle: item.shortTitle, icon: item.icon, features: item.features }, published: true })),
    ...doctors.map((item) => ({ type: "doctor" as const, slug: item.slug, title: item.name, excerpt: item.bio, content: item.bio, image: item.image, meta: { role: item.role, qualification: item.qualification, experience: item.experience, specialties: item.specialties }, published: true })),
    ...posts.map((item) => ({ type: "post" as const, slug: item.slug, title: item.title, excerpt: item.excerpt, content: item.content.join("\n\n"), image: item.image, meta: { date: item.date, category: item.category, readTime: item.readTime }, published: true })),
  ];
  return type ? all.filter((item) => item.type === type) : all;
}

export async function getContentOverrides(type?: ContentType): Promise<ContentRecord[]> {
  const db = await dbConnect();
  if (!db) {
    const items = getDemoStore().content;
    return (type ? items.filter((item) => item.type === type) : items) as DemoContentItem[];
  }
  const query = type ? { type } : {};
  return (await ContentItem.find(query).lean()) as unknown as ContentRecord[];
}

function mergePublic<T extends { slug: string }>(
  defaults: T[],
  records: ContentRecord[],
  mapper: (record: ContentRecord) => T,
) {
  const overrideMap = new Map(records.map((record) => [record.slug, record]));
  const result: T[] = [];
  for (const item of defaults) {
    const override = overrideMap.get(item.slug);
    if (!override) result.push(item);
    else if (override.published) result.push(mapper(override));
    overrideMap.delete(item.slug);
  }
  for (const record of overrideMap.values()) if (record.published) result.push(mapper(record));
  return result;
}

export async function getServices(): Promise<Service[]> {
  return mergePublic(services, await getContentOverrides("service"), serviceFromRecord);
}

export async function getDoctors(): Promise<Doctor[]> {
  return mergePublic(doctors, await getContentOverrides("doctor"), doctorFromRecord);
}

export async function getPosts(): Promise<Post[]> {
  return mergePublic(posts, await getContentOverrides("post"), postFromRecord);
}

export function virtualContentId(type: ContentType, slug: string) {
  return `default:${type}:${slug}`;
}

export function parseVirtualContentId(value: string) {
  const match = /^default:(service|doctor|post):(.+)$/.exec(decodeURIComponent(value));
  return match ? { type: match[1] as ContentType, slug: match[2] } : null;
}

export async function getAdminContent(type: ContentType) {
  const defaults = defaultContentRecords(type);
  const overrides = await getContentOverrides(type);
  const map = new Map(overrides.map((item) => [item.slug, item]));
  const result = defaults.map((item) => {
    const override = map.get(item.slug);
    map.delete(item.slug);
    if (override) return { ...override, _id: String(override._id), isDefault: true, hasOverride: true };
    return {
      ...item,
      _id: virtualContentId(type, item.slug),
      isDefault: true,
      hasOverride: false,
      createdAt: null,
      updatedAt: null,
    };
  });
  for (const item of map.values()) result.push({ ...item, _id: String(item._id), isDefault: false, hasOverride: false });
  return result;
}

export function findDefaultContent(type: ContentType, slug: string) {
  return defaultContentRecords(type).find((item) => item.slug === slug) || null;
}
