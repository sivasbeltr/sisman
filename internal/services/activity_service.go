package services

import (
	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// ActivityService handles activity logging
type ActivityService struct {
	db *gorm.DB
}

// NewActivityService creates a new ActivityService instance
func NewActivityService(db *gorm.DB) *ActivityService {
	return &ActivityService{db: db}
}

// LogActivity logs a user activity
func (s *ActivityService) LogActivity(userID uint, activityType, description, ipAddress, userAgent string) (*models.Activity, error) {
	activity := models.Activity{
		UserID:       userID,
		ActivityType: activityType,
		Description:  description,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
	}

	if err := s.db.Create(&activity).Error; err != nil {
		return nil, err
	}

	return &activity, nil
}

// GetUserActivities retrieves activities for a specific user
func (s *ActivityService) GetUserActivities(userID uint, limit, offset int) ([]models.Activity, int64, error) {
	var activities []models.Activity
	var count int64

	// Count total records
	if err := s.db.Model(&models.Activity{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated records
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, count, nil
}

// GetAllActivities retrieves all activities with pagination
func (s *ActivityService) GetAllActivities(limit, offset int) ([]models.Activity, int64, error) {
	var activities []models.Activity
	var count int64

	// Count total records
	if err := s.db.Model(&models.Activity{}).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated records with user information
	if err := s.db.Preload("User").Order("created_at DESC").Limit(limit).Offset(offset).Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, count, nil
}

// GetActivityByType retrieves activities of a specific type with pagination
func (s *ActivityService) GetActivityByType(activityType string, limit, offset int) ([]models.Activity, int64, error) {
	var activities []models.Activity
	var count int64

	// Count total records
	if err := s.db.Model(&models.Activity{}).Where("activity_type = ?", activityType).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated records
	if err := s.db.Preload("User").Where("activity_type = ?", activityType).Order("created_at DESC").Limit(limit).Offset(offset).Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, count, nil
}

// DeleteOldActivities deletes activities older than specified days
func (s *ActivityService) DeleteOldActivities(days int) error {
	// Use raw SQL for better performance with date calculations
	return s.db.Exec("DELETE FROM activities WHERE created_at < datetime('now', '-? days')", days).Error
}

// SearchActivities searches activities by description
func (s *ActivityService) SearchActivities(query string, limit, offset int) ([]models.Activity, int64, error) {
	var activities []models.Activity
	var count int64

	// Count total records
	if err := s.db.Model(&models.Activity{}).Where("description LIKE ?", "%"+query+"%").Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated records
	if err := s.db.Preload("User").Where("description LIKE ?", "%"+query+"%").Order("created_at DESC").Limit(limit).Offset(offset).Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, count, nil
}
