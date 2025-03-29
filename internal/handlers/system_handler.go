package handlers

import (
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetSystemHealth sistem bileşenlerinin düzgün çalışıp çalışmadığını kontrol eder
func GetSystemHealth(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Veritabanı bağlantısını kontrol et
		sqlDB, err := db.DB()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Veritabanı bağlantı hatası",
				"status":  "unhealthy",
			})
		}

		// Veritabanına ping at
		if err := sqlDB.Ping(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Veritabanı ping'i başarısız",
				"status":  "unhealthy",
			})
		}

		// Gerekirse Nginx durumunu kontrol et
		nginxService := services.NewNginxService(db)
		nginxStatus, _ := nginxService.CheckNginxStatus()

		// Gerekirse Docker hizmetini kontrol et
		dockerStatus := "unknown"
		dockerService, err := services.NewDockerService(db)
		if err == nil {
			defer dockerService.Close()
			_, err = dockerService.GetImages()
			if err == nil {
				dockerStatus = "healthy"
			} else {
				dockerStatus = "unhealthy"
			}
		}

		// Sağlıklı yanıtı döndür
		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Sistem sağlıklı",
			"status":  "healthy",
			"components": fiber.Map{
				"database": "healthy",
				"nginx":    nginxStatus,
				"docker":   dockerStatus,
				"api":      "healthy",
			},
			"timestamp": time.Now(),
		})
	}
}

// GetSystemInfo sistem hakkında detaylı bilgi döndürür
func GetSystemInfo(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Kullanıcıları say
		var userCount int64
		db.Table("users").Count(&userCount)

		// Hizmetleri say
		var serviceCount int64
		db.Table("services").Count(&serviceCount)

		// Komutları say
		var commandCount int64
		db.Table("commands").Count(&commandCount)

		// Komut yürütmelerini say
		var executionCount int64
		db.Table("command_executions").Count(&executionCount)

		// Nginx yapılandırmalarını say
		var nginxCount int64
		db.Table("nginx_configs").Count(&nginxCount)

		// Aktif Nginx yapılandırmalarını al
		var activeNginxCount int64
		db.Table("nginx_configs").Where("active = ?", true).Count(&activeNginxCount)

		// Docker bilgisini al
		var containerCount int64
		db.Table("docker_containers").Count(&containerCount)

		// Etkinlik sayılarını al
		var activityCount int64
		db.Table("activities").Count(&activityCount)

		// Sistem bilgisini al
		memStats := runtime.MemStats{}
		runtime.ReadMemStats(&memStats)

		// Sunucu çalışma süresini al
		uptime := time.Now().Unix()
		// Bu sadece mevcut zaman damgasıdır, gerçek bir uygulamada
		// uygulamanın başlangıç zamanını yakalarsınız

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Sistem bilgisi başarıyla alındı",
			"data": fiber.Map{
				"version": "1.0.0",
				"uptime":  uptime,
				"memory": fiber.Map{
					"alloc":        memStats.Alloc,
					"totalAlloc":   memStats.TotalAlloc,
					"sys":          memStats.Sys,
					"numGC":        memStats.NumGC,
					"goroutines":   runtime.NumGoroutine(),
					"cpus":         runtime.NumCPU(),
					"goVersion":    runtime.Version(),
					"architecture": runtime.GOARCH,
					"os":           runtime.GOOS,
				},
				"database": fiber.Map{
					"users":              userCount,
					"services":           serviceCount,
					"commands":           commandCount,
					"executions":         executionCount,
					"nginxConfigs":       nginxCount,
					"activeNginxConfigs": activeNginxCount,
					"containers":         containerCount,
					"activities":         activityCount,
				},
				"lastBackup": "Yok", // Gerçek yedekleme bilgisinden doldurulacak
				"disk": fiber.Map{
					"total": "Yok", // Disk bilgisini almak için işletim sistemine özgü kod gerekir
					"used":  "Yok",
					"free":  "Yok",
				},
			},
		})
	}
}
