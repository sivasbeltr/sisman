package database

import (
	"log"
	"os"
	"path/filepath"

	"github.com/sivasbeltr/sisman/internal/config"
	"github.com/sivasbeltr/sisman/internal/models"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Init veritabanı bağlantısını başlatır
func Init(config config.DatabaseConfig) (*gorm.DB, error) {
	// Veritabanı dizininin mevcut olduğundan emin olun
	if config.Path != ":memory:" {
		// Veritabanı dosyasından dizin yolunu çıkar
		dir := filepath.Dir(config.Path)
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			log.Printf("Veritabanı dizini mevcut değil, oluşturuluyor: %s", dir)
			if err := os.MkdirAll(dir, 0755); err != nil {
				return nil, err
			}
		}
	}

	// Veritabanına bağlan
	db, err := gorm.Open(sqlite.Open(config.Path), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Modelleri otomatik olarak göç ettir
	if err := db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Command{},
		&models.CommandParameter{},
		&models.CommandExecution{},
		&models.Service{},
		&models.ServiceMetric{},
		&models.NginxConfig{},
		&models.DockerContainer{},
		&models.Activity{},
	); err != nil {
		return nil, err
	}

	// Varsayılan roller ve admin kullanıcıyı gerektiğinde başlat
	if err := initializeDefaultData(db); err != nil {
		log.Printf("Uyarı: Varsayılan veriler başlatılamadı: %v", err)
	}

	log.Println("Veritabanı bağlantısı kuruldu")
	return db, nil
}

// initializeDefaultData varsayılan roller ve admin kullanıcıyı oluşturur (eğer mevcut değilse)
func initializeDefaultData(db *gorm.DB) error {
	// Kullanıcıların mevcut olup olmadığını kontrol et
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return err
	}

	// Eğer kullanıcı yoksa, varsayılan admin oluştur
	if userCount == 0 {
		log.Println("Kullanıcı bulunamadı, varsayılan admin kullanıcı oluşturuluyor")
		userService := services.NewUserService(db)

		defaultAdminUsername := os.Getenv("DEFAULT_ADMIN_USERNAME")
		if defaultAdminUsername == "" {
			defaultAdminUsername = "admin"
		}

		defaultAdminPassword := os.Getenv("DEFAULT_ADMIN_PASSWORD")
		if defaultAdminPassword == "" {
			defaultAdminPassword = "Admin123!" // Bu hemen değiştirilmelidir
		}

		defaultAdminEmail := os.Getenv("DEFAULT_ADMIN_EMAIL")
		if defaultAdminEmail == "" {
			defaultAdminEmail = "admin@example.com"
		}

		_, err := userService.CreateInitialAdminUser(
			defaultAdminUsername,
			defaultAdminPassword,
			defaultAdminEmail,
		)

		if err != nil {
			return err
		}
		log.Printf("Varsayılan admin kullanıcı oluşturuldu: %s", defaultAdminUsername)
		log.Printf("ÖNEMLİ: Lütfen varsayılan admin şifresini hemen değiştirin!")
	}

	return nil
}
