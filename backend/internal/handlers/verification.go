package handlers

import (
	"fmt"
	"math/big"
	"time"

	"github.com/artysan-code/ownid/backend/internal/auth"
	"github.com/artysan-code/ownid/backend/internal/avalanche"
	"github.com/artysan-code/ownid/backend/internal/config"
	"github.com/artysan-code/ownid/backend/internal/db"
	"github.com/artysan-code/ownid/backend/internal/models"
	"github.com/artysan-code/ownid/backend/pkg/utils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type VerificationHandler struct {
	db              *db.Database
	redis           *utils.RedisClient
	jwtService      *auth.JWTService
	avalancheClient *avalanche.Client
	config          *config.Config
}

func NewVerificationHandler(
	database *db.Database,
	redis *utils.RedisClient,
	jwtService *auth.JWTService,
	avalancheClient *avalanche.Client,
	cfg *config.Config,
) *VerificationHandler {
	return &VerificationHandler{
		db:              database,
		redis:           redis,
		jwtService:      jwtService,
		avalancheClient: avalancheClient,
		config:          cfg,
	}
}

// POST /auth/verify-with-zk
func (h *VerificationHandler) VerifyWithZK(c *fiber.Ctx) error {
	var req models.ZKVerificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// 1. Authenticate user
	user, err := h.db.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	if err := auth.CheckPassword(req.Password, user.PasswordHash); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// 2. Get OAuth authorization data from Redis
	var authData models.OAuthAuthorizationData
	if err := h.redis.Get(c.Context(), "auth:"+req.AuthCode, &authData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid or expired auth code",
		})
	}

	// 3. Parse ZK proof
	proofData, err := h.parseZKProof(req.Proof)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid proof format",
		})
	}

	// 4. Verify proof on-chain
	txHash, err := h.avalancheClient.VerifyAgeProof(
		c.Context(),
		proofData,
		common.HexToHash(req.CredentialHash),
		common.HexToAddress(req.IssuerAddress),
	)

	// Log verification attempt
	verificationLog := &models.VerificationLog{
		ID:               uuid.New(),
		UserID:           user.ID,
		ClientApp:        authData.ClientID,
		VerificationType: "age_check",
		TxHash:           txHash,
		Success:          err == nil,
	}

	if logErr := h.db.CreateVerificationLog(verificationLog); logErr != nil {
		fmt.Printf("Warning: Failed to log verification: %v\n", logErr)
	}

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Proof verification failed on-chain",
		})
	}

	// 5. Generate OAuth access token
	accessToken, err := h.jwtService.GenerateToken(user.ID, user.Email, authData.Scope)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate access token",
		})
	}

	// 6. Create OAuth session
	session := &models.OAuthSession{
		ID:             uuid.New(),
		UserID:         user.ID,
		ClientApp:      authData.ClientID,
		Scope:          authData.Scope,
		CredentialHash: req.CredentialHash,
		TxHash:         txHash,
		ExpiresAt:      time.Now().Add(h.config.JWT.Expiration),
	}

	if err := h.db.CreateOAuthSession(session); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// 7. Delete auth code from Redis (one-time use)
	h.redis.Delete(c.Context(), "auth:"+req.AuthCode)

	// 8. Build redirect URL
	redirectURL := fmt.Sprintf(
		"%s?code=%s&state=%s",
		authData.RedirectURI,
		accessToken,
		authData.State,
	)

	return c.JSON(models.ZKVerificationResponse{
		RedirectURL: redirectURL,
		TxHash:      txHash,
		AccessToken: accessToken,
	})
}

func (h *VerificationHandler) parseZKProof(proof models.ZKProof) (avalanche.ZKProofData, error) {
	var result avalanche.ZKProofData

	// Parse A
	result.A[0] = new(big.Int)
	result.A[0].SetString(proof.A[0], 10)
	result.A[1] = new(big.Int)
	result.A[1].SetString(proof.A[1], 10)

	// Parse B
	for i := 0; i < 2; i++ {
		for j := 0; j < 2; j++ {
			result.B[i][j] = new(big.Int)
			result.B[i][j].SetString(proof.B[i][j], 10)
		}
	}

	// Parse C
	result.C[0] = new(big.Int)
	result.C[0].SetString(proof.C[0], 10)
	result.C[1] = new(big.Int)
	result.C[1].SetString(proof.C[1], 10)

	// Parse public inputs
	if len(proof.PublicInputs) > 0 {
		result.PublicInputs[0] = new(big.Int)
		result.PublicInputs[0].SetString(proof.PublicInputs[0], 10)
	}

	return result, nil
}

// GET /verifications
func (h *VerificationHandler) GetUserVerifications(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	logs, err := h.db.GetUserVerifications(userID, 50)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get verifications",
		})
	}

	return c.JSON(fiber.Map{
		"verifications": logs,
	})
}
