import { model, Schema } from "mongoose";

export interface ISearchHistory {
  _id: number;
  userId: string;
  query: string;
  locationId?: number | null;
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    _id: { type: Number },
    userId: { type: String, required: true },
    query: { type: String, required: true },
    locationId: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { id: false },
);

export const SearchHistoryModel = model<ISearchHistory>(
  "SearchHistory",
  SearchHistorySchema,
);

export interface ISavedSpot {
  _id: number;
  userId: string;
  locationId: number;
  createdAt: Date;
}

const SavedSpotSchema = new Schema<ISavedSpot>(
  {
    _id: { type: Number },
    userId: { type: String, required: true },
    locationId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { id: false },
);

export const SavedSpotModel = model<ISavedSpot>("SavedSpot", SavedSpotSchema);
