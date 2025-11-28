import { Router } from "oak";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { JWT_SECRET } from "./auth.ts";

const router = new Router();

// Middleware to verify JWT
async function authenticateToken(ctx: any, next: () => Promise<unknown>) {
  const authHeader = ctx.request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token mancante" };
    return;
  }

  try {
    const payload = await verify(token, JWT_SECRET);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    ctx.response.status = 403;
    ctx.response.body = { error: "Token non valido" };
  }
}

// GET /api/user/profile
router.get("/profile", authenticateToken, (ctx) => {
  ctx.response.body = {
    user: ctx.state.user,
  };
});

// PUT /api/user/profile
router.put("/profile", authenticateToken, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { nome, cognome } = body;

    // Update user (in production, update database)
    ctx.response.body = {
      message: "Profilo aggiornato",
      user: { ...ctx.state.user, nome, cognome },
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante l'aggiornamento" };
  }
});

export default router;
