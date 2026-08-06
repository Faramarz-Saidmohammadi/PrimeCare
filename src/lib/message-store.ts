import { dbConnect } from "@/lib/db";
import { demoId, getDemoStore, type DemoMessage } from "@/lib/demo-store";
import { ContactMessage } from "@/models/ContactMessage";

function isObjectId(value: string) { return /^[a-f\d]{24}$/i.test(value); }

export type MessageCreate = Omit<DemoMessage, "_id" | "createdAt" | "updatedAt" | "status" | "internalNotes">;

export async function createMessage(data: MessageCreate) {
  const db = await dbConnect();
  if (!db) {
    const now = new Date().toISOString();
    const item: DemoMessage = { _id: demoId("message"), ...data, status: "new", internalNotes: "", createdAt: now, updatedAt: now };
    getDemoStore().messages.unshift(item);
    return item;
  }
  const item = await ContactMessage.create(data);
  return JSON.parse(JSON.stringify(item));
}

export async function updateMessageById(id: string, update: Record<string, unknown>) {
  const db = await dbConnect();
  if (!db) {
    const item = getDemoStore().messages.find((entry) => entry._id === id);
    if (!item) return null;
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    return item;
  }
  if (!isObjectId(id)) return null;
  return ContactMessage.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
}

export async function deleteMessageById(id: string) {
  const db = await dbConnect();
  if (!db) {
    const store = getDemoStore();
    const index = store.messages.findIndex((item) => item._id === id);
    if (index < 0) return null;
    return store.messages.splice(index, 1)[0];
  }
  if (!isObjectId(id)) return null;
  return ContactMessage.findByIdAndDelete(id).lean();
}
