import { Schema, model, models } from "mongoose";

const SiteSettingsSchema = new Schema({
  key: { type: String, default: "main", unique: true, immutable: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  emergency: { type: String, required: true, trim: true },
  hours: [{ type: String, trim: true }],
  social: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    x: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  },
}, { timestamps: true });

export const SiteSettingsModel = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
