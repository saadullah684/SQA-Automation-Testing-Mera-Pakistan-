import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import {
  SearchHistoryModel,
  SavedSpotModel,
  LocationModel,
  getNextId,
  toPlain,
} from "@workspace/db";
import {
  CreateHistoryBody,
  DeleteHistoryParams,
  ListHistoryResponse,
  CreateSavedBody,
  DeleteSavedParams,
  ListSavedResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// ─── Search History ───────────────────────────────────────────────────────────

router.get("/history", requireAuth, async (req: any, res): Promise<void> => {
  const docs = await SearchHistoryModel.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(ListHistoryResponse.parse(docs.map(toPlain)));
});

router.post("/history", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateHistoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = await getNextId("searchHistory");
  const doc = await SearchHistoryModel.create({
    _id: id,
    userId: req.userId,
    ...parsed.data,
  });

  res.status(201).json(toPlain(doc.toObject()));
});

router.delete(
  "/history/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeleteHistoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const deleted = await SearchHistoryModel.findOneAndDelete({
      _id: params.data.id,
      userId: req.userId,
    }).lean();

    if (!deleted) {
      res.status(404).json({ error: "History entry not found" });
      return;
    }

    res.sendStatus(204);
  },
);

// ─── Saved Spots ──────────────────────────────────────────────────────────────

router.get("/saved", requireAuth, async (req: any, res): Promise<void> => {
  const savedDocs = await SavedSpotModel.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();

  const locationIds = savedDocs.map((s) => s.locationId);
  const locationDocs = await LocationModel.find({
    _id: { $in: locationIds },
  }).lean();
  const locationMap = new Map(locationDocs.map((l) => [l._id, toPlain(l)]));

  const result = savedDocs.map((s) => ({
    ...toPlain(s),
    location: locationMap.get(s.locationId) ?? null,
  }));

  res.json(ListSavedResponse.parse(result));
});

router.post("/saved", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateSavedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = await getNextId("savedSpots");
  const doc = await SavedSpotModel.create({
    _id: id,
    userId: req.userId,
    ...parsed.data,
  });

  const locationDoc = await LocationModel.findById(doc.locationId).lean();

  res.status(201).json({
    ...toPlain(doc.toObject()),
    location: locationDoc ? toPlain(locationDoc) : null,
  });
});

router.delete(
  "/saved/:id",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const params = DeleteSavedParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const deleted = await SavedSpotModel.findOneAndDelete({
      _id: params.data.id,
      userId: req.userId,
    }).lean();

    if (!deleted) {
      res.status(404).json({ error: "Saved spot not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
