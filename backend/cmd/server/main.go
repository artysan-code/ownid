package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/artysan-code/ownid/backend/internal/auth"
	"github.com/artysan-code/ownid/backend/internal/avalanche"
	"github.com/artysan-code/ownid/backend/internal/config"
	"github.com/artysan-code/ownid/backend/internal/db"
	"github.com/artysan-code/ownid/backend/internal/handlers"
	"github.com/artysan-code/ownid/backend/internal/middleware"
	"github.com/artysan-code/ownid/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	database, err := db.New(cfg.GetDatabaseDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize schema
	if err := database.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}
	log.Println("✓ Database connected and schema initialized")

	// Initialize Redis
	redisClient, err := utils.NewRedisClient(cfg.Redis.URL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()
	log.Println("✓ Redis connected")

	// Initialize Avalanche client
	var avalancheClient *avalanche.Client
	if cfg.Avalanche.PrivateKey != "" && cfg.Avalanche.ProofVerifierAddress != "" {
		avalancheClient, err = avalanche.NewClient(
			cfg.Avalanche.RPCURL,
			cfg.Avalanche.PrivateKey,
			cfg.Avalanche.ChainID,
			cfg.Avalanche.ProofVerifierAddress,
		)
		if err != nil {
			log.Fatalf("Failed to initialize Avalanche client: %v", err)
		}
		defer avalancheClient.Close()
		log.Println("✓ Avalanche client initialized")
	} else {
		log.Println("⚠ Avalanche client not configured (check .env)")
	}

	// Initialize JWT service
	jwtService := auth.NewJWTService(cfg.JWT.Secret, cfg.JWT.Expiration)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(database, jwtService)
	oauthHandler := handlers.NewOAuthHandler(database, redisClient, jwtService, cfg)
	verificationHandler := handlers.NewVerificationHandler(database, redisClient, jwtService, avalancheClient, cfg)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "OwnID API",
		ServerHeader: "OwnID",
		ErrorHandler: customErrorHandler,
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(middleware.CORS())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"env":    cfg.Server.Env,
		})
	})

	// API v1 routes
	api := app.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/verify-with-zk", verificationHandler.VerifyWithZK)

	// Protected auth routes
	authProtected := auth.Group("", middleware.AuthMiddleware(jwtService))
	authProtected.Get("/me", authHandler.GetCurrentUser)

	// OAuth routes
	oauth := api.Group("/oauth")
	oauth.Post("/authorize", oauthHandler.Authorize)

	// Verification routes (protected)
	verifications := api.Group("/verifications", middleware.AuthMiddleware(jwtService))
	verifications.Get("/", verificationHandler.GetUserVerifications)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Server starting on %s (env: %s)", addr, cfg.Server.Env)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := app.Listen(addr); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	<-quit
	log.Println("Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error": message,
	})
}
