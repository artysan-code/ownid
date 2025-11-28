import { Router } from "oak";
import { create, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const router = new Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

// Temporary in-memory user storage (replace with database)
const users = new Map<string, { id: string; nome: string; cognome: string; email: string; password: string }>();

// POST /api/auth/register
router.post("/register", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { nome, cognome, email, password } = body;

    // Validation
    if (!nome || !cognome || !email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Tutti i campi sono obbligatori" };
      return;
    }

    // Check if user exists
    if (users.has(email)) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Email già registrata" };
      return;
    }

    // Hash password (in production, use bcrypt or similar)
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = crypto.randomUUID();
    users.set(email, {
      id: userId,
      nome,
      cognome,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = await create(
      { alg: "HS512", typ: "JWT" },
      { userId, email, exp: Date.now() + 86400000 }, // 24h
      JWT_SECRET
    );

    ctx.response.status = 201;
    ctx.response.body = {
      message: "Registrazione completata",
      token,
      user: { id: userId, nome, cognome, email },
    };
  } catch (error) {
    console.error("Registration error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante la registrazione" };
  }
});

// POST /api/auth/login
router.post("/login", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Email e password obbligatorie" };
      return;
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenziali non valide" };
      return;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenziali non valide" };
      return;
    }

    // Generate JWT
    const token = await create(
      { alg: "HS512", typ: "JWT" },
      { userId: user.id, email: user.email, exp: Date.now() + 86400000 },
      JWT_SECRET
    );

    ctx.response.body = {
      message: "Login effettuato",
      token,
      user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email },
    };
  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante il login" };
  }
});

// POST /api/auth/logout
router.post("/logout", (ctx) => {
  ctx.response.body = { message: "Logout effettuato" };
});

// Helper functions
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export default router;
export { JWT_SECRET };
