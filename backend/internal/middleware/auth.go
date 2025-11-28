package middleware

import (
	"strings"

	"github.com/artysan-code/ownid/backend/internal/auth"
	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(jwtService *auth.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		// Extract token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		token := parts[1]

		// Validate token
		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Store user info in context
		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("scope", claims.Scope)

		return c.Next()
	}
}
