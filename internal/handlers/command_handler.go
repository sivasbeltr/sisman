package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetAllCommands returns all commands
func GetAllCommands(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Parse query parameters
		category := c.Query("category")
		enabledStr := c.Query("enabled")

		var enabled *bool
		if enabledStr != "" {
			enabledBool := enabledStr == "true"
			enabled = &enabledBool
		}

		commandService := services.NewCommandService(db)
		commands, err := commandService.GetAllCommands(category, enabled)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komutlar alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komutlar başarıyla alındı",
			"data":    commands,
		})
	}
}

// GetCommand returns a specific command by ID
func GetCommand(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz komut ID'si",
			})
		}

		commandService := services.NewCommandService(db)
		command, err := commandService.GetCommandByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Komut bulunamadı",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komut başarıyla alındı",
			"data":    command,
		})
	}
}

// CreateCommand creates a new command
func CreateCommand(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Parse request body
		var commandData struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Command     string `json:"command"`
			Category    string `json:"category"`
			Enabled     bool   `json:"enabled"`
			Parameters  []struct {
				Name         string `json:"name"`
				Label        string `json:"label"`
				Type         string `json:"type"`
				Required     bool   `json:"required"`
				DefaultValue string `json:"defaultValue"`
				Options      string `json:"options"`
				Validation   string `json:"validation"`
				Order        int    `json:"order"`
			} `json:"parameters"`
		}

		if err := c.BodyParser(&commandData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid request body",
			})
		}

		// Validate required fields
		if commandData.Name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Komut adı gereklidir",
			})
		}

		if commandData.Command == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Komut metni gereklidir",
			})
		}

		commandService := services.NewCommandService(db)

		// Check if command name already exists
		exists, err := commandService.CommandNameExists(commandData.Name)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Error checking command name",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "Komut adı zaten mevcut",
			})
		}

		// Convert parameters to service format
		parameters := make([]services.CommandParameterInput, len(commandData.Parameters))
		for i, param := range commandData.Parameters {
			parameters[i] = services.CommandParameterInput{
				Name:         param.Name,
				Label:        param.Label,
				Type:         param.Type,
				Required:     param.Required,
				DefaultValue: param.DefaultValue,
				Options:      param.Options,
				Validation:   param.Validation,
				Order:        param.Order,
			}
		}

		// Create command
		command, err := commandService.CreateCommand(
			commandData.Name,
			commandData.Description,
			commandData.Command,
			commandData.Category,
			commandData.Enabled,
			parameters,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut oluşturulurken hata oluştu: " + err.Error(),
			})
		}

		// Log the activity
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "command_create", "Command created: "+commandData.Name, c.IP(), c.Get("User-Agent"))

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"error":   false,
			"message": "Komut başarıyla oluşturuldu",
			"data":    command,
		})
	}
}

// UpdateCommand updates an existing command
func UpdateCommand(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz komut ID'si",
			})
		}

		// Parse request body
		var commandData struct {
			Description string `json:"description"`
			Command     string `json:"command"`
			Category    string `json:"category"`
			Enabled     bool   `json:"enabled"`
			Parameters  []struct {
				ID           *uint  `json:"id"`
				Name         string `json:"name"`
				Label        string `json:"label"`
				Type         string `json:"type"`
				Required     bool   `json:"required"`
				DefaultValue string `json:"defaultValue"`
				Options      string `json:"options"`
				Validation   string `json:"validation"`
				Order        int    `json:"order"`
				Delete       bool   `json:"delete"`
			} `json:"parameters"`
		}

		if err := c.BodyParser(&commandData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid request body",
			})
		}

		commandService := services.NewCommandService(db)

		// Get existing command
		command, err := commandService.GetCommandByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Komut bulunamadı",
			})
		}

		// Convert parameters to service format
		parameters := make([]services.CommandParameterUpdateInput, len(commandData.Parameters))
		for i, param := range commandData.Parameters {
			parameters[i] = services.CommandParameterUpdateInput{
				ID:           param.ID,
				Name:         param.Name,
				Label:        param.Label,
				Type:         param.Type,
				Required:     param.Required,
				DefaultValue: param.DefaultValue,
				Options:      param.Options,
				Validation:   param.Validation,
				Order:        param.Order,
				Delete:       param.Delete,
			}
		}

		// Update command
		updatedCommand, err := commandService.UpdateCommand(
			command,
			commandData.Description,
			commandData.Command,
			commandData.Category,
			commandData.Enabled,
			parameters,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut güncellenirken hata oluştu: " + err.Error(),
			})
		}

		// Log the activity
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "command_update", "Command updated: "+command.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komut başarıyla güncellendi",
			"data":    updatedCommand,
		})
	}
}

// DeleteCommand deletes a command
func DeleteCommand(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz komut ID'si",
			})
		}

		commandService := services.NewCommandService(db)

		// Get command before deletion for logging
		command, err := commandService.GetCommandByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Komut bulunamadı",
			})
		}

		// Delete command
		if err := commandService.DeleteCommand(uint(id)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Komut silinirken hata oluştu",
			})
		}

		// Log the activity
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "command_delete", "Command deleted: "+command.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Komut başarıyla silindi",
		})
	}
}
