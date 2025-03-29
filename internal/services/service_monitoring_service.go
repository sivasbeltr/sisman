package services

import (
	"errors"
	"time"

	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// ServiceMonitoringService, servis izleme işlemlerini yönetir
type ServiceMonitoringService struct {
	db *gorm.DB
}

// NewServiceMonitoringService, yeni bir ServiceMonitoringService örneği oluşturur
func NewServiceMonitoringService(db *gorm.DB) *ServiceMonitoringService {
	return &ServiceMonitoringService{db: db}
}

// GetAllServices, tüm servisleri getirir
func (s *ServiceMonitoringService) GetAllServices() ([]models.Service, error) {
	var services []models.Service
	if err := s.db.Find(&services).Error; err != nil {
		return nil, err
	}
	return services, nil
}

// GetServiceByID, ID'ye göre bir servisi getirir
func (s *ServiceMonitoringService) GetServiceByID(id uint) (*models.Service, error) {
	var service models.Service
	if err := s.db.First(&service, id).Error; err != nil {
		return nil, err
	}
	return &service, nil
}

// ServiceNameExists, bir servis adının zaten var olup olmadığını kontrol eder
func (s *ServiceMonitoringService) ServiceNameExists(name string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.Service{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateService, yeni bir servis oluşturur
func (s *ServiceMonitoringService) CreateService(name, description, serviceType, config string, monitored bool) (*models.Service, error) {
	// Servis oluştur
	service := models.Service{
		Name:        name,
		Description: description,
		Type:        serviceType,
		Config:      config,
		Status:      "bilinmiyor", // Başlangıç durumu
		Monitored:   monitored,
	}

	if err := s.db.Create(&service).Error; err != nil {
		return nil, err
	}

	return &service, nil
}

// UpdateService, mevcut bir servisi günceller
func (s *ServiceMonitoringService) UpdateService(service *models.Service, description, serviceType, config string, monitored bool) (*models.Service, error) {
	// Alanları güncelle
	if description != "" {
		service.Description = description
	}
	if serviceType != "" {
		service.Type = serviceType
	}
	if config != "" {
		service.Config = config
	}
	service.Monitored = monitored

	// Değişiklikleri kaydet
	if err := s.db.Save(service).Error; err != nil {
		return nil, err
	}

	return service, nil
}

// DeleteService, bir servisi siler
func (s *ServiceMonitoringService) DeleteService(id uint) error {
	// İşlem başlat
	tx := s.db.Begin()

	// Önce metrikleri sil
	if err := tx.Where("service_id = ?", id).Delete(&models.ServiceMetric{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Servisi sil
	if err := tx.Delete(&models.Service{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// İşlemi tamamla
	return tx.Commit().Error
}

// RecordServiceMetrics, bir servis için mevcut metrikleri kaydeder
func (s *ServiceMonitoringService) RecordServiceMetrics(serviceID uint, cpuUsage, memoryUsage, diskUsage, networkIn, networkOut, responseTime float64, status string) (*models.ServiceMetric, error) {
	// Servisin var olup olmadığını kontrol et
	if err := s.db.First(&models.Service{}, serviceID).Error; err != nil {
		return nil, errors.New("servis bulunamadı")
	}

	// Metrik oluştur
	metric := models.ServiceMetric{
		ServiceID:    serviceID,
		Timestamp:    time.Now().Unix(),
		CPUUsage:     cpuUsage,
		MemoryUsage:  memoryUsage,
		DiskUsage:    diskUsage,
		NetworkIn:    networkIn,
		NetworkOut:   networkOut,
		ResponseTime: responseTime,
		Status:       status,
	}

	if err := s.db.Create(&metric).Error; err != nil {
		return nil, err
	}

	// Servis durumunu güncelle
	if err := s.db.Model(&models.Service{}).Where("id = ?", serviceID).Update("status", status).Error; err != nil {
		return nil, err
	}

	return &metric, nil
}

// GetServiceMetrics, bir servis için belirtilen zaman aralığındaki metrikleri getirir
func (s *ServiceMonitoringService) GetServiceMetrics(serviceID uint, startTime, endTime int64) ([]models.ServiceMetric, error) {
	var metrics []models.ServiceMetric

	if err := s.db.Where("service_id = ? AND timestamp BETWEEN ? AND ?", serviceID, startTime, endTime).
		Order("timestamp ASC").
		Find(&metrics).Error; err != nil {
		return nil, err
	}

	return metrics, nil
}

// GetLatestServiceMetrics, bir servis için en son metrikleri getirir
func (s *ServiceMonitoringService) GetLatestServiceMetrics(serviceID uint) (*models.ServiceMetric, error) {
	var metric models.ServiceMetric

	if err := s.db.Where("service_id = ?", serviceID).
		Order("timestamp DESC").
		First(&metric).Error; err != nil {
		return nil, err
	}

	return &metric, nil
}

// GetMonitoredServices, izlenmesi gereken tüm servisleri döndürür
func (s *ServiceMonitoringService) GetMonitoredServices() ([]models.Service, error) {
	var services []models.Service

	if err := s.db.Where("monitored = ?", true).Find(&services).Error; err != nil {
		return nil, err
	}

	return services, nil
}

// CleanupOldMetrics, belirtilen süreden daha eski metrikleri temizler
func (s *ServiceMonitoringService) CleanupOldMetrics(days int) error {
	cutoffTime := time.Now().AddDate(0, 0, -days).Unix()

	return s.db.Where("timestamp < ?", cutoffTime).Delete(&models.ServiceMetric{}).Error
}

// UpdateServiceStatus, bir servisin durumunu günceller
func (s *ServiceMonitoringService) UpdateServiceStatus(serviceID uint, status string) error {
	return s.db.Model(&models.Service{}).Where("id = ?", serviceID).Update("status", status).Error
}
