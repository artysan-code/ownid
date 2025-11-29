import { Router } from "oak";
import { create } from "djwt";
import { query } from "../db/connection.ts";
import { ethers } from "ethers";

const router = new Router();

// JWT Secret (importato da auth.ts)
import { JWT_SECRET } from "./auth.ts";

// Interface per Issuer
interface Issuer {
  id: string;
  name: string;
  email: string;
  password: string;
  wallet_address: string;
  wallet_private_key: string;
  website: string | null;
  description: string | null;
  active: boolean;
  approved: boolean;
  created_at: Date;
}

/**
 * POST /api/issuer/register
 * Registrazione di un nuovo issuer (università, ente certificatore)
 */
router.post("/register", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { name, email, password, website, description } = body;

    // Validation
    if (!name || !email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nome, email e password sono obbligatori" };
      return;
    }

    // Check if issuer already exists
    const existingIssuers = await query<Issuer>(
      "SELECT id FROM issuers WHERE email = $1 OR name = $2",
      [email, name]
    );

    if (existingIssuers.length > 0) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Email o nome già registrati" };
      return;
    }

    // Generate wallet for issuer
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const walletPrivateKey = wallet.privateKey;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create issuer in database
    const issuerId = crypto.randomUUID();
    await query(
      `INSERT INTO issuers
       (id, name, email, password, wallet_address, wallet_private_key, website, description, active, approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false)`,
      [issuerId, name, email, hashedPassword, walletAddress, walletPrivateKey, website, description]
    );

    // Generate JWT
    const token = await create(
      { alg: "HS512", typ: "JWT" },
      {
        issuerId,
        email,
        role: "issuer",
        exp: Date.now() + 86400000, // 24h
      },
      JWT_SECRET
    );

    ctx.response.status = 201;
    ctx.response.body = {
      message: "Registrazione issuer completata. In attesa di approvazione admin.",
      token,
      issuer: {
        id: issuerId,
        name,
        email,
        walletAddress,
        approved: false,
      },
    };
  } catch (error) {
    console.error("Issuer registration error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante la registrazione issuer" };
  }
});

/**
 * POST /api/issuer/login
 * Login issuer
 */
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

    // Find issuer
    const issuers = await query<Issuer>(
      "SELECT * FROM issuers WHERE email = $1",
      [email]
    );

    if (issuers.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenziali non valide" };
      return;
    }

    const issuer = issuers[0];

    // Verify password
    const isValid = await verifyPassword(password, issuer.password);
    if (!isValid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Credenziali non valide" };
      return;
    }

    // Check if approved
    if (!issuer.approved) {
      ctx.response.status = 403;
      ctx.response.body = {
        error: "Account in attesa di approvazione da parte dell'amministratore",
      };
      return;
    }

    // Check if active
    if (!issuer.active) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Account disattivato" };
      return;
    }

    // Generate JWT
    const token = await create(
      { alg: "HS512", typ: "JWT" },
      {
        issuerId: issuer.id,
        email: issuer.email,
        role: "issuer",
        exp: Date.now() + 86400000,
      },
      JWT_SECRET
    );

    ctx.response.body = {
      message: "Login issuer effettuato",
      token,
      issuer: {
        id: issuer.id,
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.wallet_address,
        approved: issuer.approved,
        active: issuer.active,
      },
    };
  } catch (error) {
    console.error("Issuer login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore durante il login" };
  }
});

/**
 * GET /api/issuer/profile
 * Ottieni profilo issuer (richiede autenticazione)
 */
router.get("/profile", authenticateIssuer, async (ctx) => {
  try {
    const issuerId = ctx.state.issuer.issuerId;

    const issuers = await query<Issuer>(
      "SELECT id, name, email, wallet_address, website, description, active, approved, created_at FROM issuers WHERE id = $1",
      [issuerId]
    );

    if (issuers.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Issuer non trovato" };
      return;
    }

    const issuer = issuers[0];

    ctx.response.body = {
      issuer: {
        id: issuer.id,
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.wallet_address,
        website: issuer.website,
        description: issuer.description,
        active: issuer.active,
        approved: issuer.approved,
        createdAt: issuer.created_at,
      },
    };
  } catch (error) {
    console.error("Get issuer profile error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore recupero profilo" };
  }
});

// Middleware: Authenticate Issuer
async function authenticateIssuer(ctx: any, next: any) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token mancante" };
      return;
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET);

    if (payload.role !== "issuer") {
      ctx.response.status = 403;
      ctx.response.body = { error: "Accesso riservato agli issuer" };
      return;
    }

    ctx.state.issuer = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token non valido" };
  }
}

// Helper functions
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// Import verify from djwt
import { verify } from "djwt";

export default router;
export { authenticateIssuer };
