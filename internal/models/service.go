package models

import "gorm.io/gorm"

// Service represents a monitored system service
type Service struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null"`
	Description string
	Type        string          // systemd, docker, etc.
	Status      string          // running, stopped, etc.
	Monitored   bool            `gorm:"default:true"`
	Metrics     []ServiceMetric `gorm:"foreignKey:ServiceID"`
	Config      string          // Service configuration (JSON)
}

// ServiceMetric represents a point-in-time metric for a service
type ServiceMetric struct {
	gorm.Model
	ServiceID    uint    `gorm:"index"`
	Timestamp    int64   `gorm:"index"`
	CPUUsage     float64 // Percentage
	MemoryUsage  float64 // MB
	DiskUsage    float64 // MB
	NetworkIn    float64 // MB
	NetworkOut   float64 // MB
	ResponseTime float64 // ms
	Status       string  // running, stopped, error, etc.
}
