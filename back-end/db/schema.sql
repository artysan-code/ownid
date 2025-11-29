-- Tabella utenti normali (studenti, cittadini)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    wallet_address TEXT,  -- Wallet Ethereum/Avalanche (opzionale)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabella issuer (università, enti certificatori)
CREATE TABLE IF NOT EXISTS issuers (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,  -- Nome pubblico (es. "Università Tor Vergata")
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,  -- Wallet per firmare credenziali
    wallet_private_key TEXT NOT NULL,  -- Chiave privata (ENCRYPTED in production!)
    website TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,  -- Richiede approvazione admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issuers_email ON issuers(email);
CREATE INDEX IF NOT EXISTS idx_issuers_wallet ON issuers(wallet_address);

-- Tabella notifiche claim disponibili (NO storage credenziali reali!)
CREATE TABLE IF NOT EXISTS claim_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),  -- User ID nel database
    user_identifier TEXT NOT NULL,  -- Wallet address O hash(email) per blockchain
    claim_id TEXT NOT NULL,  -- keccak256(userIdentifier, credentialType, issuerId)
    issuer_id TEXT REFERENCES issuers(id),
    credential_type TEXT NOT NULL,
    tx_hash TEXT,  -- Transaction hash della registrazione on-chain
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claim_notif_user ON claim_notifications(user_id, notified);
CREATE INDEX IF NOT EXISTS idx_claim_notif_identifier ON claim_notifications(user_identifier);

-- Tabella audit log verifiche (opzionale, analytics)
CREATE TABLE IF NOT EXISTS verification_events (
    id TEXT PRIMARY KEY,
    user_identifier TEXT NOT NULL,  -- Wallet address O hash(email)
    verifier_domain TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    issuer_id TEXT,
    verified BOOLEAN NOT NULL,
    tx_hash TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verif_analytics ON verification_events(verified_at, claim_type);
CREATE INDEX IF NOT EXISTS idx_verif_user ON verification_events(user_identifier);