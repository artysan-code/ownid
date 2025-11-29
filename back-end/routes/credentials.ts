import { Router } from "oak";
import { verify } from "djwt";
import { query } from "../db/connection.ts";
import { JWT_SECRET } from "./auth.ts";
import { UserIdentifierService } from "../services/user-identifier.ts";
import { MerkleTreeGenerator } from "../services/merkle.ts";
import { ethers } from "npm:ethers@6.13.0";
import { getContract, getContractReadOnly } from "../services/blockchain.ts";

const router = new Router();

interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  wallet_address: string | null;
}

interface Issuer {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  wallet_private_key: string;
  approved: boolean;
  active: boolean;
}

/**
 * Issue new credential for user
 */
router.post("/issue", authenticateIssuer, async (ctx) => {
  try {
    const issuer = ctx.state.issuer as Issuer;

    if (!issuer.approved) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Issuer non ancora approvato dall'admin" };
      return;
    }

    if (!issuer.active) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Issuer non attivo" };
      return;
    }

    const {
      userId,
      credentialType,
      claims,
      daysValid = 365,
    } = await ctx.request.body.json();

    if (!userId || !credentialType || !claims || typeof claims !== "object") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Parametri mancanti: userId, credentialType, claims" };
      return;
    }

    const userResult = await query<User>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Utente non trovato" };
      return;
    }

    const user = userResult[0];
    const userIdentifier = UserIdentifierService.generateIdentifier(user);
    const merkleTree = MerkleTreeGenerator.generate(claims);
    const merkleRoot = merkleTree.root;
    const expiresAt = Math.floor(Date.now() / 1000) + daysValid * 24 * 60 * 60;

    const issuerWallet = new ethers.Wallet(issuer.wallet_private_key);
    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "string", "bytes32", "uint256"],
        [userIdentifier, credentialType, merkleRoot, expiresAt]
      )
    );
    const signature = await issuerWallet.signMessage(ethers.getBytes(messageHash));

    let txHash: string | null = null;
    try {
      const contract = getContract();
      const tx = await contract.registerClaim(
        userIdentifier,
        credentialType,
        merkleRoot,
        expiresAt,
        signature
      );
      const receipt = await tx.wait();
      txHash = receipt?.hash || null;
    } catch (error) {
      console.error("Blockchain registration error:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Errore registrazione on-chain",
        details: error instanceof Error ? error.message : String(error),
      };
      return;
    }

    const claimId = UserIdentifierService.generateClaimId(
      userIdentifier,
      credentialType,
      parseInt(issuer.id)
    );

    const notificationId = crypto.randomUUID();
    await query(
      `INSERT INTO claim_notifications
       (id, user_id, user_identifier, claim_id, issuer_id, credential_type, tx_hash, notified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
      [
        notificationId,
        user.id,
        userIdentifier,
        claimId,
        issuer.id,
        credentialType,
        txHash,
      ]
    );

    const credential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      id: `urn:uuid:${notificationId}`,
      type: ["VerifiableCredential", credentialType],
      issuer: {
        id: issuer.wallet_address,
        name: issuer.name,
      },
      credentialSubject: {
        id: userIdentifier,
        claims: claims,
      },
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(expiresAt * 1000).toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        merkleRoot: merkleRoot,
        merkleTree: {
          leaves: merkleTree.leaves,
          layers: merkleTree.layers,
        },
        issuerSignature: signature,
        claimId: claimId,
      },
    };

    ctx.response.body = {
      message: "Credenziale emessa con successo",
      credential,
      txHash,
      claimId,
      notification: {
        id: notificationId,
        userEmail: user.email,
        userName: `${user.nome} ${user.cognome}`,
      },
    };
  } catch (error) {
    console.error("Issue credential error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore emissione credenziale",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

/**
 * List available credentials for user
 */
router.get("/available", authenticateUser, async (ctx) => {
  try {
    const userId = ctx.state.userId;

    const notifications = await query(
      `SELECT cn.*, i.name as issuer_name, i.wallet_address as issuer_wallet
       FROM claim_notifications cn
       JOIN issuers i ON cn.issuer_id = i.id
       WHERE cn.user_id = $1 AND cn.notified = false
       ORDER BY cn.created_at DESC`,
      [userId]
    );

    ctx.response.body = {
      available: notifications.map((n) => ({
        id: n.id,
        credentialType: n.credential_type,
        issuerName: n.issuer_name,
        issuerWallet: n.issuer_wallet,
        txHash: n.tx_hash,
        createdAt: n.created_at,
      })),
    };
  } catch (error) {
    console.error("Get available credentials error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore recupero credenziali disponibili" };
  }
});

/**
 * Claim specific credential
 */
router.post("/claim/:notificationId", authenticateUser, async (ctx) => {
  try {
    const userId = ctx.state.userId;
    const notificationId = ctx.params.notificationId;

    const notifications = await query(
      `SELECT cn.*, i.name as issuer_name, i.email as issuer_email
       FROM claim_notifications cn
       JOIN issuers i ON cn.issuer_id = i.id
       WHERE cn.id = $1 AND cn.user_id = $2`,
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Notifica non trovata" };
      return;
    }

    const notification = notifications[0];

    if (notification.notified) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Credenziale già claimed" };
      return;
    }

    await query(
      "UPDATE claim_notifications SET notified = true WHERE id = $1",
      [notificationId]
    );

    ctx.response.body = {
      message: "Credenziale claimed con successo",
      info: {
        credentialType: notification.credential_type,
        issuerName: notification.issuer_name,
        issuerEmail: notification.issuer_email,
        claimId: notification.claim_id,
        txHash: notification.tx_hash,
      },
      instructions:
        "Contatta l'issuer per ottenere la credenziale completa tramite canale sicuro",
    };
  } catch (error) {
    console.error("Claim credential error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Errore claim credenziale" };
  }
});

/**
 * Verify claim validity on-chain (public endpoint)
 */
router.get("/verify/:claimId", async (ctx) => {
  try {
    const claimId = ctx.params.claimId;

    const contract = getContractReadOnly();
    const isValid = await contract.isClaimValid(claimId);

    if (!isValid) {
      ctx.response.body = {
        valid: false,
        message: "Claim non valido, revocato, o scaduto",
      };
      return;
    }

    const claimInfo = await contract.claims(claimId);

    ctx.response.body = {
      valid: true,
      claimId,
      issuerId: Number(claimInfo.issuerId),
      merkleRoot: claimInfo.merkleRoot,
      issuedAt: new Date(Number(claimInfo.issuedAt) * 1000).toISOString(),
      expiresAt: new Date(Number(claimInfo.expiresAt) * 1000).toISOString(),
      revoked: claimInfo.revoked,
    };
  } catch (error) {
    console.error("Verify claim error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Errore verifica claim",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

/**
 * Authenticate issuer via JWT
 */
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

    const issuerResult = await query<Issuer>(
      "SELECT * FROM issuers WHERE id = $1",
      [payload.id]
    );

    if (issuerResult.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Issuer non trovato" };
      return;
    }

    ctx.state.issuer = issuerResult[0];
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token non valido o scaduto" };
  }
}

/**
 * Authenticate user via JWT
 */
async function authenticateUser(ctx: any, next: any) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token mancante" };
      return;
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET);

    ctx.state.userId = payload.id;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token non valido o scaduto" };
  }
}

export default router;
