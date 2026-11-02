import { model, Schema } from "mongoose";

export interface ILocation {
  _id: number;
  name: string;
  city: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string;
  rating: number;
  culturalInsight?: string | null;
  cuisine?: string | null;
  lat?: number | null;
  lng?: number | null;
  isFeatured: boolean;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    _id: { type: Number },
    name: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number, required: true, default: 4.0 },
    culturalInsight: { type: String, default: null },
    cuisine: { type: String, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    isFeatured: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { id: false },
);

export const LocationModel = model<ILocation>("Location", LocationSchema);
