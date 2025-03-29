package models

// NginxConfig represents an nginx configuration
type NginxConfig struct {
	Model
	Name         string `gorm:"uniqueIndex;not null" json:"name"`
	Domain       string `gorm:"index" json:"domain,omitempty"`
	ServerName   string `json:"serverName,omitempty"`
	Port         int    `gorm:"default:80" json:"port"`
	SSLEnabled   bool   `gorm:"default:false" json:"sslEnabled"`
	CertPath     string `json:"certPath,omitempty"`
	KeyPath      string `json:"keyPath,omitempty"`
	ProxyPass    string `json:"proxyPass,omitempty"`
	RootPath     string `json:"rootPath,omitempty"`
	ConfigPath   string `json:"configPath,omitempty"` // Path to actual config file
	Active       bool   `gorm:"default:true" json:"active"`
	CustomConfig string `json:"customConfig,omitempty"` // Additional custom configuration
}
