import { Schema, model, models } from "mongoose";

const ContactMessageSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  consent: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
  internalNotes: { type: String, trim: true },
}, { timestamps: true });

ContactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = models.ContactMessage || model("ContactMessage", ContactMessageSchema);
