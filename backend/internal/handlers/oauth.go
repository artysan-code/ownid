package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/artysan-code/ownid/backend/internal/auth"
	"github.com/artysan-code/ownid/backend/internal/config"
	"github.com/artysan-code/ownid/backend/internal/db"
	"github.com/artysan-code/ownid/backend/internal/models"
	"github.com/artysan-code/ownid/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

type OAuthHandler struct {
	db         *db.Database
	redis      *utils.RedisClient
	jwtService *auth.JWTService
	config     *config.Config
}

func NewOAuthHandler(
	database *db.Database,
	redis *utils.RedisClient,
	jwtService *auth.JWTService,
	cfg *config.Config,
) *OAuthHandler {
	return &OAuthHandler{
		db:         database,
		redis:      redis,
		jwtService: jwtService,
		config:     cfg,
	}
}

// POST /oauth/authorize
func (h *OAuthHandler) Authorize(c *fiber.Ctx) error {
	var req models.OAuthAuthorizeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify client exists
	client, err := h.db.GetOAuthClient(req.ClientID)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid client_id",
		})
	}

	// Verify redirect URI matches
	if client.RedirectURI != req.RedirectURI {
		return c.Status(400).JSON(fiber.Map{
			"error": "redirect_uri mismatch",
		})
	}

	// Generate authorization code
	authCode, err := generateRandomString(32)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate auth code",
		})
	}

	// Store authorization data in Redis
	authData := models.OAuthAuthorizationData{
		ClientID:    req.ClientID,
		RedirectURI: req.RedirectURI,
		Scope:       req.Scope,
		State:       req.State,
		CreatedAt:   time.Now(),
	}

	if err := h.redis.Set(c.Context(), "auth:"+authCode, authData, h.config.OAuth.CodeExpiration); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to store auth code",
		})
	}

	// Return auth code and login URL
	loginURL := fmt.Sprintf("/login?auth_code=%s", authCode)

	return c.JSON(fiber.Map{
		"auth_code": authCode,
		"login_url": loginURL,
	})
}

func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
