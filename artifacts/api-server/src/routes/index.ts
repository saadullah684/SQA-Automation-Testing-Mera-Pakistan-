import { Router, type IRouter } from "express";
import healthRouter from "./health";
import locationsRouter from "./locations";
import provincesRouter from "./provinces";
import dashboardRouter from "./dashboard";
import historyRouter from "./history";
import foodsRouter from "./foods";

const router: IRouter = Router();

router.use(healthRouter);
router.use(locationsRouter);
router.use(provincesRouter);
router.use(dashboardRouter);
router.use(historyRouter);
router.use(foodsRouter);

export default router;
