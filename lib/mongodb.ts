
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_TLS_INSECURE = process.env.MONGODB_TLS_INSECURE === "true";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache;
}

const cached: MongooseCache = globalThis.mongoose || { conn: null, promise: null };
globalThis.mongoose = cached;

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
        // Atlas requires TLS; make it explicit to avoid env/network weirdness.
        tls: true,
        // For debugging on networks that MITM TLS (corp proxy/AV).
        // Set MONGODB_TLS_INSECURE=true in .env.local temporarily if needed.
        ...(MONGODB_TLS_INSECURE
          ? { tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true }
          : {}),
      }) // <-- non-null assertion
      .then((m) => {
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;