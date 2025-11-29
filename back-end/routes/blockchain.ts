// Route per interagire con il contratto PublicBadgeNetwork
import { Router } from "oak";
import * as blockchain from "../services/blockchain.ts";
import { verify } from "djwt";

const router = new Router();
const JWT_SECRET = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

// Middleware per verificare JWT
async function requireAuth(ctx: any, next: () => Promise<unknown>) {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token mancante" };
    return;
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET);
    ctx.state.user = payload;
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token non valido" };
  }
}

// Test connessione blockchain
router.get("/blockchain/test", async (ctx) => {
  const result = await blockchain.testConnection();
  ctx.response.body = result;
});

// Registra un ente (richiede autenticazione)
router.post("/blockchain/register-entity", requireAuth, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { name, privateKey } = body;

    if (!name || !privateKey) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nome e private key richiesti" };
      return;
    }

    const wallet = blockchain.createWallet(privateKey);
    const result = await blockchain.registerEntity(name, wallet);

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Ente registrato con successo",
      data: result,
    };
  } catch (error) {
    console.error("Errore registrazione ente:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la registrazione",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Emetti un badge (richiede autenticazione + essere un ente registrato)
router.post("/blockchain/issue-badge", requireAuth, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const {
      studentAddress,
      title,
      specialization,
      daysValid,
      privateData,
      entityPrivateKey,
    } = body;

    if (!studentAddress || !title || !specialization || !entityPrivateKey) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Parametri mancanti" };
      return;
    }

    const wallet = blockchain.createWallet(entityPrivateKey);

    // Verifica che il wallet sia registrato come ente
    const entityId = await blockchain.getEntityId(wallet.address);
    if (entityId === 0) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Wallet non registrato come ente" };
      return;
    }

    const result = await blockchain.issueBadge(
      studentAddress,
      title,
      specialization,
      daysValid || 0,
      privateData || "",
      wallet
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "Badge emesso con successo",
      data: result,
    };
  } catch (error) {
    console.error("Errore emissione badge:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante l'emissione del badge",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Ottieni informazioni su un badge (pubblico)
router.get("/blockchain/badge/:id", async (ctx) => {
  try {
    const badgeId = parseInt(ctx.params.id);

    if (isNaN(badgeId)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "ID badge non valido" };
      return;
    }

    const badgeInfo = await blockchain.getBadgeInfo(badgeId);

    ctx.response.body = {
      success: true,
      data: badgeInfo,
    };
  } catch (error) {
    console.error("Errore lettura badge:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la lettura del badge",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Verifica dati privati di un badge
router.post("/blockchain/verify/:id", async (ctx) => {
  try {
    const badgeId = parseInt(ctx.params.id);
    const body = await ctx.request.body.json();
    const { privateData } = body;

    if (isNaN(badgeId) || !privateData) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Parametri mancanti" };
      return;
    }

    const isValid = await blockchain.verifyPrivateData(badgeId, privateData);

    ctx.response.body = {
      success: true,
      verified: isValid,
    };
  } catch (error) {
    console.error("Errore verifica dati:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la verifica",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Ottieni informazioni su un ente
router.get("/blockchain/entity/:id", async (ctx) => {
  try {
    const entityId = parseInt(ctx.params.id);

    if (isNaN(entityId)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "ID ente non valido" };
      return;
    }

    const entityInfo = await blockchain.getEntityInfo(entityId);

    ctx.response.body = {
      success: true,
      data: entityInfo,
    };
  } catch (error) {
    console.error("Errore lettura ente:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la lettura dell'ente",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Ottieni entityId da un indirizzo wallet
router.get("/blockchain/entity/wallet/:address", async (ctx) => {
  try {
    const address = ctx.params.address;
    const entityId = await blockchain.getEntityId(address);

    ctx.response.body = {
      success: true,
      data: {
        address,
        entityId,
        isEntity: entityId > 0,
      },
    };
  } catch (error) {
    console.error("Errore lettura entityId:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la lettura",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Ottieni badge di un utente
router.get("/blockchain/user/:address/badges", async (ctx) => {
  try {
    const address = ctx.params.address;
    const count = await blockchain.getUserBadgeCount(address);

    ctx.response.body = {
      success: true,
      data: {
        address,
        badgeCount: count,
      },
    };
  } catch (error) {
    console.error("Errore lettura badge utente:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore durante la lettura",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

export default router;
