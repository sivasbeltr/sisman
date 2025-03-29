package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/auth"
)

// Auth, JWT tokenlarını doğrulamak için kullanılan middleware
func Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Yetkilendirme başlığını al
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Yetkilendirme başlığı gerekli",
			})
		}

		// Başlık formatının geçerli olup olmadığını kontrol et
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Geçersiz yetkilendirme formatı",
			})
		}

		// Token'ı doğrula
		token := parts[1]
		claims, err := auth.ValidateToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Geçersiz veya süresi dolmuş token",
			})
		}

		// Kullanıcı ID'sini context'e ekle
		c.Locals("userId", claims.UserID)
		c.Locals("userRoles", claims.Roles)

		return c.Next()
	}
}
