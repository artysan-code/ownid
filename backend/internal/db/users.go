package db

import (
	"database/sql"
	"fmt"

	"github.com/artysan-code/ownid/backend/internal/models"
	"github.com/google/uuid"
)

func (db *Database) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING created_at, updated_at
	`

	err := db.QueryRow(
		query,
		user.ID,
		user.Email,
		user.PasswordHash,
	).Scan(&user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (db *Database) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (db *Database) GetUserByID(id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &models.User{}
	err := db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}
