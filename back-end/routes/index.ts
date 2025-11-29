import { Router } from "oak";
import authRouter from "./auth.ts";
import userRouter from "./user.ts";
import blockchainRouter from "./blockchain.ts";

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
router.use("/api", blockchainRouter.routes(), blockchainRouter.allowedMethods());

export default router;
