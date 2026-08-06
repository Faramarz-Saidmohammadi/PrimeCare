import { Schema, model, models } from "mongoose";

const ContentItemSchema = new Schema({
  type: { type: String, enum: ["service", "doctor", "post"], required: true, index: true },
  slug: { type: String, required: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, trim: true },
  content: { type: String, trim: true },
  image: { type: String, trim: true },
  meta: { type: Schema.Types.Mixed, default: {} },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

ContentItemSchema.index({ type: 1, slug: 1 }, { unique: true });
ContentItemSchema.index({ updatedAt: -1 });
export const ContentItem = models.ContentItem || model("ContentItem", ContentItemSchema);
