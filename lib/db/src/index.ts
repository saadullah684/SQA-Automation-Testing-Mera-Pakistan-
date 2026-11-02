import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set. Did you configure the secret?");
}

let connected = false;

export async function connectDb(): Promise<void> {
  if (connected) return;
  await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsInsecure: true, // allow self-signed / dev certs in Replit sandbox
    family: 4, // force IPv4
  });
  connected = true;
}

/**
 * Convert a lean Mongoose doc (has `_id: number`, may have `__v`) into a
 * plain object with `id: number` and no `_id` / `__v` fields — matching
 * the shape the Zod API schemas expect.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPlain(doc: any): any {
  if (!doc) return doc;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id };
}

export * from "./schema";
