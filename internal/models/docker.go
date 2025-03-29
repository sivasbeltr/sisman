package models

import "gorm.io/gorm"

// DockerContainer represents a Docker container
type DockerContainer struct {
	gorm.Model
	ContainerID   string `gorm:"uniqueIndex;not null"`
	Name          string `gorm:"index"`
	Image         string
	Status        string
	Created       int64
	Ports         string // JSON string of port mappings
	Networks      string // JSON string of networks
	Volumes       string // JSON string of volumes
	Environment   string // JSON string of environment variables
	RestartPolicy string
	Monitored     bool   `gorm:"default:true"`
	Labels        string // JSON string of container labels
}
