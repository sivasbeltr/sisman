package services

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// CommandParameterInput represents input for creating a command parameter
type CommandParameterInput struct {
	Name         string
	Label        string
	Type         string
	Required     bool
	DefaultValue string
	Options      string
	Validation   string
	Order        int
}

// CommandParameterUpdateInput represents input for updating a command parameter
type CommandParameterUpdateInput struct {
	ID           *uint
	Name         string
	Label        string
	Type         string
	Required     bool
	DefaultValue string
	Options      string
	Validation   string
	Order        int
	Delete       bool
}

// CommandService handles command-related operations
type CommandService struct {
	db *gorm.DB
}

// NewCommandService creates a new CommandService instance
func NewCommandService(db *gorm.DB) *CommandService {
	return &CommandService{db: db}
}

// GetAllCommands retrieves all commands with optional filtering
func (s *CommandService) GetAllCommands(category string, enabled *bool) ([]models.Command, error) {
	var commands []models.Command

	db := s.db.Preload("Parameters")

	// Apply filters if provided
	if category != "" {
		db = db.Where("category = ?", category)
	}

	if enabled != nil {
		db = db.Where("enabled = ?", *enabled)
	}

	if err := db.Find(&commands).Error; err != nil {
		return nil, err
	}

	return commands, nil
}

// GetCommandByID retrieves a command by ID
func (s *CommandService) GetCommandByID(id uint) (*models.Command, error) {
	var command models.Command
	if err := s.db.Preload("Parameters").First(&command, id).Error; err != nil {
		return nil, err
	}
	return &command, nil
}

