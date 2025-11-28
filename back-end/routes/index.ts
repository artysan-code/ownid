import { Router } from "oak";
import authRouter from "./auth.ts";
import userRouter from "./user.ts";

const router = new Router();

// Health check
router.get("/", (ctx) => {
  ctx.response.body = {
    status: "ok",
    message: "OwnID API",
    timestamp: new Date().toISOString(),
  };
});

// Mount sub-routers
router.use("/api/auth", authRouter.routes(), authRouter.allowedMethods());
router.use("/api/user", userRouter.routes(), userRouter.allowedMethods());

export default router;
