import { Router, type IRouter } from "express";
import { ProvinceModel, CityModel } from "@workspace/db";
import { toPlain } from "@workspace/db";
import {
  ListCitiesByProvinceParams,
  ListProvincesResponse,
  ListCitiesByProvinceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/provinces", async (_req, res): Promise<void> => {
  const docs = await ProvinceModel.find().sort({ name: 1 }).lean();
  res.json(ListProvincesResponse.parse(docs.map(toPlain)));
});

router.get("/provinces/:slug/cities", async (req, res): Promise<void> => {
  const params = ListCitiesByProvinceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const province = await ProvinceModel.findOne({
    slug: params.data.slug,
  }).lean();

  if (!province) {
    res.status(404).json({ error: "Province not found" });
    return;
  }

  const cities = await CityModel.find({ province: province.name })
    .sort({ name: 1 })
    .lean();

  res.json(ListCitiesByProvinceResponse.parse(cities.map(toPlain)));
});

export default router;
