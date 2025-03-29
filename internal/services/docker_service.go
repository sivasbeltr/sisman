package services

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// DockerService Docker ile ilgili işlemleri yönetir
type DockerService struct {
	db     *gorm.DB
	client *client.Client
}

// NewDockerService yeni bir DockerService örneği oluşturur
func NewDockerService(db *gorm.DB) (*DockerService, error) {
	// Docker istemcisi oluştur
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &DockerService{
		db:     db,
		client: cli,
	}, nil
}

// Close Docker istemcisi bağlantısını kapatır
func (s *DockerService) Close() error {
	return s.client.Close()
}

// SyncContainers veritabanındaki konteynerleri Docker'daki gerçek konteynerlerle senkronize eder
func (s *DockerService) SyncContainers() error {
	// Konteynerleri listele
	containers, err := s.client.ContainerList(context.Background(), container.ListOptions{All: true})
	if err != nil {
		return err
	}

	// İşlem başlat
	tx := s.db.Begin()

	// Konteyner kayıtlarını oluştur veya güncelle
	for _, c := range containers {
		// Konteyner detaylarını al
		info, err := s.client.ContainerInspect(context.Background(), c.ID)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Portları JSON'a dönüştür
		portsJSON, err := json.Marshal(c.Ports)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Ağları JSON'a dönüştür
		networksJSON, err := json.Marshal(info.NetworkSettings.Networks)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Volümleri JSON'a dönüştür
		volumesJSON, err := json.Marshal(info.Mounts)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Ortam değişkenlerini JSON'a dönüştür
		envJSON, err := json.Marshal(info.Config.Env)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Etiketleri JSON'a dönüştür
		labelsJSON, err := json.Marshal(info.Config.Labels)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Konteynerin veritabanında zaten var olup olmadığını kontrol et
		var containerRecord models.DockerContainer
		result := tx.Where("container_id = ?", c.ID).First(&containerRecord)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				// Yeni kayıt oluştur
				containerRecord = models.DockerContainer{
					ContainerID:   c.ID,
					Name:          c.Names[0][1:], // Öndeki eğik çizgiyi kaldır
					Image:         c.Image,
					Status:        c.Status,
					Created:       c.Created,
					Ports:         string(portsJSON),
					Networks:      string(networksJSON),
					Volumes:       string(volumesJSON),
					Environment:   string(envJSON),
					RestartPolicy: string(info.HostConfig.RestartPolicy.Name),
					Monitored:     true, // Varsayılan olarak izleniyor
					Labels:        string(labelsJSON),
				}
				if err := tx.Create(&containerRecord).Error; err != nil {
					tx.Rollback()
					return err
				}
			} else {
				// Veritabanı hatası
				tx.Rollback()
				return result.Error
			}
		} else {
			// Mevcut kaydı güncelle
			containerRecord.Name = c.Names[0][1:]
			containerRecord.Image = c.Image
			containerRecord.Status = c.Status
			containerRecord.Ports = string(portsJSON)
			containerRecord.Networks = string(networksJSON)
			containerRecord.Volumes = string(volumesJSON)
			containerRecord.Environment = string(envJSON)
			containerRecord.RestartPolicy = string(info.HostConfig.RestartPolicy.Name)
			containerRecord.Labels = string(labelsJSON)

			if err := tx.Save(&containerRecord).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	// Docker'da artık var olmayan konteynerleri veritabanından kaldır
	containerIDs := make([]string, len(containers))
	for i, c := range containers {
		containerIDs[i] = c.ID
	}

	if len(containerIDs) > 0 {
		if err := tx.Where("container_id NOT IN ?", containerIDs).Delete(&models.DockerContainer{}).Error; err != nil {
			tx.Rollback()
			return err
		}
	} else {
		// Eğer hiçbir konteyner çalışmıyorsa tabloyu temizle
		if err := tx.Where("1 = 1").Delete(&models.DockerContainer{}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// İşlemi tamamla
	return tx.Commit().Error
}

// GetAllContainers tüm Docker konteynerlerini döndürür
func (s *DockerService) GetAllContainers() ([]models.DockerContainer, error) {
	// Önce konteynerleri senkronize et, böylece veritabanı güncel olur
	if err := s.SyncContainers(); err != nil {
		return nil, err
	}

	// Konteynerleri veritabanından al
	var containers []models.DockerContainer
	if err := s.db.Find(&containers).Error; err != nil {
		return nil, err
	}

	return containers, nil
}

// GetContainerByID belirli bir Docker konteynerini döndürür
func (s *DockerService) GetContainerByID(id string) (*models.DockerContainer, error) {
	// Önce konteynerleri senkronize et, böylece veritabanı güncel olur
	if err := s.SyncContainers(); err != nil {
		return nil, err
	}

	// Konteyneri veritabanından al
	var container models.DockerContainer
	if err := s.db.Where("container_id = ?", id).First(&container).Error; err != nil {
		return nil, err
	}

	return &container, nil
}

// StartContainer bir Docker konteynerini başlatır
func (s *DockerService) StartContainer(id string) error {
	// Konteynerin var olup olmadığını kontrol et
	_, err := s.client.ContainerInspect(context.Background(), id)
	if err != nil {
		return err
	}

	// Konteyneri başlat
	return s.client.ContainerStart(context.Background(), id, container.StartOptions{})
}

// StopContainer bir Docker konteynerini durdurur
func (s *DockerService) StopContainer(id string) error {
	// Konteynerin var olup olmadığını kontrol et
	_, err := s.client.ContainerInspect(context.Background(), id)
	if err != nil {
		return err
	}

	// Zaman aşımı ile konteyneri durdur
	timeout := 30 * time.Second
	stopOptions := container.StopOptions{
		Timeout: func(t time.Duration) *int {
			i := int(t.Seconds())
			return &i
		}(timeout),
	}
	return s.client.ContainerStop(context.Background(), id, stopOptions)
}

// GetContainerLogs bir Docker konteynerinin loglarını döndürür
func (s *DockerService) GetContainerLogs(id string, tail int) (string, error) {
	// Konteynerin var olup olmadığını kontrol et
	_, err := s.client.ContainerInspect(context.Background(), id)
	if err != nil {
		return "", err
	}

	// Logları al
	options := container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Tail:       string(tail),
	}

	logs, err := s.client.ContainerLogs(context.Background(), id, options)
	if err != nil {
		return "", err
	}
	defer logs.Close()

	// Logları oku
	logsBytes, err := io.ReadAll(logs)
	if err != nil {
		return "", err
	}

	return string(logsBytes), nil
}

// GetContainerStatsRaw bir Docker konteynerinin ham JSON istatistiklerini döndürür
func (s *DockerService) GetContainerStatsRaw(id string) (string, error) {
	// Konteynerin var olup olmadığını kontrol et
	_, err := s.client.ContainerInspect(context.Background(), id)
	if err != nil {
		return "", err
	}

	// İstatistikleri al
	stats, err := s.client.ContainerStats(context.Background(), id, false)
	if err != nil {
		return "", err
	}
	defer stats.Body.Close()

	// Ham JSON'u oku
	statsBytes, err := io.ReadAll(stats.Body)
	if err != nil {
		return "", err
	}

	return string(statsBytes), nil
}

// GetImages tüm Docker imajlarını döndürür
func (s *DockerService) GetImages() ([]image.Summary, error) {
	// İmajları listele
	return s.client.ImageList(context.Background(), image.ListOptions{})
}

// SetContainerMonitored bir konteynerin izlenip izlenmeyeceğini ayarlar
func (s *DockerService) SetContainerMonitored(id string, monitored bool) error {
	// Konteynerin veritabanında var olup olmadığını kontrol et
	var container models.DockerContainer
	if err := s.db.Where("container_id = ?", id).First(&container).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("konteyner veritabanında bulunamadı")
		}
		return err
	}

	// İzlenme durumunu güncelle
	container.Monitored = monitored
	return s.db.Save(&container).Error
}

