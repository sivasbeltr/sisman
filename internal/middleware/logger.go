package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// RequestLogger logs all requests to the activities database
func RequestLogger(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Start timer
		start := time.Now()

		// Process request
		err := c.Next()

		// Calculate request duration
		duration := time.Since(start)

		// Get path and method
		path := c.Path()
		method := c.Method()

		// Only log API requests, skip static files if path doesn't start with /api
		if !isAPIRequest(path) {
			return err
		}

		// Get user ID from context if available (will only be set for authenticated routes)
		var userID uint
		if id, ok := c.Locals("userId").(uint); ok {
			userID = id
		}

		// Skip logging for health checks which would be too frequent
		if path == "/api/v1/sisman/system/health" {
			return err
		}

		// Log the request
		contentType := string(c.Response().Header.Peek("Content-Type"))
		contentLength := string(c.Response().Header.Peek("Content-Length"))

		description := method + " " + path + " (" + contentType + ") - " +
			contentLength + " bytes - " +
			duration.String()

		// Log all requests except successful health checks
		if userID > 0 && (c.Response().StatusCode() != 200 || path != "/api/v1/sisman/system/health") {
			activityService := services.NewActivityService(db)
			activityService.LogActivity(
				userID,
				"api_request",
				description,
				c.IP(),
				c.Get("User-Agent"),
			)
		}

		return err
	}
}

// isAPIRequest checks if a path is an API request
func isAPIRequest(path string) bool {
	return len(path) >= 4 && path[:4] == "/api"
}
