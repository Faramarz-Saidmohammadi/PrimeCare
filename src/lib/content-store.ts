import { dbConnect } from "@/lib/db";
import { demoId, getDemoStore, type DemoContentItem } from "@/lib/demo-store";
import { ContentItem } from "@/models/ContentItem";
import type { ContentType } from "@/types/admin";

function isObjectId(value: string) { return /^[a-f\d]{24}$/i.test(value); }

export type ContentInput = {
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  meta: Record<string, unknown>;
  published: boolean;
};

export async function createContent(input: ContentInput) {
  const db = await dbConnect();
  if (!db) {
    const store = getDemoStore();
    if (store.content.some((item) => item.type === input.type && item.slug === input.slug)) throw new Error("DUPLICATE_CONTENT");
    const now = new Date().toISOString();
    const item: DemoContentItem = { _id: demoId("content"), ...input, createdAt: now, updatedAt: now };
    store.content.unshift(item);
    return item;
  }
  return ContentItem.create(input);
}

export async function upsertContent(type: ContentType, slug: string, input: ContentInput) {
  const db = await dbConnect();
  if (!db) {
    const store = getDemoStore();
    const existing = store.content.find((item) => item.type === type && item.slug === slug);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, input, { updatedAt: now });
      return existing;
    }
    const item: DemoContentItem = { _id: demoId("content"), ...input, createdAt: now, updatedAt: now };
    store.content.unshift(item);
    return item;
  }
  return ContentItem.findOneAndUpdate({ type, slug }, input, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
}

export async function updateContentById(id: string, input: ContentInput) {
  const db = await dbConnect();
  if (!db) {
    const item = getDemoStore().content.find((entry) => entry._id === id);
    if (!item) return null;
    Object.assign(item, input, { updatedAt: new Date().toISOString() });
    return item;
  }
  if (!isObjectId(id)) return null;
  return ContentItem.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean();
}

export async function deleteContentById(id: string) {
  const db = await dbConnect();
  if (!db) {
    const store = getDemoStore();
    const index = store.content.findIndex((item) => item._id === id);
    if (index < 0) return null;
    return store.content.splice(index, 1)[0];
  }
  if (!isObjectId(id)) return null;
  return ContentItem.findByIdAndDelete(id).lean();
}
