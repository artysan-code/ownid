package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

type Database struct {
	*sql.DB
}

func New(dsn string) (*Database, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Database{db}, nil
}

func (db *Database) InitSchema() error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

	-- OAuth clients table
	CREATE TABLE IF NOT EXISTS oauth_clients (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		client_id VARCHAR(255) UNIQUE NOT NULL,
		client_name VARCHAR(255) NOT NULL,
		redirect_uri TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- OAuth sessions table
	CREATE TABLE IF NOT EXISTS oauth_sessions (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		client_app VARCHAR(255) NOT NULL,
		scope VARCHAR(255) NOT NULL,
		credential_hash TEXT,
		tx_hash VARCHAR(66),
		created_at TIMESTAMP DEFAULT NOW(),
		expires_at TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_oauth_sessions_user_id ON oauth_sessions(user_id);
	CREATE INDEX IF NOT EXISTS idx_oauth_sessions_tx_hash ON oauth_sessions(tx_hash);

	-- Verification logs table
	CREATE TABLE IF NOT EXISTS verification_logs (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		client_app VARCHAR(255) NOT NULL,
		verification_type VARCHAR(50) NOT NULL,
		tx_hash VARCHAR(66),
		success BOOLEAN NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id);
	CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at);
	`

	_, err := db.Exec(schema)
	return err
}
