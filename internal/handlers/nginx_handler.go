package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetAllNginxConfigs tüm nginx yapılandırmalarını döndürür
func GetAllNginxConfigs(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		nginxService := services.NewNginxService(db)
		configs, err := nginxService.GetAllNginxConfigs()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırmaları alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırmaları başarıyla alındı",
			"data":    configs,
		})
	}
}

// GetNginxConfig ID'ye göre belirli bir nginx yapılandırmasını döndürür
func GetNginxConfig(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz nginx yapılandırma ID'si",
			})
		}

		nginxService := services.NewNginxService(db)
		config, err := nginxService.GetNginxConfigByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması bulunamadı",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırması başarıyla alındı",
			"data":    config,
		})
	}
}

// CreateNginxConfig yeni bir nginx yapılandırması oluşturur
func CreateNginxConfig(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// İstek gövdesini ayrıştır
		var configData struct {
			Name         string `json:"name"`
			Domain       string `json:"domain"`
			ServerName   string `json:"serverName"`
			Port         int    `json:"port"`
			SSLEnabled   bool   `json:"sslEnabled"`
			CertPath     string `json:"certPath"`
			KeyPath      string `json:"keyPath"`
			ProxyPass    string `json:"proxyPass"`
			RootPath     string `json:"rootPath"`
			CustomConfig string `json:"customConfig"`
		}

		if err := c.BodyParser(&configData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Gerekli alanları doğrula
		if configData.Name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Yapılandırma adı gerekli",
			})
		}

		if configData.Domain == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Alan adı gerekli",
			})
		}

		if configData.ServerName == "" {
			// Belirtilmemişse alan adını sunucu adı olarak kullan
			configData.ServerName = configData.Domain
		}

		if configData.Port <= 0 {
			// Belirtilmemişse varsayılan olarak 80 portunu kullan
			configData.Port = 80
		}

		// SSL doğrulama
		if configData.SSLEnabled && (configData.CertPath == "" || configData.KeyPath == "") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "SSL etkinleştirildiğinde sertifika ve anahtar yolları gereklidir",
			})
		}

		// Proxy geçişi veya kök yolu sağlanmalıdır
		if configData.ProxyPass == "" && configData.RootPath == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Proxy geçişi veya kök yolu sağlanmalıdır",
			})
		}

		nginxService := services.NewNginxService(db)

		// Adın zaten var olup olmadığını kontrol et
		exists, err := nginxService.NginxConfigNameExists(configData.Name)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Yapılandırma adı kontrol edilirken hata oluştu",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "Yapılandırma adı zaten mevcut",
			})
		}

		// Alan adının zaten var olup olmadığını kontrol et
		exists, err = nginxService.NginxConfigDomainExists(configData.Domain)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Alan adı kontrol edilirken hata oluştu",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "Alan adı başka bir yapılandırmada zaten mevcut",
			})
		}

		// Nginx yapılandırması oluştur
		config, err := nginxService.CreateNginxConfig(
			configData.Name,
			configData.Domain,
			configData.ServerName,
			configData.Port,
			configData.SSLEnabled,
			configData.CertPath,
			configData.KeyPath,
			configData.ProxyPass,
			configData.RootPath,
			configData.CustomConfig,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması oluşturulurken hata oluştu: " + err.Error(),
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "nginx_config_create", "Nginx yapılandırması oluşturuldu: "+configData.Name, c.IP(), c.Get("User-Agent"))

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırması başarıyla oluşturuldu",
			"data":    config,
		})
	}
}

// UpdateNginxConfig mevcut bir nginx yapılandırmasını günceller
func UpdateNginxConfig(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz nginx yapılandırma ID'si",
			})
		}

		// İstek gövdesini ayrıştır
		var configData struct {
			Domain       string `json:"domain"`
			ServerName   string `json:"serverName"`
			Port         int    `json:"port"`
			SSLEnabled   bool   `json:"sslEnabled"`
			CertPath     string `json:"certPath"`
			KeyPath      string `json:"keyPath"`
			ProxyPass    string `json:"proxyPass"`
			RootPath     string `json:"rootPath"`
			CustomConfig string `json:"customConfig"`
		}

		if err := c.BodyParser(&configData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		nginxService := services.NewNginxService(db)

		// Mevcut yapılandırmayı al
		config, err := nginxService.GetNginxConfigByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması bulunamadı",
			})
		}

		// Alan adının başka bir yapılandırmada zaten var olup olmadığını kontrol et
		if configData.Domain != "" && configData.Domain != config.Domain {
			exists, err := nginxService.NginxConfigDomainExists(configData.Domain)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   true,
					"message": "Alan adı kontrol edilirken hata oluştu",
				})
			}
			if exists {
				return c.Status(fiber.StatusConflict).JSON(fiber.Map{
					"error":   true,
					"message": "Alan adı başka bir yapılandırmada zaten mevcut",
				})
			}
		}

		// Yapılandırmayı güncelle
		updatedConfig, err := nginxService.UpdateNginxConfig(
			config,
			configData.Domain,
			configData.ServerName,
			configData.Port,
			configData.SSLEnabled,
			configData.CertPath,
			configData.KeyPath,
			configData.ProxyPass,
			configData.RootPath,
			configData.CustomConfig,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması güncellenirken hata oluştu: " + err.Error(),
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "nginx_config_update", "Nginx yapılandırması güncellendi: "+config.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırması başarıyla güncellendi",
			"data":    updatedConfig,
		})
	}
}

// DeleteNginxConfig bir nginx yapılandırmasını siler
func DeleteNginxConfig(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz nginx yapılandırma ID'si",
			})
		}

		nginxService := services.NewNginxService(db)

		// Silmeden önce yapılandırmayı al, loglama için
		config, err := nginxService.GetNginxConfigByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması bulunamadı",
			})
		}

		// Yapılandırmayı sil
		if err := nginxService.DeleteNginxConfig(uint(id)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması silinirken hata oluştu: " + err.Error(),
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "nginx_config_delete", "Nginx yapılandırması silindi: "+config.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırması başarıyla silindi",
		})
	}
}

// ApplyNginxConfig bir nginx yapılandırmasını uygular
func ApplyNginxConfig(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz nginx yapılandırma ID'si",
			})
		}

		nginxService := services.NewNginxService(db)

		// Loglama için yapılandırmayı al
		config, err := nginxService.GetNginxConfigByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması bulunamadı",
			})
		}

		// Yapılandırmayı uygula
		if err := nginxService.ApplyNginxConfig(uint(id)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Nginx yapılandırması uygulanırken hata oluştu: " + err.Error(),
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "nginx_config_apply", "Nginx yapılandırması uygulandı: "+config.Name, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Nginx yapılandırması başarıyla uygulandı",
		})
	}
}
