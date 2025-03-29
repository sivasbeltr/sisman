package models

import "gorm.io/gorm"

// User represents a system user
type User struct {
	gorm.Model
	Username     string `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	Email        string `gorm:"uniqueIndex;not null"`
	FirstName    string
	LastName     string
	Active       bool       `gorm:"default:true"`
	Roles        []Role     `gorm:"many2many:user_roles;"`
	Activities   []Activity `gorm:"foreignKey:UserID"`
}

// Role represents a user role for authorization
type Role struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null"`
	Description string
	Users       []User `gorm:"many2many:user_roles;"`
}

// Activity represents user activity logs
type Activity struct {
	gorm.Model
	UserID       uint   `gorm:"index"`
	ActivityType string `gorm:"not null"`
	Description  string
	IPAddress    string
	UserAgent    string
}
