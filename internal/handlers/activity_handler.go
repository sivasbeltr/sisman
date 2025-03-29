package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetAllActivities returns all activities with pagination
func GetAllActivities(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Parse pagination parameters
		limit, err := strconv.Atoi(c.Query("limit", "10"))
		if err != nil || limit < 1 {
			limit = 10
		}

		offset, err := strconv.Atoi(c.Query("offset", "0"))
		if err != nil || offset < 0 {
			offset = 0
		}

		activityService := services.NewActivityService(db)
		activities, count, err := activityService.GetAllActivities(limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Aktiviteler alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Aktiviteler başarıyla alındı",
			"data":    activities,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}

// GetUserActivities returns activities for a specific user
func GetUserActivities(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user ID from URL parameters
		userID, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz kullanıcı ID'si",
			})
		}

		// Parse pagination parameters
		limit, err := strconv.Atoi(c.Query("limit", "10"))
		if err != nil || limit < 1 {
			limit = 10
		}

		offset, err := strconv.Atoi(c.Query("offset", "0"))
		if err != nil || offset < 0 {
			offset = 0
		}

		activityService := services.NewActivityService(db)
		activities, count, err := activityService.GetUserActivities(uint(userID), limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı aktiviteleri alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı aktiviteleri başarıyla alındı",
			"data":    activities,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}

// GetActivitiesByType returns activities of a specific type
func GetActivitiesByType(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get activity type from URL parameters
		activityType := c.Params("type")
		if activityType == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Aktivite türü gerekli",
			})
		}

		// Parse pagination parameters
		limit, err := strconv.Atoi(c.Query("limit", "10"))
		if err != nil || limit < 1 {
			limit = 10
		}

		offset, err := strconv.Atoi(c.Query("offset", "0"))
		if err != nil || offset < 0 {
			offset = 0
		}

		activityService := services.NewActivityService(db)
		activities, count, err := activityService.GetActivityByType(activityType, limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Aktivite türüne göre aktiviteler alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Aktiviteler başarıyla alındı",
			"data":    activities,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}

// SearchActivities searches activities by description
func SearchActivities(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get search query
		query := c.Query("q")
		if query == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Arama sorgusu gerekli",
			})
		}

		// Parse pagination parameters
		limit, err := strconv.Atoi(c.Query("limit", "10"))
		if err != nil || limit < 1 {
			limit = 10
		}

		offset, err := strconv.Atoi(c.Query("offset", "0"))
		if err != nil || offset < 0 {
			offset = 0
		}

		activityService := services.NewActivityService(db)
		activities, count, err := activityService.SearchActivities(query, limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Aktiviteler aranırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Arama sonuçları başarıyla alındı",
			"data":    activities,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}

// DeleteOldActivities deletes activities older than specified days
func DeleteOldActivities(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Parse days parameter
		days, err := strconv.Atoi(c.Query("days", "30"))
		if err != nil || days < 1 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz gün parametresi, pozitif bir sayı olmalı",
			})
		}

		activityService := services.NewActivityService(db)
		if err := activityService.DeleteOldActivities(days); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Eski aktiviteler silinirken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Eski aktiviteler başarıyla silindi",
		})
	}
}
