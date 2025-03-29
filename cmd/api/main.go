package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/sivasbeltr/sisman/internal/auth"
	"github.com/sivasbeltr/sisman/internal/config"
	"github.com/sivasbeltr/sisman/internal/database"
	"github.com/sivasbeltr/sisman/internal/router"
)

var (
	startTime time.Time
)

func main() {
	// Uptime hesaplamaları için başlangıç zamanını kaydet
	startTime = time.Now()

	// Konfigürasyonları yükle
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Konfigürasyon yüklenemedi: %v", err)
	}

	// Kimlik doğrulama için JWT sırrını ayarla
	auth.SetJWTSecret(cfg.Auth.JWTSecret)

	// Veritabanını başlat
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatalf("Veritabanı başlatılamadı: %v", err)
	}

	// Temizlik için SQL bağlantısını al
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("SQL DB alınamadı: %v", err)
	}

	// HTML template motorunu ayarla
	engine := html.New("./public", ".html")
	engine.Reload(true) // Geliştirme modunda şablonları yeniden yükle
	engine.Debug(true)  // Hata ayıklama modunu etkinleştir
	app := fiber.New(fiber.Config{
		AppName:      "SISMAN API",
		ErrorHandler: router.ErrorHandler,
		ReadTimeout:  2 * time.Minute,
		WriteTimeout: 2 * time.Minute,
		Views:        engine,
	})

	// Statik dosyaları sun
	app.Static("/static", "./public/static")

	// Kök rotayı ayarla
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})

	// Rotaları ayarla
	router.SetupRoutes(app, db)

	// Başlangıç bilgilerini yazdır
	log.Printf("Sunucu %s portunda başlatılıyor...", cfg.Server.Port)
	log.Printf("Ortam: %s", cfg.Server.Env)
	log.Printf("Veritabanı yolu: %s", cfg.Database.Path)

	// Sunucuyu bir goroutine içinde başlat
	go func() {
		if err := app.Listen(":" + cfg.Server.Port); err != nil {
			log.Fatalf("Sunucu başlatılamadı: %v", err)
		}
	}()

	// Zarif kapatma işlemi
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Sunucu kapatılıyor...")

	// Veritabanı bağlantısını kapat
	if err := sqlDB.Close(); err != nil {
		log.Printf("Uyarı: Veritabanı kapatılamadı: %v", err)
	}

	// Fiber uygulamasını zaman aşımı ile kapat
	if err := app.ShutdownWithTimeout(30 * time.Second); err != nil {
		log.Fatalf("Sunucu kapatma başarısız oldu: %v", err)
	}

	log.Println("Sunucu başarıyla durduruldu")
}

// GetUptime sunucu çalışma süresini döner
func GetUptime() time.Duration {
	return time.Since(startTime)
}
