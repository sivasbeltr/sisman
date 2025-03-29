package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/models"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetAllUsers tüm kullanıcıları döndürür
func GetAllUsers(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userService := services.NewUserService(db)
		users, err := userService.GetAllUsers()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcılar alınırken hata oluştu",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcılar başarıyla alındı",
			"data":    users,
		})
	}
}

// GetUser belirli bir kullanıcıyı ID ile döndürür
func GetUser(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz kullanıcı ID",
			})
		}

		// İstek yapan kullanıcının admin olup olmadığını veya kendi verilerini istediğini kontrol et
		requestingUserID, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı ID bağlamda bulunamadı",
			})
		}

		userService := services.NewUserService(db)

		// Kendi verilerini isteyen veya admin olan kullanıcıya izin ver
		if uint(id) != requestingUserID {
			// Kullanıcının admin rolüne sahip olup olmadığını kontrol et
			userRoles, ok := c.Locals("userRoles").([]string)
			if !ok || !contains(userRoles, "admin") {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error":   true,
					"message": "Erişim reddedildi: yalnızca kendi kullanıcı verilerinizi görüntüleyebilirsiniz",
				})
			}
		}

		user, err := userService.GetUserByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı bulunamadı",
			})
		}

		// Şifre hash'ini döndürme
		user.PasswordHash = ""

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı başarıyla alındı",
			"data":    user,
		})
	}
}

// CreateUser yeni bir kullanıcı oluşturur
func CreateUser(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// İstek gövdesini ayrıştır
		var userData struct {
			Username  string   `json:"username"`
			Password  string   `json:"password"`
			Email     string   `json:"email"`
			FirstName string   `json:"firstName"`
			LastName  string   `json:"lastName"`
			Roles     []string `json:"roles"`
		}

		if err := c.BodyParser(&userData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Gerekli alanları doğrula
		if userData.Username == "" || userData.Password == "" || userData.Email == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı adı, şifre ve e-posta gereklidir",
			})
		}

		userService := services.NewUserService(db)

		// Kullanıcı adının zaten var olup olmadığını kontrol et
		exists, err := userService.UsernameExists(userData.Username)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı adı uygunluğu kontrol edilirken hata oluştu",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı adı zaten mevcut",
			})
		}

		// E-postanın zaten var olup olmadığını kontrol et
		exists, err = userService.EmailExists(userData.Email)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "E-posta uygunluğu kontrol edilirken hata oluştu",
			})
		}
		if exists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   true,
				"message": "E-posta zaten mevcut",
			})
		}

		// Kullanıcı oluştur
		user, err := userService.CreateUser(userData.Username, userData.Password, userData.Email, userData.FirstName, userData.LastName, userData.Roles)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı oluşturulurken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		activityService.LogActivity(user.ID, "user_create", "Kullanıcı oluşturuldu", c.IP(), c.Get("User-Agent"))

		// Şifre hash'ini döndürme
		user.PasswordHash = ""

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı başarıyla oluşturuldu",
			"data":    user,
		})
	}
}

// UpdateUser mevcut bir kullanıcıyı günceller
func UpdateUser(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz kullanıcı ID",
			})
		}

		// İstek gövdesini ayrıştır
		var userData struct {
			Email     string   `json:"email"`
			FirstName string   `json:"firstName"`
			LastName  string   `json:"lastName"`
			Password  string   `json:"password"` // Güncelleme için isteğe bağlı
			Active    *bool    `json:"active"`   // Nil olmasına izin vermek için işaretçi
			Roles     []string `json:"roles"`
		}

		if err := c.BodyParser(&userData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		userService := services.NewUserService(db)

		// Mevcut kullanıcıyı al
		user, err := userService.GetUserByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı bulunamadı",
			})
		}

		// Kullanıcı alanlarını güncelle
		updatedUser, err := userService.UpdateUser(user, userData.Email, userData.FirstName, userData.LastName, userData.Password, userData.Active, userData.Roles)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı güncellenirken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		requestingUserID := c.Locals("userId").(uint)
		activityService.LogActivity(requestingUserID, "user_update", "Kullanıcı güncellendi: "+user.Username, c.IP(), c.Get("User-Agent"))

		// Şifre hash'ini döndürme
		updatedUser.PasswordHash = ""

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı başarıyla güncellendi",
			"data":    updatedUser,
		})
	}
}

// DeleteUser bir kullanıcıyı siler
func DeleteUser(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz kullanıcı ID",
			})
		}

		userService := services.NewUserService(db)

		// Silmeden önce kullanıcıyı al, loglama için
		user, err := userService.GetUserByID(uint(id))
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı bulunamadı",
			})
		}

		// Kullanıcıyı sil
		if err := userService.DeleteUser(uint(id)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı silinirken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		requestingUserID := c.Locals("userId").(uint)
		activityService.LogActivity(requestingUserID, "user_delete", "Kullanıcı silindi: "+user.Username, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Kullanıcı başarıyla silindi",
		})
	}
}

// Login bir kullanıcıyı kimlik doğrular ve bir JWT token döndürür
func Login(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// İstek gövdesini ayrıştır
		var loginData struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&loginData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Gerekli alanları doğrula
		if loginData.Username == "" || loginData.Password == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Kullanıcı adı ve şifre gereklidir",
			})
		}

		userService := services.NewUserService(db)

		// Kullanıcıyı kimlik doğrula
		user, err := userService.AuthenticateUser(loginData.Username, loginData.Password)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz kimlik bilgileri",
			})
		}

		// Token oluştur
		token, err := userService.GenerateAuthToken(user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Kimlik doğrulama tokeni oluşturulurken hata oluştu",
			})
		}

		// Aktiviteyi kaydet
		activityService := services.NewActivityService(db)
		activityService.LogActivity(user.ID, "user_login", "Kullanıcı giriş yaptı", c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Giriş başarılı",
			"token":   token,
			"user": fiber.Map{
				"id":        user.ID,
				"username":  user.Username,
				"email":     user.Email,
				"firstName": user.FirstName,
				"lastName":  user.LastName,
				"roles":     getRoleNames(user.Roles),
			},
		})
	}
}

// RefreshToken bir JWT tokeni yeniler
func RefreshToken(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// İstek gövdesini ayrıştır
		var refreshData struct {
			Token string `json:"token"`
		}

		if err := c.BodyParser(&refreshData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz istek gövdesi",
			})
		}

		// Tokeni doğrula
		userService := services.NewUserService(db)
		newToken, err := userService.RefreshToken(refreshData.Token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz veya süresi dolmuş token",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Token başarıyla yenilendi",
			"token":   newToken,
		})
	}
}

// Yardımcı fonksiyonlar

// contains bir dilimin içinde bir stringin olup olmadığını kontrol eder
func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// getRoleNames rol nesnelerinden rol adlarını çıkarır
func getRoleNames(roles []models.Role) []string {
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}
	return roleNames
}
