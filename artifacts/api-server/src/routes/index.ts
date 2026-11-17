import { Router, type IRouter } from "express";
import assistantRouter from "./assistant";
import healthRouter from "./health";
import saarthiRouter from "./saarthi";
import adminRouter from "./admin";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(assistantRouter);
router.use(healthRouter);
router.use(saarthiRouter);
router.use(paymentsRouter);
router.use(adminRouter);

export default router;
