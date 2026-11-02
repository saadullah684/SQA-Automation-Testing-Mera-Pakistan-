import { model, Schema } from "mongoose";

export interface IProvince {
  _id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  cityCount: number;
}

const ProvinceSchema = new Schema<IProvince>(
  {
    _id: { type: Number },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cityCount: { type: Number, required: true, default: 0 },
  },
  { id: false },
);

export const ProvinceModel = model<IProvince>("Province", ProvinceSchema);

export interface ICity {
  _id: number;
  name: string;
  province: string;
  description: string;
  imageUrl: string;
}

const CitySchema = new Schema<ICity>(
  {
    _id: { type: Number },
    name: { type: String, required: true },
    province: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { id: false },
);

export const CityModel = model<ICity>("City", CitySchema);
