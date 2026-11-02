import { model, Schema } from "mongoose";

export interface IFoodItem {
  _id: number;
  name: string;
  description: string;
  imageUrl: string;
  city: string;
  province: string;
  isSignature: boolean;
}

const FoodItemSchema = new Schema<IFoodItem>(
  {
    _id: { type: Number },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    isSignature: { type: Boolean, required: true, default: false },
  },
  { id: false },
);

FoodItemSchema.index({ city: 1 });
FoodItemSchema.index({ province: 1 });

export const FoodItemModel = model<IFoodItem>("FoodItem", FoodItemSchema);
