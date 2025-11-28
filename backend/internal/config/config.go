package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	Redis     RedisConfig
	JWT       JWTConfig
	Avalanche AvalancheConfig
	OAuth     OAuthConfig
}

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	URL string
}

type JWTConfig struct {
	Secret     string
	Expiration time.Duration
}

type AvalancheConfig struct {
	RPCURL                    string
	ChainID                   int64
	PrivateKey                string
	IssuerRegistryAddress     string
	CredentialRegistryAddress string
	ProofVerifierAddress      string
}

type OAuthConfig struct {
	CodeExpiration time.Duration
}

func Load() (*Config, error) {
	// Carica .env solo in development
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			fmt.Println("Warning: .env file not found, using environment variables")
		}
	}

	jwtExp, err := time.ParseDuration(getEnv("JWT_EXPIRATION", "24h"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION: %w", err)
	}

	oauthExp, err := time.ParseDuration(getEnv("OAUTH_CODE_EXPIRATION", "10m"))
	if err != nil {
		return nil, fmt.Errorf("invalid OAUTH_CODE_EXPIRATION: %w", err)
	}

	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "ownid"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "ownid_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			URL: getEnv("REDIS_URL", "redis://localhost:6379"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", ""),
			Expiration: jwtExp,
		},
		Avalanche: AvalancheConfig{
			RPCURL:                    getEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc"),
			ChainID:                   43113,
			PrivateKey:                getEnv("AVALANCHE_PRIVATE_KEY", ""),
			IssuerRegistryAddress:     getEnv("ISSUER_REGISTRY_ADDRESS", ""),
			CredentialRegistryAddress: getEnv("CREDENTIAL_REGISTRY_ADDRESS", ""),
			ProofVerifierAddress:      getEnv("PROOF_VERIFIER_ADDRESS", ""),
		},
		OAuth: OAuthConfig{
			CodeExpiration: oauthExp,
		},
	}, nil
}

func (c *Config) GetDatabaseDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
