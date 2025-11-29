-- Migration: Aggiungi wallet_address agli utenti esistenti
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
