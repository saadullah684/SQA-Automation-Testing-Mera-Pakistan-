import { Router, type IRouter } from "express";
import { LocationModel } from "@workspace/db";
import { toPlain } from "@workspace/db";
import {
  ListLocationsQueryParams,
  GetLocationParams,
  ListLocationsResponse,
  GetFeaturedLocationsResponse,
  GetLocationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/locations", async (req, res): Promise<void> => {
  const parsed = ListLocationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { province, city, category, q } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (province) filter.province = { $regex: province, $options: "i" };
  if (city) filter.city = { $regex: city, $options: "i" };
  if (category) filter.category = { $regex: category, $options: "i" };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { province: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const docs = await LocationModel.find(filter).sort({ rating: -1 }).lean();
  res.json(ListLocationsResponse.parse(docs.map(toPlain)));
});

router.get("/locations/featured", async (_req, res): Promise<void> => {
  const docs = await LocationModel.find({ isFeatured: true }).limit(8).lean();
  res.json(GetFeaturedLocationsResponse.parse(docs.map(toPlain)));
});

router.get("/locations/:id", async (req, res): Promise<void> => {
  const params = GetLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doc = await LocationModel.findById(params.data.id).lean();
  if (!doc) {
    res.status(404).json({ error: "Location not found" });
    return;
  }

  res.json(GetLocationResponse.parse(toPlain(doc)));
});

export default router;
