import { Router } from "oak";
import { verify } from "djwt";
import { JWT_SECRET } from "./auth.ts";
import { query } from "../db/connection.ts";

const router = new Router();

interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  created_at: Date;
}

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
router.get("/profile", authenticateToken, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    
    const users = await query<User>(
      "SELECT id, nome, cognome, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (users.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Utente non trovato" };
      return;
    }

    ctx.response.body = {
      user: users[0],
    };
  } catch (error) {
    console.error("Profile error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante il recupero del profilo" };
  }
});

// PUT /api/user/profile
router.put("/profile", authenticateToken, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { nome, cognome } = body;
    const userId = ctx.state.user.userId;

    // Update user in database
    await query(
      "UPDATE users SET nome = $1, cognome = $2 WHERE id = $3",
      [nome, cognome, userId]
    );

    // Fetch updated user
    const users = await query<User>(
      "SELECT id, nome, cognome, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    ctx.response.body = {
      message: "Profilo aggiornato",
      user: users[0],
    };
  } catch (error) {
    console.error("Update error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante l'aggiornamento" };
  }
});

export default router;
