import { Router, type IRouter } from "express";
import healthRouter from "./health";
import saarthiRouter from "./saarthi";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(saarthiRouter);
router.use(adminRouter);

export default router;
