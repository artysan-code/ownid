import { Router } from "oak";
import { verify } from "djwt";
import { query } from "../db/connection.ts";
import { JWT_SECRET } from "./auth.ts";
import { getContract } from "../services/blockchain.ts";

const router = new Router();

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@ownid.com";
const ADMIN_PASSWORD_HASH = Deno.env.get("ADMIN_PASSWORD_HASH");

interface Issuer {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  website: string | null;
  description: string | null;
  active: boolean;
  approved: boolean;
  created_at: Date;
}

/**
 * GET /api/admin/issuers/pending
 * Lista issuer in attesa di approvazione
 */
router.get("/issuers/pending", authenticateAdmin, async (ctx) => {
  try {
    const result = await query<Issuer>(
      `SELECT id, name, email, wallet_address, website, description, created_at
       FROM issuers
       WHERE approved = false
       ORDER BY created_at DESC`
    );

    ctx.response.body = {
      pendingIssuers: result.map((issuer) => ({
        id: issuer.id,
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.wallet_address,
        website: issuer.website,
        description: issuer.description,
        createdAt: issuer.created_at,
      })),
    };
  } catch (error) {
    console.error("Get pending issuers error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore recupero issuer pending" };
  }
});

/**
 * GET /api/admin/issuers
 * Lista tutti gli issuer
 */
router.get("/issuers", authenticateAdmin, async (ctx) => {
  try {
    const result = await query<Issuer>(
      `SELECT id, name, email, wallet_address, website, description, active, approved, created_at
       FROM issuers
       ORDER BY created_at DESC`
    );

    ctx.response.body = {
      issuers: result.map((issuer) => ({
        id: issuer.id,
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.wallet_address,
        website: issuer.website,
        description: issuer.description,
        active: issuer.active,
        approved: issuer.approved,
        createdAt: issuer.created_at,
      })),
    };
  } catch (error) {
    console.error("Get all issuers error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore recupero issuer" };
  }
});

/**
 * Approve issuer and register on-chain
 */
router.post("/issuers/:id/approve", authenticateAdmin, async (ctx) => {
  try {
    const issuerId = ctx.params.id;

    const issuerResult = await query<Issuer>(
      "SELECT * FROM issuers WHERE id = $1",
      [issuerId]
    );

    if (issuerResult.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Issuer non trovato" };
      return;
    }

    const issuer = issuerResult[0];

    if (issuer.approved) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Issuer già approvato" };
      return;
    }

    await query(
      "UPDATE issuers SET approved = true WHERE id = $1",
      [issuerId]
    );

    let txHash: string | null = null;
    try {
      const contract = getContract();
      const tx = await contract.addIssuer(issuer.name, issuer.wallet_address);
      const receipt = await tx.wait();
      txHash = receipt?.hash || null;
    } catch (error) {
      console.error("On-chain registration error:", error);
      await query(
        "UPDATE issuers SET approved = false WHERE id = $1",
        [issuerId]
      );
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Errore registrazione on-chain - approvazione annullata",
        details: error instanceof Error ? error.message : String(error),
      };
      return;
    }

    ctx.response.body = {
      message: "Issuer approvato e registrato on-chain con successo",
      issuer: {
        id: issuer.id,
        name: issuer.name,
        email: issuer.email,
        walletAddress: issuer.wallet_address,
        approved: true,
      },
      txHash,
    };
  } catch (error) {
    console.error("Approve issuer error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore approvazione issuer" };
  }
});

/**
 * Revoke issuer approval
 */
router.post("/issuers/:id/revoke", authenticateAdmin, async (ctx) => {
  try {
    const issuerId = ctx.params.id;

    const issuerResult = await query(
      "SELECT * FROM issuers WHERE id = $1",
      [issuerId]
    );

    if (issuerResult.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Issuer non trovato" };
      return;
    }

    const issuer = issuerResult[0];

    let txHash: string | null = null;
    try {
      const contract = getContract();
      const onChainIssuerId = await contract.walletToIssuerId(issuer.wallet_address);

      if (Number(onChainIssuerId) > 0) {
        const tx = await contract.revokeIssuer(onChainIssuerId);
        const receipt = await tx.wait();
        txHash = receipt?.hash || null;
      }
    } catch (error) {
      console.error("On-chain revoke error:", error);
    }

    await query(
      "UPDATE issuers SET approved = false, active = false WHERE id = $1",
      [issuerId]
    );

    ctx.response.body = {
      message: "Issuer revocato con successo",
      txHash,
      onChainRevoked: txHash !== null,
    };
  } catch (error) {
    console.error("Revoke issuer error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore revoca issuer" };
  }
});

/**
 * Authenticate admin via JWT
 */
async function authenticateAdmin(ctx: any, next: any) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token mancante" };
      return;
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET);

    ctx.state.admin = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token non valido o scaduto" };
  }
}

export default router;
