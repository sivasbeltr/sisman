package models

// Service represents a monitored system service
type Service struct {
	Model
	Name        string          `gorm:"uniqueIndex;not null" json:"name"`
	Description string          `json:"description,omitempty"`
	Type        string          `json:"type"`   // systemd, docker, etc.
	Status      string          `json:"status"` // running, stopped, etc.
	Monitored   bool            `gorm:"default:true" json:"monitored"`
	Metrics     []ServiceMetric `gorm:"foreignKey:ServiceID" json:"metrics"`
	Config      string          `json:"config,omitempty"` // Service configuration (JSON)
}

// ServiceMetric represents a point-in-time metric for a service
type ServiceMetric struct {
	Model
	ServiceID    uint    `gorm:"index" json:"serviceId"`
	Timestamp    int64   `gorm:"index" json:"timestamp"` // Unix timestamp
	CPUUsage     float64 `json:"cpuUsage"`               // Percentage
	MemoryUsage  float64 `json:"memoryUsage"`            // MB
	DiskUsage    float64 `json:"diskUsage"`              // MB
	NetworkIn    float64 `json:"networkIn"`              // MB
	NetworkOut   float64 `json:"networkOut"`             // MB
	ResponseTime float64 `json:"responseTime"`           // ms
	Status       string  `json:"status"`                 // running, stopped, error, etc.
}
