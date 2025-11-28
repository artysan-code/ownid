package models

import (
	"time"

	"github.com/google/uuid"
)

type VerificationLog struct {
	ID               uuid.UUID `json:"id" db:"id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	ClientApp        string    `json:"client_app" db:"client_app"`
	VerificationType string    `json:"verification_type" db:"verification_type"`
	TxHash           string    `json:"tx_hash" db:"tx_hash"`
	Success          bool      `json:"success" db:"success"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

type ZKProof struct {
	A            [2]string     `json:"a"`
	B            [2][2]string  `json:"b"`
	C            [2]string     `json:"c"`
	PublicInputs []string      `json:"publicInputs"`
}

type ZKVerificationRequest struct {
	Email          string  `json:"email" validate:"required,email"`
	Password       string  `json:"password" validate:"required"`
	AuthCode       string  `json:"auth_code" validate:"required"`
	Proof          ZKProof `json:"proof" validate:"required"`
	CredentialHash string  `json:"credential_hash" validate:"required"`
	IssuerAddress  string  `json:"issuer_address" validate:"required"`
}

type ZKVerificationResponse struct {
	RedirectURL string `json:"redirect_url"`
	TxHash      string `json:"tx_hash"`
	AccessToken string `json:"access_token"`
}
