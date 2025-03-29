package services

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"text/template"

	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// NginxService nginx yapılandırma işlemlerini yönetir
type NginxService struct {
	db *gorm.DB
}

// NewNginxService yeni bir NginxService örneği oluşturur
func NewNginxService(db *gorm.DB) *NginxService {
	return &NginxService{db: db}
}

// GetAllNginxConfigs tüm nginx yapılandırmalarını getirir
func (s *NginxService) GetAllNginxConfigs() ([]models.NginxConfig, error) {
	var configs []models.NginxConfig
	if err := s.db.Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}

// GetNginxConfigByID ID'ye göre bir nginx yapılandırmasını getirir
func (s *NginxService) GetNginxConfigByID(id uint) (*models.NginxConfig, error) {
	var config models.NginxConfig
	if err := s.db.First(&config, id).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

// NginxConfigNameExists yapılandırma adının zaten var olup olmadığını kontrol eder
func (s *NginxService) NginxConfigNameExists(name string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.NginxConfig{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// NginxConfigDomainExists bir domainin zaten var olup olmadığını kontrol eder
func (s *NginxService) NginxConfigDomainExists(domain string) (bool, error) {
	var count int64
	if err := s.db.Model(&models.NginxConfig{}).Where("domain = ?", domain).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateNginxConfig yeni bir nginx yapılandırması oluşturur
func (s *NginxService) CreateNginxConfig(
	name string,
	domain string,
	serverName string,
	port int,
	sslEnabled bool,
	certPath string,
	keyPath string,
	proxyPass string,
	rootPath string,
	customConfig string,
) (*models.NginxConfig, error) {
	// Yapılandırma girişini oluştur
	config := models.NginxConfig{
		Name:         name,
		Domain:       domain,
		ServerName:   serverName,
		Port:         port,
		SSLEnabled:   sslEnabled,
		CertPath:     certPath,
		KeyPath:      keyPath,
		ProxyPass:    proxyPass,
		RootPath:     rootPath,
		Active:       false, // Uygulanana kadar aktif değil
		CustomConfig: customConfig,
	}

	// Adına göre yapılandırma yolu oluştur
	configPath := fmt.Sprintf("/etc/nginx/sites-available/%s.conf", name)
	config.ConfigPath = configPath

	if err := s.db.Create(&config).Error; err != nil {
		return nil, err
	}

	return &config, nil
}

// UpdateNginxConfig mevcut bir nginx yapılandırmasını günceller
func (s *NginxService) UpdateNginxConfig(
	config *models.NginxConfig,
	domain string,
	serverName string,
	port int,
	sslEnabled bool,
	certPath string,
	keyPath string,
	proxyPass string,
	rootPath string,
	customConfig string,
) (*models.NginxConfig, error) {
	// Alanları güncelle
	if domain != "" {
		config.Domain = domain
	}
	if serverName != "" {
		config.ServerName = serverName
	}
	if port > 0 {
		config.Port = port
	}
	config.SSLEnabled = sslEnabled
	if certPath != "" {
		config.CertPath = certPath
	}
	if keyPath != "" {
		config.KeyPath = keyPath
	}
	if proxyPass != "" {
		config.ProxyPass = proxyPass
	}
	if rootPath != "" {
		config.RootPath = rootPath
	}
	if customConfig != "" {
		config.CustomConfig = customConfig
	}

	// Yapılandırma aktifse, değiştirildiği için pasif olarak ayarla
	if config.Active {
		config.Active = false
	}

	// Değişiklikleri kaydet
	if err := s.db.Save(config).Error; err != nil {
		return nil, err
	}

	return config, nil
}

// DeleteNginxConfig bir nginx yapılandırmasını siler
func (s *NginxService) DeleteNginxConfig(id uint) error {
	// Önce yapılandırmayı al, aktif olup olmadığını kontrol et
	var config models.NginxConfig
	if err := s.db.First(&config, id).Error; err != nil {
		return err
	}

	// Yapılandırma aktifse, önce sembolik bağlantıyı kaldırmamız gerekir
	if config.Active {
		// sites-enabled'dan sembolik bağlantıyı kaldır
		symlinkPath := filepath.Join("/etc/nginx/sites-enabled", filepath.Base(config.ConfigPath))
		if err := os.Remove(symlinkPath); err != nil && !os.IsNotExist(err) {
			return fmt.Errorf("sembolik bağlantı kaldırılamadı: %w", err)
		}
	}

	// Yapılandırma dosyasını varsa sil
	if config.ConfigPath != "" {
		if err := os.Remove(config.ConfigPath); err != nil && !os.IsNotExist(err) {
			return fmt.Errorf("yapılandırma dosyası kaldırılamadı: %w", err)
		}
	}

	// Veritabanından sil
	return s.db.Delete(&models.NginxConfig{}, id).Error
}

// ApplyNginxConfig bir nginx yapılandırmasını uygular (dosya sistemine yazar ve nginx'i yeniden yükler)
func (s *NginxService) ApplyNginxConfig(id uint) error {
	// Yapılandırmayı al
	var config models.NginxConfig
	if err := s.db.First(&config, id).Error; err != nil {
		return err
	}

	// Yapılandırma içeriğini oluştur
	configContent, err := s.generateNginxConfig(&config)
	if err != nil {
		return fmt.Errorf("yapılandırma oluşturulamadı: %w", err)
	}

	// sites-available dizinini oluştur, yoksa
	sitesAvailable := "/etc/nginx/sites-available"
	if err := os.MkdirAll(sitesAvailable, 0755); err != nil {
		return fmt.Errorf("sites-available dizini oluşturulamadı: %w", err)
	}

	// Yapılandırma dosyasına yaz
	if err := os.WriteFile(config.ConfigPath, []byte(configContent), 0644); err != nil {
		return fmt.Errorf("yapılandırma dosyasına yazılamadı: %w", err)
	}

	// sites-enabled'da sembolik bağlantı oluştur
	sitesEnabled := "/etc/nginx/sites-enabled"
	if err := os.MkdirAll(sitesEnabled, 0755); err != nil {
		return fmt.Errorf("sites-enabled dizini oluşturulamadı: %w", err)
	}

	symlinkPath := filepath.Join(sitesEnabled, filepath.Base(config.ConfigPath))

	// Mevcut sembolik bağlantıyı kaldır, varsa
	os.Remove(symlinkPath) // Yoksa hatayı yoksay

	// Sembolik bağlantı oluştur
	if err := os.Symlink(config.ConfigPath, symlinkPath); err != nil {
		return fmt.Errorf("sembolik bağlantı oluşturulamadı: %w", err)
	}

	// Nginx yapılandırmasını test et
	cmd := exec.Command("nginx", "-t")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		// Test başarısız olursa, sembolik bağlantıyı kaldır ve hatayı döndür
		os.Remove(symlinkPath)
		return fmt.Errorf("nginx yapılandırma testi başarısız: %s", stderr.String())
	}

	// Nginx'i yeniden yükle
	cmd = exec.Command("nginx", "-s", "reload")
	stderr.Reset()
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		// Yeniden yükleme başarısız olursa, sembolik bağlantıyı kaldır ve hatayı döndür
		os.Remove(symlinkPath)
		return fmt.Errorf("nginx yeniden yükleme başarısız: %s", stderr.String())
	}

	// Yapılandırma durumunu güncelle
	config.Active = true
	if err := s.db.Save(&config).Error; err != nil {
		return fmt.Errorf("yapılandırma durumu güncellenemedi: %w", err)
	}

	return nil
}

// generateNginxConfig nginx yapılandırma içeriğini oluşturur
func (s *NginxService) generateNginxConfig(config *models.NginxConfig) (string, error) {
	// Nginx yapılandırması için temel şablon
	tmpl := `
server {
    listen {{.Port}};{{if .SSLEnabled}}
    listen 443 ssl;
    ssl_certificate {{.CertPath}};
    ssl_certificate_key {{.KeyPath}};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;{{end}}
    
    server_name {{.ServerName}};
    {{if .ProxyPass}}
    location / {
        proxy_pass {{.ProxyPass}};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    {{else if .RootPath}}
    location / {
        root {{.RootPath}};
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }
    {{end}}
    
    {{.CustomConfig}}
}
`

	// Şablonu ayrıştır
	t, err := template.New("nginx").Parse(tmpl)
	if err != nil {
		return "", err
	}

	// Şablonu yapılandırma verileriyle çalıştır
	var buf bytes.Buffer
	err = t.Execute(&buf, config)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

// CheckNginxStatus nginx'in çalışıp çalışmadığını kontrol eder
func (s *NginxService) CheckNginxStatus() (bool, error) {
	cmd := exec.Command("systemctl", "is-active", "nginx")
	output, err := cmd.Output()

	if err != nil {
		// Komut başarısız oldu, nginx muhtemelen çalışmıyor
		return false, nil
	}

	status := string(output)
	return status == "active\n", nil
}

// GetAllActiveDomains tüm aktif domain yapılandırmalarını getirir
func (s *NginxService) GetAllActiveDomains() ([]models.NginxConfig, error) {
	var configs []models.NginxConfig
	if err := s.db.Where("active = ?", true).Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}

// DeactivateNginxConfig bir nginx yapılandırmasını devre dışı bırakır
func (s *NginxService) DeactivateNginxConfig(id uint) error {
	// Önce yapılandırmayı al
	var config models.NginxConfig
	if err := s.db.First(&config, id).Error; err != nil {
		return err
	}

	// Aktif değilse, yapılacak bir şey yok
	if !config.Active {
		return nil
	}

	// sites-enabled'dan sembolik bağlantıyı kaldır
	symlinkPath := filepath.Join("/etc/nginx/sites-enabled", filepath.Base(config.ConfigPath))
	if err := os.Remove(symlinkPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("sembolik bağlantı kaldırılamadı: %w", err)
	}

	// Nginx'i yeniden yükle
	cmd := exec.Command("nginx", "-s", "reload")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("nginx yeniden yükleme başarısız: %s", stderr.String())
	}

	// Yapılandırma durumunu güncelle
	config.Active = false
	if err := s.db.Save(&config).Error; err != nil {
		return fmt.Errorf("yapılandırma durumu güncellenemedi: %w", err)
	}

	return nil
}
