import "dotenv/config";
import { dbConnect } from "../src/lib/db";
import { ContentItem } from "../src/models/ContentItem";
import { SiteSettingsModel } from "../src/models/SiteSettings";
import { doctors, posts, services, site } from "../src/data/site";

async function run() {
  const db = await dbConnect();
  if (!db) throw new Error("MONGODB_URI is required");
  await ContentItem.deleteMany({});
  await ContentItem.insertMany([
    ...services.map((item) => ({ type: "service", slug: item.slug, title: item.title, excerpt: item.excerpt, content: item.description, image: item.image, meta: { shortTitle: item.shortTitle, icon: item.icon, features: item.features }, published: true })),
    ...doctors.map((item) => ({ type: "doctor", slug: item.slug, title: item.name, excerpt: item.bio, content: item.bio, image: item.image, meta: { role: item.role, qualification: item.qualification, experience: item.experience, specialties: item.specialties }, published: true })),
    ...posts.map((item) => ({ type: "post", slug: item.slug, title: item.title, excerpt: item.excerpt, content: item.content.join("\n\n"), image: item.image, meta: { date: item.date, category: item.category, readTime: item.readTime }, published: true })),
  ]);
  await SiteSettingsModel.findOneAndUpdate(
    { key: "main" },
    { ...site, key: "main", social: { facebook: "", instagram: "", x: "", linkedin: "" } },
    { upsert: true, new: true, runValidators: true },
  );
  console.log("PrimeCare content and clinic settings seeded");
  await db.disconnect();
}

run().catch((error) => { console.error(error); process.exit(1); });
