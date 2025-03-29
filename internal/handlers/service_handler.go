package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// Tüm servisleri getirir
func GetAllServices(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		serviceManager := services.NewServiceMonitoringService(db)
		services, err := serviceManager.GetAllServices()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servisler getirilirken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Servisler başarıyla getirildi",
			"data":    services,
		})
	}
}

// ID'ye göre belirli bir servisi getirir
func GetService(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz servis ID'si",
			})
		}

		serviceManager := services.NewServiceMonitoringService(db)
		service, err := serviceManager.GetServiceByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Servis bulunamadı",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Servis başarıyla getirildi",
			"data":    service,
		})
	}
}

// Belirli bir servis için metrikleri getirir
func GetServiceMetrics(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz servis ID'si",
			})
		}

		// Zaman aralığı için sorgu parametrelerini ayrıştır
		startTimeStr := c.Query("start_time")
		endTimeStr := c.Query("end_time")

		var startTime, endTime time.Time

		if startTimeStr != "" {
			startTime, err = time.Parse(time.RFC3339, startTimeStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   true,
					"message": "Geçersiz başlangıç zamanı formatı. RFC3339 formatını kullanın (örn: 2023-01-01T00:00:00Z)",
				})
			}
		} else {
			// Belirtilmemişse varsayılan olarak 24 saat öncesi
			startTime = time.Now().Add(-24 * time.Hour)
		}

		if endTimeStr != "" {
			endTime, err = time.Parse(time.RFC3339, endTimeStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   true,
					"message": "Geçersiz bitiş zamanı formatı. RFC3339 formatını kullanın (örn: 2023-01-01T00:00:00Z)",
				})
			}
		} else {
			// Belirtilmemişse varsayılan olarak şu an
			endTime = time.Now()
		}

		serviceManager := services.NewServiceMonitoringService(db)
		metrics, err := serviceManager.GetServiceMetrics(uint(id), startTime.Unix(), endTime.Unix())
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servis metrikleri getirilirken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Servis metrikleri başarıyla getirildi",
			"data":    metrics,
		})
	}
}

// Yeni bir servis oluşturur
func CreateService(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// İstek gövdesini ayrıştır
		var serviceData struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Type        string `json:"type"`
			Config      string `json:"config"`
			Monitored   bool   `json:"monitored"`
		}

		if err := c.BodyParser(&serviceData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Gerekli alanları doğrula
		if serviceData.Name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Servis adı gereklidir",
			})
		}

		serviceManager := services.NewServiceMonitoringService(db)

		// Servis adının zaten var olup olmadığını kontrol et
		exists, err := serviceManager.ServiceNameExists(serviceData.Name)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servis adı kullanılabilirliği kontrol edilirken hata oluştu",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "Bu servis adı zaten kullanımda",
			})
		}

		// Servisi oluştur
		service, err := serviceManager.CreateService(serviceData.Name, serviceData.Description, serviceData.Type, serviceData.Config, serviceData.Monitored)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servis oluşturulurken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "service_create", "Servis oluşturuldu: "+serviceData.Name, c.IP(), c.Get("User-Agent"))

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"error":   false,
			"message": "Servis başarıyla oluşturuldu",
			"data":    service,
		})
	}
}

// Mevcut bir servisi günceller
func UpdateService(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz servis ID'si",
			})
		}

		// İstek gövdesini ayrıştır
		var serviceData struct {
			Description string `json:"description"`
			Type        string `json:"type"`
			Config      string `json:"config"`
			Monitored   bool   `json:"monitored"`
		}

		if err := c.BodyParser(&serviceData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		serviceManager := services.NewServiceMonitoringService(db)

		// Mevcut servisi al
		service, err := serviceManager.GetServiceByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Servis bulunamadı",
			})
		}

		// Servisi güncelle
		updatedService, err := serviceManager.UpdateService(service, serviceData.Description, serviceData.Type, serviceData.Config, serviceData.Monitored)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servis güncellenirken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "service_update", "Servis güncellendi: "+service.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Servis başarıyla güncellendi",
			"data":    updatedService,
		})
	}
}

// Bir servisi siler
func DeleteService(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz servis ID'si",
			})
		}

		serviceManager := services.NewServiceMonitoringService(db)

		// Silmeden önce servisi al (kayıt için)
		service, err := serviceManager.GetServiceByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Servis bulunamadı",
			})
		}

		// Servisi sil
		if err := serviceManager.DeleteService(uint(id)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Servis silinirken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "service_delete", "Servis silindi: "+service.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Servis başarıyla silindi",
		})
	}
}
