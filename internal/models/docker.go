package models

// DockerContainer represents a Docker container
type DockerContainer struct {
	Model
	ContainerID   string `gorm:"uniqueIndex;not null" json:"containerId"`
	Name          string `gorm:"index" json:"name,omitempty"`
	Image         string `json:"image,omitempty"`
	Status        string `json:"status,omitempty"`
	Created       int64  `json:"created"`
	Ports         string `json:"ports,omitempty"`       // JSON string of port mappings
	Networks      string `json:"networks,omitempty"`    // JSON string of networks
	Volumes       string `json:"volumes,omitempty"`     // JSON string of volumes
	Environment   string `json:"environment,omitempty"` // JSON string of environment variables
	RestartPolicy string `json:"restartPolicy,omitempty"`
	Monitored     bool   `gorm:"default:true" json:"monitored"`
	Labels        string `json:"labels,omitempty"` // JSON string of container labels
}
