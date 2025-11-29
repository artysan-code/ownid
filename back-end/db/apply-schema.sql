-- Script per applicare lo schema aggiornato al database
-- Esegui questo file manualmente con: psql -U ownid_user -d ownid -f apply-schema.sql

-- 1. Aggiungi wallet_address agli utenti esistenti
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- 2. Crea tabella issuers
CREATE TABLE IF NOT EXISTS issuers (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    wallet_private_key TEXT NOT NULL,
    website TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issuers_email ON issuers(email);
CREATE INDEX IF NOT EXISTS idx_issuers_wallet ON issuers(wallet_address);

-- 3. Crea tabella claim_notifications
CREATE TABLE IF NOT EXISTS claim_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    user_identifier TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    issuer_id TEXT REFERENCES issuers(id),
    credential_type TEXT NOT NULL,
    tx_hash TEXT,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claim_notif_user ON claim_notifications(user_id, notified);
CREATE INDEX IF NOT EXISTS idx_claim_notif_identifier ON claim_notifications(user_identifier);

-- 4. Crea tabella verification_events
CREATE TABLE IF NOT EXISTS verification_events (
    id TEXT PRIMARY KEY,
    user_identifier TEXT NOT NULL,
    verifier_domain TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    issuer_id TEXT,
    verified BOOLEAN NOT NULL,
    tx_hash TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verif_analytics ON verification_events(verified_at, claim_type);
CREATE INDEX IF NOT EXISTS idx_verif_user ON verification_events(user_identifier);
