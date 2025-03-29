package services

import (
	"errors"

	"github.com/sivasbeltr/sisman/internal/auth"
	"github.com/sivasbeltr/sisman/internal/models"
	"github.com/sivasbeltr/sisman/internal/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserService kullanıcı ile ilgili işlemleri yönetir
type UserService struct {
	db *gorm.DB
}

// NewUserService yeni bir UserService örneği oluşturur
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// GetAllUsers tüm kullanıcıları veritabanından getirir
func (s *UserService) GetAllUsers() ([]models.User, error) {
	var users []models.User
	if err := s.db.Preload("Roles").Find(&users).Error; err != nil {
		return nil, err
	}

	// Şifre hash'lerini döndürme
	for i := range users {
		users[i].PasswordHash = ""
	}

	return users, nil
}

// GetUserByID ID'ye göre bir kullanıcıyı getirir
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.Preload("Roles").First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UsernameExists bir kullanıcı adının zaten var olup olmadığını kontrol eder
func (s *UserService) UsernameExists(username string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.User{}).Where("username = ?", username).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// EmailExists bir e-posta adresinin zaten var olup olmadığını kontrol eder
func (s *UserService) EmailExists(email string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateUser yeni bir kullanıcı oluşturur
func (s *UserService) CreateUser(username, password, email, firstName, lastName string, roleNames []string) (*models.User, error) {
	// Şifre gücünü doğrula
	if valid, message := utils.ValidatePassword(password); !valid {
		return nil, errors.New(message)
	}

	// Şifreyi hash'le
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Kullanıcı oluştur
	user := models.User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Email:        email,
		FirstName:    firstName,
		LastName:     lastName,
		Active:       true,
	}

	// İşlem başlat
	tx := s.db.Begin()
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Rolleri ata
	if len(roleNames) > 0 {
		var roles []models.Role
		if err := tx.Where("name IN ?", roleNames).Find(&roles).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// Eğer sağlanan rol isimlerine uygun roller bulunamazsa, varsayılan 'user' rolünü oluştur
		if len(roles) == 0 {
			// 'user' rolü var mı kontrol et
			var userRole models.Role
			if err := tx.Where("name = ?", "user").First(&userRole).Error; err != nil {
				// 'user' rolü yoksa oluştur
				if errors.Is(err, gorm.ErrRecordNotFound) {
					userRole = models.Role{
						Name:        "user",
						Description: "Standart izinlere sahip normal kullanıcı",
					}
					if err := tx.Create(&userRole).Error; err != nil {
						tx.Rollback()
						return nil, err
					}
				} else {
					tx.Rollback()
					return nil, err
				}
			}
			roles = []models.Role{userRole}
		}

		if err := tx.Model(&user).Association("Roles").Append(roles); err != nil {
			tx.Rollback()
			return nil, err
		}
	} else {
		// Eğer rol sağlanmadıysa, varsayılan 'user' rolünü ata
		var userRole models.Role
		if err := tx.Where("name = ?", "user").First(&userRole).Error; err != nil {
			// 'user' rolü yoksa oluştur
			if errors.Is(err, gorm.ErrRecordNotFound) {
				userRole = models.Role{
					Name:        "user",
					Description: "Standart izinlere sahip normal kullanıcı",
				}
				if err := tx.Create(&userRole).Error; err != nil {
					tx.Rollback()
					return nil, err
				}
			} else {
				tx.Rollback()
				return nil, err
			}
		}

		if err := tx.Model(&user).Association("Roles").Append(&userRole); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// İşlemi tamamla
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Rolleri ile kullanıcıyı yeniden yükle
	if err := s.db.Preload("Roles").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// UpdateUser mevcut bir kullanıcıyı günceller
func (s *UserService) UpdateUser(user *models.User, email, firstName, lastName, password string, active *bool, roleNames []string) (*models.User, error) {
	// İşlem başlat
	tx := s.db.Begin()

	// Temel alanları güncelle
	if email != "" {
		user.Email = email
	}
	if firstName != "" {
		user.FirstName = firstName
	}
	if lastName != "" {
		user.LastName = lastName
	}
	if active != nil {
		user.Active = *active
	}

	// Şifre sağlanmışsa güncelle
	if password != "" {
		// Şifre gücünü doğrula
		if valid, message := utils.ValidatePassword(password); !valid {
			tx.Rollback()
			return nil, errors.New(message)
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		user.PasswordHash = string(hashedPassword)
	}

	// Kullanıcı değişikliklerini kaydet
	if err := tx.Save(user).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Roller sağlanmışsa güncelle
	if len(roleNames) > 0 {
		// Mevcut rolleri temizle
		if err := tx.Model(user).Association("Roles").Clear(); err != nil {
			tx.Rollback()
			return nil, err
		}

		// Yeni rolleri ata
		var roles []models.Role
		if err := tx.Where("name IN ?", roleNames).Find(&roles).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		if err := tx.Model(user).Association("Roles").Append(roles); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// İşlemi tamamla
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Rolleri ile kullanıcıyı yeniden yükle
	if err := s.db.Preload("Roles").First(user, user.ID).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// DeleteUser bir kullanıcıyı siler
func (s *UserService) DeleteUser(id uint) error {
	// İşlem başlat
	tx := s.db.Begin()

	// Önce kullanıcı rollerini temizle (ilişkilendirmeleri kaldır)
	if err := tx.Model(&models.User{Model: models.Model{ID: id}}).Association("Roles").Clear(); err != nil {
		tx.Rollback()
		return err
	}

	// Kullanıcıyı sil
	if err := tx.Delete(&models.User{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// İşlemi tamamla
	return tx.Commit().Error
}

// AuthenticateUser kullanıcı adı/şifre kombinasyonunun geçerli olup olmadığını kontrol eder
func (s *UserService) AuthenticateUser(username, password string) (*models.User, error) {
	var user models.User

	// Kullanıcı adını kullanarak kullanıcıyı bul
	if err := s.db.Preload("Roles").Where("username = ?", username).First(&user).Error; err != nil {
		return nil, errors.New("geçersiz kullanıcı adı veya şifre")
	}

	// Kullanıcının aktif olup olmadığını kontrol et
	if !user.Active {
		return nil, errors.New("kullanıcı hesabı pasif")
	}

	// Şifreyi kontrol et
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, errors.New("geçersiz kullanıcı adı veya şifre")
	}

	return &user, nil
}

// GenerateAuthToken bir kullanıcı için JWT token oluşturur
func (s *UserService) GenerateAuthToken(user *models.User) (string, error) {
	// Rol isimlerini çıkar
	roleNames := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roleNames[i] = role.Name
	}

	// 24 saatlik süre ile token oluştur
	return auth.GenerateToken(user.ID, roleNames, 24)
}

// RefreshToken bir token'ı doğrular ve yenisini verir
func (s *UserService) RefreshToken(token string) (string, error) {
	// Token'ı doğrula
	claims, err := auth.ValidateToken(token)
	if err != nil {
		return "", err
	}

	// Kullanıcının hala var olup olmadığını ve aktif olup olmadığını kontrol et
	var user models.User
	if err := s.db.Preload("Roles").First(&user, claims.UserID).Error; err != nil {
		return "", errors.New("kullanıcı bulunamadı")
	}
	if !user.Active {
		return "", errors.New("kullanıcı hesabı pasif")
	}

	// Rol isimlerini çıkar
	roleNames := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roleNames[i] = role.Name
	}

	// Yeni bir token oluştur
	return auth.GenerateToken(user.ID, roleNames, 24)
}

// GetUserRoles bir kullanıcı için tüm rolleri getirir
func (s *UserService) GetUserRoles(userID uint) ([]models.Role, error) {
	var user models.User
	if err := s.db.Preload("Roles").First(&user, userID).Error; err != nil {
		return nil, err
	}
	return user.Roles, nil
}

// CreateInitialAdminUser eğer kullanıcı yoksa ilk admin kullanıcısını oluşturur
func (s *UserService) CreateInitialAdminUser(username, password, email string) (*models.User, error) {
	// Herhangi bir kullanıcı olup olmadığını kontrol et
	var count int64
	s.db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return nil, errors.New("kullanıcılar zaten mevcut, ilk admin oluşturulmadı")
	}

	// İşlem başlat
	tx := s.db.Begin()

	// Admin rolü yoksa oluştur
	var adminRole models.Role
	if err := tx.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			adminRole = models.Role{
				Name:        "admin",
				Description: "Tam sistem erişimine sahip yönetici",
			}
			if err := tx.Create(&adminRole).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			tx.Rollback()
			return nil, err
		}
	}

	// Kullanıcı rolü yoksa oluştur
	var userRole models.Role
	if err := tx.Where("name = ?", "user").First(&userRole).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			userRole = models.Role{
				Name:        "user",
				Description: "Standart izinlere sahip normal kullanıcı",
			}
			if err := tx.Create(&userRole).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			tx.Rollback()
			return nil, err
		}
	}

	// Şifreyi hash'le
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Admin kullanıcısını oluştur
	adminUser := models.User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Email:        email,
		FirstName:    "Admin",
		LastName:     "User",
		Active:       true,
	}

	if err := tx.Create(&adminUser).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Her iki rolü de ata
	if err := tx.Model(&adminUser).Association("Roles").Append([]models.Role{adminRole, userRole}); err != nil {
		tx.Rollback()
		return nil, err
	}

	// İşlemi tamamla
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Rolleri ile kullanıcıyı yeniden yükle
	var user models.User
	if err := s.db.Preload("Roles").First(&user, adminUser.ID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
