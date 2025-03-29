package handlers

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// ExecuteCommand executes a command with the provided parameters
func ExecuteCommand(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz komut ID'si",
			})
		}

		// İstek gövdesini ayrıştır
		var executeData struct {
			Parameters map[string]interface{} `json:"parameters"`
		}

		if err := c.BodyParser(&executeData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Komutu al
		commandService := services.NewCommandService(db)
		command, err := commandService.GetCommandByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Komut bulunamadı",
			})
		}

		// Komutun etkin olup olmadığını kontrol et
		if !command.Enabled {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   true,
				"message": "Komut devre dışı",
			})
		}

		// Parametreleri doğrula
		if err := commandService.ValidateCommandParameters(command, executeData.Parameters); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": err.Error(),
			})
		}

		// Komutu çalıştır
		commandExecutionService := services.NewCommandExecutionService(db)
		startTime := time.Now()
		result, err := commandExecutionService.ExecuteCommand(command, executeData.Parameters)
		duration := time.Since(startTime).Milliseconds()

		// Kullanıcı ID'si loglama için
		userID := c.Locals("userId").(uint)

		// Parametreleri JSON'a dönüştür
		parametersJSON, _ := json.Marshal(executeData.Parameters)

		// Çalıştırmayı veritabanına kaydet
		var status, errorMessage string
		if err != nil {
			status = "hata"
			errorMessage = err.Error()

			// Başarısız olsa bile çalıştırmayı kaydet
			_, _ = commandExecutionService.LogCommandExecution(
				command.ID,
				userID,
				string(parametersJSON),
				status,
				"",
				errorMessage,
				duration,
				c.IP(),
			)

			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut çalıştırma başarısız: " + errorMessage,
			})
		}

		status = "başarılı"
		// Başarılı çalıştırmayı kaydet
		execution, err := commandExecutionService.LogCommandExecution(
			command.ID,
			userID,
			string(parametersJSON),
			status,
			result,
			"",
			duration,
			c.IP(),
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut çalıştırma kaydı sırasında hata oluştu",
			})
		}

		// Aktiviteyi logla
		activityService := services.NewActivityService(db)
		activityService.LogActivity(userID, "command_execute", "Komut çalıştırıldı: "+command.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komut başarıyla çalıştırıldı",
			"data": fiber.Map{
				"execution_id": execution.ID,
				"command":      command.Name,
				"result":       result,
				"duration_ms":  duration,
				"status":       status,
			},
		})
	}
}

// GetCommandExecutions returns execution history for a command
func GetCommandExecutions(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz komut ID'si",
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

		// Get command executions
		commandExecutionService := services.NewCommandExecutionService(db)
		executions, count, err := commandExecutionService.GetCommandExecutions(uint(id), limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut çalıştırma geçmişi alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komut çalıştırma geçmişi başarıyla alındı",
			"data":    executions,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}

// GetUserCommandExecutions returns command execution history for a user
func GetUserCommandExecutions(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
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

		// Get command executions
		commandExecutionService := services.NewCommandExecutionService(db)
		executions, count, err := commandExecutionService.GetUserCommandExecutions(uint(userID), limit, offset)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı komut çalıştırma geçmişi alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı komut çalıştırma geçmişi başarıyla alındı",
			"data":    executions,
			"meta": fiber.Map{
				"total":  count,
				"limit":  limit,
				"offset": offset,
			},
		})
	}
}
