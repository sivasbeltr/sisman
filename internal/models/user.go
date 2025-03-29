package models

// User represents a system user
type User struct {
	Model
	Username     string     `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string     `gorm:"not null" json:"passwordHash"`
	Email        string     `gorm:"uniqueIndex;not null" json:"email"`
	FirstName    string     `json:"firstName,omitempty"`
	LastName     string     `json:"lastName,omitempty"`
	Active       bool       `gorm:"default:true" json:"active"`
	Roles        []Role     `gorm:"many2many:user_roles;" json:"roles"`
	Activities   []Activity `gorm:"foreignKey:UserID" json:"activities"`
}

// Role represents a user role for authorization
type Role struct {
	Model
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	Description string `json:"description,omitempty"`
	Users       []User `gorm:"many2many:user_roles;" json:"users"`
}

// Activity represents user activity logs
type Activity struct {
	Model
	UserID       uint   `gorm:"index" json:"userId"`
	ActivityType string `gorm:"not null" json:"activityType"`
	Description  string `json:"description,omitempty"`
	IPAddress    string `json:"ipAddress,omitempty"`
	UserAgent    string `json:"userAgent,omitempty"`
}
