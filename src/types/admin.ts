export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type MessageStatus = "new" | "read" | "resolved";
export type ContentType = "service" | "doctor" | "post";

export type PublicAppointment = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  doctorSlug?: string;
  doctorName?: string;
  status: AppointmentStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  emergency: string;
  hours: string[];
  social: {
    facebook: string;
    instagram: string;
    x: string;
    linkedin: string;
  };
};
