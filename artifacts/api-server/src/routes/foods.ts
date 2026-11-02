import { Router } from "express";
import { FoodItemModel, connectDb, toPlain } from "@workspace/db";

const router = Router();

router.get("/foods", async (req, res) => {
  await connectDb();
  const { city, province } = req.query as { city?: string; province?: string };

  const filter: Record<string, string> = {};
  if (city) filter.city = city;
  if (province) filter.province = province;

  const items = await FoodItemModel.find(filter).lean();
  res.json(items.map(toPlain));
});

export default router;
