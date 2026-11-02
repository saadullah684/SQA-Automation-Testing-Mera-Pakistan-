import { model, Schema } from "mongoose";

interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({ _id: String, seq: Number });

export const Counter = model<ICounter>("Counter", CounterSchema);

export async function getNextId(collection: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: collection },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return counter!.seq;
}
