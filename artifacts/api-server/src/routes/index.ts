import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import contentRouter from "./content";
import eventsRouter from "./events";
import noticesRouter from "./notices";
import careersRouter from "./careers";
import adminRouter from "./admin";

const router: IRouter = Router();

// Public routes
router.use(healthRouter);
router.use(contactRouter);
router.use(contentRouter);
router.use(eventsRouter);
router.use(noticesRouter);
router.use(careersRouter);

// Protected Admin API routes
router.use("/admin", adminRouter);

export default router;
