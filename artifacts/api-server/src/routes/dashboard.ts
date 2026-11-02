import { Router, type IRouter } from "express";
import { LocationModel } from "@workspace/db";
import { toPlain } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const docs = await LocationModel.find().lean();
  const allLocations = docs.map(toPlain);

  const totalLocations = allLocations.length;
  const provinces = new Set(allLocations.map((l) => l.province));
  const cities = new Set(allLocations.map((l) => l.city));

  const topRatedLocations = [...allLocations]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const categoryMap = new Map<string, number>();
  for (const loc of allLocations) {
    categoryMap.set(loc.category, (categoryMap.get(loc.category) ?? 0) + 1);
  }
  const categoryCounts = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({ category, count }),
  );

  const summary = {
    totalLocations,
    totalProvinces: provinces.size,
    totalCities: cities.size,
    topRatedLocations,
    categoryCounts,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

export default router;
