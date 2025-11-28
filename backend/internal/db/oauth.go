package db

import (
	"database/sql"
	"fmt"

	"github.com/artysan-code/ownid/backend/internal/models"
)

func (db *Database) GetOAuthClient(clientID string) (*models.OAuthClient, error) {
	query := `
		SELECT id, client_id, client_name, redirect_uri, created_at
		FROM oauth_clients
		WHERE client_id = $1
	`

	client := &models.OAuthClient{}
	err := db.QueryRow(query, clientID).Scan(
		&client.ID,
		&client.ClientID,
		&client.ClientName,
		&client.RedirectURI,
		&client.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("oauth client not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get oauth client: %w", err)
	}

	return client, nil
}

func (db *Database) CreateOAuthClient(client *models.OAuthClient) error {
	query := `
		INSERT INTO oauth_clients (id, client_id, client_name, redirect_uri)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at
	`

	err := db.QueryRow(
		query,
		client.ID,
		client.ClientID,
		client.ClientName,
		client.RedirectURI,
	).Scan(&client.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create oauth client: %w", err)
	}

	return nil
}

func (db *Database) CreateOAuthSession(session *models.OAuthSession) error {
	query := `
		INSERT INTO oauth_sessions
		(id, user_id, client_app, scope, credential_hash, tx_hash, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at
	`

	err := db.QueryRow(
		query,
		session.ID,
		session.UserID,
		session.ClientApp,
		session.Scope,
		session.CredentialHash,
		session.TxHash,
		session.ExpiresAt,
	).Scan(&session.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create oauth session: %w", err)
	}

	return nil
}
