package models

import "gorm.io/gorm"

// Command represents a system command that can be executed
type Command struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null"`
	Description string
	Command     string             `gorm:"not null"`
	Category    string             `gorm:"index"`
	Enabled     bool               `gorm:"default:true"`
	Parameters  []CommandParameter `gorm:"foreignKey:CommandID"`
	Executions  []CommandExecution `gorm:"foreignKey:CommandID"`
}

// ParameterType represents the type of a command parameter
type ParameterType string

const (
	ParameterTypeString  ParameterType = "string"
	ParameterTypeNumber  ParameterType = "number"
	ParameterTypeBoolean ParameterType = "boolean"
	ParameterTypeSelect  ParameterType = "select"
	ParameterTypeFile    ParameterType = "file"
)

// CommandParameter represents parameters for a command
type CommandParameter struct {
	gorm.Model
	CommandID    uint          `gorm:"index"`
	Name         string        `gorm:"not null"`
	Label        string        `gorm:"not null"`
	Type         ParameterType `gorm:"not null"`
	Required     bool          `gorm:"default:false"`
	DefaultValue string
	Options      string // JSON string for select options
	Validation   string // Regex or validation rules
	Order        int    `gorm:"default:0"`
}

// CommandExecution represents a record of command execution
type CommandExecution struct {
	gorm.Model
	CommandID    uint   `gorm:"index"`
	UserID       uint   `gorm:"index"`
	Parameters   string // JSON string of parameters
	Status       string `gorm:"not null"` // success, error, etc.
	Result       string // Output of the command
	ErrorMessage string
	Duration     int64 // Duration in milliseconds
	IPAddress    string
}
