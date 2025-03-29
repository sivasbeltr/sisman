package models

import "gorm.io/gorm"

// NginxConfig represents an nginx configuration
type NginxConfig struct {
	gorm.Model
	Name         string `gorm:"uniqueIndex;not null"`
	Domain       string `gorm:"index"`
	ServerName   string
	Port         int  `gorm:"default:80"`
	SSLEnabled   bool `gorm:"default:false"`
	CertPath     string
	KeyPath      string
	ProxyPass    string
	RootPath     string
	ConfigPath   string // Path to actual config file
	Active       bool   `gorm:"default:true"`
	CustomConfig string // Additional custom configuration
}
