import { Schema, model, models } from "mongoose";

const AppointmentSchema = new Schema({
  reference: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
  cancelToken: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  medicalRecord: { type: String, trim: true },
  date: { type: String, required: true, index: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  doctorSlug: { type: String, trim: true, lowercase: true, index: true },
  doctorName: { type: String, trim: true },
  message: { type: String, trim: true },
  consent: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", index: true },
  internalNotes: { type: String, trim: true },
  reminderSentAt: { type: Date },
  slotNumber: { type: Number, required: true, min: 1 },
  active: { type: Boolean, required: true, default: true, index: true },
}, { timestamps: true });

AppointmentSchema.index({ date: 1, time: 1, doctorSlug: 1, status: 1 });
AppointmentSchema.index({ date: 1, time: 1, slotNumber: 1 }, { unique: true, partialFilterExpression: { active: true } });
AppointmentSchema.index({ createdAt: -1 });

export const Appointment = models.Appointment || model("Appointment", AppointmentSchema);
