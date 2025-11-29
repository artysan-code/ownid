import { Router } from "oak";
import authRouter from "./auth.ts";
import userRouter from "./user.ts";
import issuerRouter from "./issuer.ts";
import blockchainRouter from "./blockchain.ts";
import adminRouter from "./admin.ts";
import credentialsRouter from "./credentials.ts";

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
router.use("/api/issuer", issuerRouter.routes(), issuerRouter.allowedMethods());
router.use("/api/admin", adminRouter.routes(), adminRouter.allowedMethods());
router.use("/api/credentials", credentialsRouter.routes(), credentialsRouter.allowedMethods());
router.use("/api", blockchainRouter.routes(), blockchainRouter.allowedMethods());

export default router;
