package models

// Command represents a system command that can be executed
type Command struct {
	Model
	Name        string             `gorm:"uniqueIndex;not null" json:"name"`
	Description string             `json:"description,omitempty"`
	Command     string             `gorm:"not null" json:"command"`
	Category    string             `gorm:"index" json:"category,omitempty"`
	Enabled     bool               `gorm:"default:true" json:"enabled"`
	Parameters  []CommandParameter `gorm:"foreignKey:CommandID" json:"parameters"`
	Executions  []CommandExecution `gorm:"foreignKey:CommandID" json:"executions"`
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
	Model
	CommandID    uint          `gorm:"index" json:"commandId"`
	Name         string        `gorm:"not null" json:"name"`
	Label        string        `gorm:"not null" json:"label"`
	Type         ParameterType `gorm:"not null" json:"type"`
	Required     bool          `gorm:"default:false" json:"required"`
	DefaultValue string        `json:"defaultValue,omitempty"`
	Options      string        `json:"options,omitempty"`    // JSON string for select options
	Validation   string        `json:"validation,omitempty"` // Regex or validation rules
	Order        int           `gorm:"default:0" json:"order"`
}

// CommandExecution represents a record of command execution
type CommandExecution struct {
	Model
	CommandID    uint   `gorm:"index" json:"commandId"`
	UserID       uint   `gorm:"index" json:"userId"`
	Parameters   string `json:"parameters"`             // JSON string of parameters
	Status       string `gorm:"not null" json:"status"` // success, error, etc.
	Result       string `json:"result,omitempty"`       // Output of the command
	ErrorMessage string `json:"errorMessage,omitempty"`
	Duration     int64  `json:"duration"` // Duration in milliseconds
	IPAddress    string `json:"ipAddress,omitempty"`
}
