package models

import (
	"time"

	"github.com/google/uuid"
)

type OAuthClient struct {
	ID          uuid.UUID `json:"id" db:"id"`
	ClientID    string    `json:"client_id" db:"client_id"`
	ClientName  string    `json:"client_name" db:"client_name"`
	RedirectURI string    `json:"redirect_uri" db:"redirect_uri"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type OAuthSession struct {
	ID             uuid.UUID `json:"id" db:"id"`
	UserID         uuid.UUID `json:"user_id" db:"user_id"`
	ClientApp      string    `json:"client_app" db:"client_app"`
	Scope          string    `json:"scope" db:"scope"`
	CredentialHash string    `json:"credential_hash" db:"credential_hash"`
	TxHash         string    `json:"tx_hash" db:"tx_hash"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	ExpiresAt      time.Time `json:"expires_at" db:"expires_at"`
}

type OAuthAuthorizeRequest struct {
	ClientID    string `json:"client_id" validate:"required"`
	RedirectURI string `json:"redirect_uri" validate:"required,url"`
	Scope       string `json:"scope" validate:"required"`
	State       string `json:"state"`
}

type OAuthAuthorizationData struct {
	ClientID    string    `json:"client_id"`
	RedirectURI string    `json:"redirect_uri"`
	Scope       string    `json:"scope"`
	State       string    `json:"state"`
	CreatedAt   time.Time `json:"created_at"`
}
