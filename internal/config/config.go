package config

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port string
	Env  string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Path string
}

// AuthConfig holds authentication related configuration
type AuthConfig struct {
	JWTSecret     string
	TokenDuration int
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Look for .env file in current directory and parent directories
	findAndLoadEnv()

	// Set defaults and override with environment variables
	cfg := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Path: getEnv("DB_PATH", "sisman.db"),
		},
		Auth: AuthConfig{
			JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
			TokenDuration: 24, // hours
		},
	}

	// Make sure database path is absolute
	if !isMemoryDB(cfg.Database.Path) && !filepath.IsAbs(cfg.Database.Path) {
		cfg.Database.Path = filepath.Join(".", cfg.Database.Path)
	}

	return cfg, nil
}

// findAndLoadEnv attempts to find and load a .env file from current or parent directories
func findAndLoadEnv() {
	// Try current directory first
	err := godotenv.Load()
	if err == nil {
		return // Found and loaded
	}

	// Try parent directories up to 3 levels
	dir, err := os.Getwd()
	if err != nil {
		return
	}

	for i := 0; i < 3; i++ {
		dir = filepath.Dir(dir)
		envPath := filepath.Join(dir, ".env")

		if _, err := os.Stat(envPath); err == nil {
			godotenv.Load(envPath)
			return
		}
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// isMemoryDB checks if it's an in-memory SQLite database
func isMemoryDB(path string) bool {
	return path == ":memory:"
}
