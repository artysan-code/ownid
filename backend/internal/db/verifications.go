package db

import (
	"fmt"

	"github.com/artysan-code/ownid/backend/internal/models"
	"github.com/google/uuid"
)

func (db *Database) CreateVerificationLog(log *models.VerificationLog) error {
	query := `
		INSERT INTO verification_logs
		(id, user_id, client_app, verification_type, tx_hash, success)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at
	`

	err := db.QueryRow(
		query,
		log.ID,
		log.UserID,
		log.ClientApp,
		log.VerificationType,
		log.TxHash,
		log.Success,
	).Scan(&log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create verification log: %w", err)
	}

	return nil
}

func (db *Database) GetUserVerifications(userID uuid.UUID, limit int) ([]*models.VerificationLog, error) {
	query := `
		SELECT id, user_id, client_app, verification_type, tx_hash, success, created_at
		FROM verification_logs
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := db.Query(query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get user verifications: %w", err)
	}
	defer rows.Close()

	var logs []*models.VerificationLog
	for rows.Next() {
		log := &models.VerificationLog{}
		err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.ClientApp,
			&log.VerificationType,
			&log.TxHash,
			&log.Success,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan verification log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}