// CommandNameExists checks if a command name already exists
func (s *CommandService) CommandNameExists(name string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.Command{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateCommand creates a new command with parameters
func (s *CommandService) CreateCommand(
	name string,
	description string,
	command string,
	category string,
	enabled bool,
	parameters []CommandParameterInput,
) (*models.Command, error) {
	// Begin transaction
	tx := s.db.Begin()

	// Create command
	cmd := models.Command{
		Name:        name,
		Description: description,
		Command:     command,
		Category:    category,
		Enabled:     enabled,
	}

	if err := tx.Create(&cmd).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Create parameters
	for _, p := range parameters {
		// Validate parameter type
		paramType, err := s.validateParameterType(p.Type)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		param := models.CommandParameter{
			CommandID:    cmd.ID,
			Name:         p.Name,
			Label:        p.Label,
			Type:         paramType,
			Required:     p.Required,
			DefaultValue: p.DefaultValue,
			Options:      p.Options,
			Validation:   p.Validation,
			Order:        p.Order,
		}

		if err := tx.Create(&param).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Reload command with parameters
	return s.GetCommandByID(cmd.ID)
}

// UpdateCommand updates an existing command and its parameters
func (s *CommandService) UpdateCommand(
	command *models.Command,
	description string,
	commandStr string,
	category string,
	enabled bool,
	parameters []CommandParameterUpdateInput,
) (*models.Command, error) {
	// Begin transaction
	tx := s.db.Begin()

	// Update command fields
	if description != "" {
		command.Description = description
	}
	if commandStr != "" {
		command.Command = commandStr
	}
	if category != "" {
		command.Category = category
	}
	command.Enabled = enabled

	// Save command changes
	if err := tx.Save(command).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Process parameters
	for _, p := range parameters {
		if p.Delete && p.ID != nil {
			// Delete parameter
			if err := tx.Delete(&models.CommandParameter{}, *p.ID).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else if p.ID != nil {
			// Update existing parameter
			var param models.CommandParameter
			if err := tx.First(&param, *p.ID).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("parametre bulunamadı")
			}

			// Validate parameter type
			paramType, err := s.validateParameterType(p.Type)
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			// Update fields
			param.Name = p.Name
			param.Label = p.Label
			param.Type = paramType
			param.Required = p.Required
			param.DefaultValue = p.DefaultValue
			param.Options = p.Options
			param.Validation = p.Validation
			param.Order = p.Order

			if err := tx.Save(&param).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			// Create new parameter
			// Validate parameter type
			paramType, err := s.validateParameterType(p.Type)
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			param := models.CommandParameter{
				CommandID:    command.ID,
				Name:         p.Name,
				Label:        p.Label,
				Type:         paramType,
				Required:     p.Required,
				DefaultValue: p.DefaultValue,
				Options:      p.Options,
				Validation:   p.Validation,
				Order:        p.Order,
			}

			if err := tx.Create(&param).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	// İşlemi tamamla
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Parametrelerle komutu yeniden yükle
	return s.GetCommandByID(command.ID)
}

// DeleteCommand bir komutu ve parametrelerini siler
func (s *CommandService) DeleteCommand(id uint) error {
	// İşleme başla
	tx := s.db.Begin()

	// Önce parametreleri sil
	if err := tx.Where("command_id = ?", id).Delete(&models.CommandParameter{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Komutu sil
	if err := tx.Delete(&models.Command{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// İşlemi tamamla
	return tx.Commit().Error
}

// ValidateCommandParameters validates input parameters against command parameter definitions
func (s *CommandService) ValidateCommandParameters(command *models.Command, inputParams map[string]interface{}) error {
	// Get parameter definitions
	paramDefs := command.Parameters

	// Check for required parameters
	for _, paramDef := range paramDefs {
		if paramDef.Required {
			// Check if parameter is provided
			paramValue, exists := inputParams[paramDef.Name]
			if !exists || paramValue == nil {
				return fmt.Errorf("gerekli parametre '%s' eksik", paramDef.Name)
			}

			// Check if parameter value is empty
			if strValue, ok := paramValue.(string); ok && strings.TrimSpace(strValue) == "" {
				return fmt.Errorf("gerekli parametre '%s' boş olamaz", paramDef.Name)
			}
		}

		// Check if parameter is provided (even if not required)
		if paramValue, exists := inputParams[paramDef.Name]; exists && paramValue != nil {
			// Validate parameter value based on type
			if err := s.validateParameterValue(paramDef, paramValue); err != nil {
				return err
			}
		}
	}

	return nil
}

// validateParameterType validates and returns the correct parameter type
func (s *CommandService) validateParameterType(typeStr string) (models.ParameterType, error) {
	switch models.ParameterType(typeStr) {
	case models.ParameterTypeString:
		return models.ParameterTypeString, nil
	case models.ParameterTypeNumber:
		return models.ParameterTypeNumber, nil
	case models.ParameterTypeBoolean:
		return models.ParameterTypeBoolean, nil
	case models.ParameterTypeSelect:
		return models.ParameterTypeSelect, nil
	case models.ParameterTypeFile:
		return models.ParameterTypeFile, nil
	default:
		return "", fmt.Errorf("geçersiz parametre türü: %s", typeStr)
	}
}

// validateParameterValue validates a parameter value based on its definition
func (s *CommandService) validateParameterValue(paramDef models.CommandParameter, value interface{}) error {
	switch paramDef.Type {
	case models.ParameterTypeString:
		// Check validation pattern if defined
		if paramDef.Validation != "" {
			strValue, ok := value.(string)
			if !ok {
				return fmt.Errorf("parametre '%s' bir string olmalıdır", paramDef.Name)
			}

			matched, err := regexp.MatchString(paramDef.Validation, strValue)
			if err != nil {
				return fmt.Errorf("parametre '%s' için geçersiz doğrulama deseni", paramDef.Name)
			}
			if !matched {
				return fmt.Errorf("parametre '%s' doğrulama desenine uymuyor", paramDef.Name)
			}
		}
	case models.ParameterTypeNumber:
		// Validate number type
		switch v := value.(type) {
		case float64:
			// JSON numbers are parsed as float64
			break
		case string:
			// Try to parse string as number
			if _, err := strconv.ParseFloat(v, 64); err != nil {
				return fmt.Errorf("parametre '%s' bir sayı olmalıdır", paramDef.Name)
			}
		default:
			return fmt.Errorf("parametre '%s' bir sayı olmalıdır", paramDef.Name)
		}
	case models.ParameterTypeBoolean:
		// Validate boolean type
		switch value.(type) {
		case bool:
			break
		case string:
			strValue := value.(string)
			if strValue != "true" && strValue != "false" {
				return fmt.Errorf("parametre '%s' bir boolean olmalıdır", paramDef.Name)
			}
		default:
			return fmt.Errorf("parametre '%s' bir boolean olmalıdır", paramDef.Name)
		}
	case models.ParameterTypeSelect:
		// Seçenek doğrulama
		if paramDef.Options == "" {
			return fmt.Errorf("parametre '%s' için tanımlı seçenek yok", paramDef.Name)
		}

		strValue, ok := value.(string)
		if !ok {
			return fmt.Errorf("parametre '%s' değeri bir string olmalıdır", paramDef.Name)
		}

		options := strings.Split(paramDef.Options, ",")
		valid := false
		for _, option := range options {
			if strings.TrimSpace(option) == strValue {
				valid = true
				break
			}
		}
		if !valid {
			return fmt.Errorf("parametre '%s' geçersiz bir seçenek değeri içeriyor", paramDef.Name)
		}
	}

	return nil
}
