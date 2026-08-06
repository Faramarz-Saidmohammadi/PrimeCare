import mongoose from "mongoose";

type Cached = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongoose = globalThis as typeof globalThis & { mongooseCache?: Cached };
const cached = globalForMongoose.mongooseCache ?? { connection: null, promise: null };
globalForMongoose.mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (cached.connection) return cached.connection;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8_000,
      socketTimeoutMS: 20_000,
    });
  }
  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    cached.connection = null;
    throw error;
  }
}
