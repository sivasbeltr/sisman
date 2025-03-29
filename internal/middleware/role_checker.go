package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// RequireRole middleware to check if user has required role(s)
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user roles from context (set by Auth middleware)
		userRoles, ok := c.Locals("userRoles").([]string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Yetkilendirme gerekli",
			})
		}

		// Check if user has any of the required roles
		for _, requiredRole := range roles {
			for _, userRole := range userRoles {
				if requiredRole == userRole {
					return c.Next()
				}
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Erişim engellendi: yetersiz izinler",
		})
	}
}
