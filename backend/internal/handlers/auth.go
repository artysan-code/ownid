package handlers

import (
	"github.com/artysan-code/ownid/backend/internal/auth"
	"github.com/artysan-code/ownid/backend/internal/db"
	"github.com/artysan-code/ownid/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthHandler struct {
	db         *db.Database
	jwtService *auth.JWTService
}

func NewAuthHandler(database *db.Database, jwtService *auth.JWTService) *AuthHandler {
	return &AuthHandler{
		db:         database,
		jwtService: jwtService,
	}
}

// POST /auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.UserRegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if user already exists
	existingUser, _ := h.db.GetUserByEmail(req.Email)
	if existingUser != nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "User already exists",
		})
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process password",
		})
	}

	// Create user
	user := &models.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: passwordHash,
	}

	if err := h.db.CreateUser(user); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Generate JWT
	token, err := h.jwtService.GenerateToken(user.ID, user.Email, "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"user":  user.ToResponse(),
		"token": token,
	})
}

// POST /auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.UserLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user
	user, err := h.db.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Check password
	if err := auth.CheckPassword(req.Password, user.PasswordHash); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate JWT
	token, err := h.jwtService.GenerateToken(user.ID, user.Email, "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"user":  user.ToResponse(),
		"token": token,
	})
}

// GET /auth/me
func (h *AuthHandler) GetCurrentUser(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	userID := c.Locals("userID").(uuid.UUID)

	user, err := h.db.GetUserByID(userID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"user": user.ToResponse(),
	})
}
