import type { AppointmentStatus, ContentType, MessageStatus, SiteSettings } from "@/types/admin";

export type DemoAppointment = {
  _id: string;
  reference: string;
  cancelToken: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  medicalRecord?: string;
  date: string;
  time: string;
  reason: string;
  doctorSlug?: string;
  doctorName?: string;
  message?: string;
  consent: boolean;
  status: AppointmentStatus;
  internalNotes?: string;
  reminderSentAt?: string;
  slotNumber: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DemoMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
  status: MessageStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoContentItem = {
  _id: string;
  type: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  meta: Record<string, unknown>;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type DemoStore = {
  appointments: DemoAppointment[];
  messages: DemoMessage[];
  content: DemoContentItem[];
  settings: Partial<SiteSettings> | null;
};

const globalStore = globalThis as typeof globalThis & { primeCareDemoStore?: DemoStore };

export function getDemoStore(): DemoStore {
  if (!globalStore.primeCareDemoStore) {
    globalStore.primeCareDemoStore = {
      appointments: [],
      messages: [],
      content: [],
      settings: null,
    };
  }
  return globalStore.primeCareDemoStore;
}

export function demoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