// GetMonitoredContainers izlenen tüm konteynerleri döndürür
func (s *DockerService) GetMonitoredContainers() ([]models.DockerContainer, error) {
	// Veritabanından izlenen konteynerleri al
	var containers []models.DockerContainer
	if err := s.db.Where("monitored = ?", true).Find(&containers).Error; err != nil {
		return nil, err
	}

	return containers, nil
}

// FindContainersByName isim veya alt dizeye göre konteyner arar
func (s *DockerService) FindContainersByName(name string) ([]models.DockerContainer, error) {
	// Önce konteynerleri senkronize et, böylece veritabanı güncel olur
	if err := s.SyncContainers(); err != nil {
		return nil, err
	}

	// İsmi eşleşen konteynerleri ara
	var containers []models.DockerContainer
	if err := s.db.Where("name LIKE ?", "%"+name+"%").Find(&containers).Error; err != nil {
		return nil, err
	}

	return containers, nil
}

// FindContainersByImage imaj adına göre konteyner arar
func (s *DockerService) FindContainersByImage(image string) ([]models.DockerContainer, error) {
	// Önce konteynerleri senkronize et, böylece veritabanı güncel olur
	if err := s.SyncContainers(); err != nil {
		return nil, err
	}

	// İmajı eşleşen konteynerleri ara
	var containers []models.DockerContainer
	if err := s.db.Where("image LIKE ?", "%"+image+"%").Find(&containers).Error; err != nil {
		return nil, err
	}

	return containers, nil
}

// FindImagesByName isim veya alt dizeye göre imaj arar
func (s *DockerService) FindImagesByName(name string) ([]image.Summary, error) {
	// İmaj adı için filtre oluştur
	imageFilter := filters.NewArgs()
	imageFilter.Add("reference", "*"+name+"*")

	// Filtre ile imajları listele
	return s.client.ImageList(context.Background(), image.ListOptions{
		Filters: imageFilter,
	})
}

// RemoveContainer bir Docker konteynerini kaldırır
func (s *DockerService) RemoveContainer(id string, force bool) error {
	// Konteynerin var olup olmadığını kontrol et
	_, err := s.client.ContainerInspect(context.Background(), id)
	if err != nil {
		return err
	}

	// Konteyneri kaldır
	options := container.RemoveOptions{
		Force:         force,
		RemoveVolumes: false,
	}
	return s.client.ContainerRemove(context.Background(), id, options)
}

// RemoveImage bir Docker imajını kaldırır
func (s *DockerService) RemoveImage(id string, force bool) error {
	// İmajı kaldır
	options := image.RemoveOptions{
		Force:         force,
		PruneChildren: true,
	}
	_, err := s.client.ImageRemove(context.Background(), id, options)
	return err
}
