package handlers

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/docker/docker/api/types/image"
	"github.com/gofiber/fiber/v2"
	"github.com/sivasbeltr/sisman/internal/services"
	"gorm.io/gorm"
)

// GetAllContainers returns all Docker containers
func GetAllContainers(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Sorgu parametreleri ile filtreleme
		nameFilter := c.Query("name")
		imageFilter := c.Query("image")

		// Docker servisini oluştur
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		var containers interface{}
		var fetchErr error

		// Sağlanan filtreleri uygula
		if nameFilter != "" {
			containers, fetchErr = dockerService.FindContainersByName(nameFilter)
		} else if imageFilter != "" {
			containers, fetchErr = dockerService.FindContainersByImage(imageFilter)
		} else {
			containers, fetchErr = dockerService.GetAllContainers()
		}

		if fetchErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteynerler alınırken hata oluştu: " + fetchErr.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteynerler başarıyla alındı",
			"data":    containers,
		})
	}
}

// GetContainer returns a specific Docker container by ID
func GetContainer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner ID'si gerekli",
			})
		}

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		container, err := dockerService.GetContainerByID(id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner bulunamadı: " + err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteyner başarıyla alındı",
			"data":    container,
		})
	}
}

// StartContainer starts a Docker container
func StartContainer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner ID'si gerekli",
			})
		}

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		// Start container
		if err := dockerService.StartContainer(id); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner başlatılırken hata oluştu: " + err.Error(),
			})
		}

		// Log the activity
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "docker_start_container", "Container started: "+id, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteyner başarıyla başlatıldı",
		})
	}
}

// StopContainer stops a Docker container
func StopContainer(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner ID'si gerekli",
			})
		}

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		// Stop container
		if err := dockerService.StopContainer(id); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner durdurulurken hata oluştu: " + err.Error(),
			})
		}

		// Log the activity
		activityService := services.NewActivityService(db)
		userID := c.Locals("userId").(uint)
		activityService.LogActivity(userID, "docker_stop_container", "Container stopped: "+id, c.IP(), c.Get("User-Agent"))

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteyner başarıyla durduruldu",
		})
	}
}

// GetContainerLogs returns the logs of a Docker container
func GetContainerLogs(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner ID'si gerekli",
			})
		}

		// Parse query parameters
		tailParam := c.Query("tail", "100")
		tail, err := strconv.Atoi(tailParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Geçersiz tail parametresi, bir sayı olmalı",
			})
		}

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		// Get logs
		logs, err := dockerService.GetContainerLogs(id, tail)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner logları alınırken hata oluştu: " + err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteyner logları başarıyla alındı",
			"data":    logs,
		})
	}
}

// GetContainerStats returns the stats of a Docker container using raw JSON
func GetContainerStats(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner ID'si gerekli",
			})
		}

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		// Get raw stats
		statsJSON, err := dockerService.GetContainerStatsRaw(id)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner istatistikleri alınırken hata oluştu: " + err.Error(),
			})
		}

		// Parse raw JSON into a map for processing
		var stats map[string]interface{}
		if err := json.Unmarshal([]byte(statsJSON), &stats); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Konteyner istatistikleri alınırken hata oluştu: " + err.Error(),
			})
		}

		// Format stats for easier consumption
		formattedStats := fiber.Map{
			"cpu_usage":      calculateCPUPercentage(stats),
			"memory_usage":   getMemoryUsage(stats),
			"memory_limit":   getMemoryLimit(stats),
			"memory_max":     getMemoryMax(stats),
			"memory_percent": calculateMemoryPercentage(stats),
			"network_rx":     getNetworkRx(stats),
			"network_tx":     getNetworkTx(stats),
			"block_read":     getBlockIORead(stats),
			"block_write":    getBlockIOWrite(stats, "write"),
			"pids":           getPids(stats),
			"timestamp":      getTimestamp(stats),
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Konteyner istatistikleri başarıyla alındı",
			"data":    formattedStats,
		})
	}
}

// Helper functions adapted for raw JSON (map[string]interface{})

// calculateCPUPercentage calculates the CPU usage percentage from raw stats
func calculateCPUPercentage(stats map[string]interface{}) float64 {
	cpuStats, ok := stats["cpu_stats"].(map[string]interface{})
	if !ok {
		return 0.0
	}
	preCPUStats, ok := stats["precpu_stats"].(map[string]interface{})
	if !ok {
		return 0.0
	}

	cpuUsage, ok := cpuStats["cpu_usage"].(map[string]interface{})
	if !ok {
		return 0.0
	}
	preCPUUsage, ok := preCPUStats["cpu_usage"].(map[string]interface{})
	if !ok {
		return 0.0
	}

	totalUsage, _ := cpuUsage["total_usage"].(float64)
	preTotalUsage, _ := preCPUUsage["total_usage"].(float64)
	systemUsage, _ := cpuStats["system_cpu_usage"].(float64)
	preSystemUsage, _ := preCPUStats["system_cpu_usage"].(float64)
	percpuUsage, ok := cpuUsage["percpu_usage"].([]interface{})
	if !ok {
		return 0.0
	}

	cpuDelta := totalUsage - preTotalUsage
	systemDelta := systemUsage - preSystemUsage

	if systemDelta > 0.0 && cpuDelta > 0.0 {
		return (cpuDelta / systemDelta) * float64(len(percpuUsage)) * 100.0
	}
	return 0.0
}

// calculateMemoryPercentage calculates the memory usage percentage from raw stats
func calculateMemoryPercentage(stats map[string]interface{}) float64 {
	memoryStats, ok := stats["memory_stats"].(map[string]interface{})
	if !ok {
		return 0.0
	}

	usage, _ := memoryStats["usage"].(float64)
	limit, _ := memoryStats["limit"].(float64)

	if limit > 0 {
		return (usage / limit) * 100.0
	}
	return 0.0
}

// getMemoryUsage extracts memory usage from raw stats
func getMemoryUsage(stats map[string]interface{}) uint64 {
	memoryStats, ok := stats["memory_stats"].(map[string]interface{})
	if !ok {
		return 0
	}
	usage, _ := memoryStats["usage"].(float64)
	return uint64(usage)
}

// getMemoryLimit extracts memory limit from raw stats
func getMemoryLimit(stats map[string]interface{}) uint64 {
	memoryStats, ok := stats["memory_stats"].(map[string]interface{})
	if !ok {
		return 0
	}
	limit, _ := memoryStats["limit"].(float64)
	return uint64(limit)
}

// getMemoryMax extracts max memory usage from raw stats
func getMemoryMax(stats map[string]interface{}) uint64 {
	memoryStats, ok := stats["memory_stats"].(map[string]interface{})
	if !ok {
		return 0
	}
	maxUsage, _ := memoryStats["max_usage"].(float64)
	return uint64(maxUsage)
}

// getNetworkRx returns the total received network bytes from raw stats
func getNetworkRx(stats map[string]interface{}) uint64 {
	networks, ok := stats["networks"].(map[string]interface{})
	if !ok {
		return 0
	}

	var rx uint64
	for _, net := range networks {
		network, ok := net.(map[string]interface{})
		if !ok {
			continue
		}
		rxBytes, _ := network["rx_bytes"].(float64)
		rx += uint64(rxBytes)
	}
	return rx
}

// getNetworkTx returns the total transmitted network bytes from raw stats
func getNetworkTx(stats map[string]interface{}) uint64 {
	networks, ok := stats["networks"].(map[string]interface{})
	if !ok {
		return 0
	}

	var tx uint64
	for _, net := range networks {
		network, ok := net.(map[string]interface{})
		if !ok {
			continue
		}
		txBytes, _ := network["tx_bytes"].(float64)
		tx += uint64(txBytes)
	}
	return tx
}

// getBlockIO returns the block IO stats for read or write from raw stats
func getBlockIORead(stats map[string]interface{}) uint64 {
	networks, ok := stats["networks"].(map[string]interface{})
	if !ok {
		return 0
	}

	var tx uint64
	for _, net := range networks {
		network, ok := net.(map[string]interface{})
		if !ok {
			continue
		}
		txBytes, _ := network["tx_bytes"].(float64)
		tx += uint64(txBytes)
	}
	return tx
}

// getBlockIO returns the block IO stats for read or write from raw stats
func getBlockIOWrite(stats map[string]interface{}, op string) uint64 {
	blkioStats, ok := stats["blkio_stats"].(map[string]interface{})
	if !ok {
		return 0
	}
	ioServiceBytes, ok := blkioStats["io_service_bytes_recursive"].([]interface{})
	if !ok {
		return 0
	}

	var total uint64
	for _, stat := range ioServiceBytes {
		s, ok := stat.(map[string]interface{})
		if !ok {
			continue
		}
		opType, _ := s["op"].(string)
		value, _ := s["value"].(float64)
		if (op == "read" && opType == "Read") || (op == "write" && opType == "Write") {
			total += uint64(value)
		}
	}
	return total
}

// getPids extracts the current number of PIDs from raw stats
func getPids(stats map[string]interface{}) uint64 {
	pidsStats, ok := stats["pids_stats"].(map[string]interface{})
	if !ok {
		return 0
	}
	current, _ := pidsStats["current"].(float64)
	return uint64(current)
}

// getTimestamp extracts the timestamp from raw stats
func getTimestamp(stats map[string]interface{}) time.Time {
	readStr, _ := stats["read"].(string)
	t, _ := time.Parse(time.RFC3339Nano, readStr)
	return t
}

// GetAllImages remains unchanged as it doesn't rely on StatsJSON
func GetAllImages(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Query parameters for filtering
		nameFilter := c.Query("name")

		// Create Docker service
		dockerService, err := services.NewDockerService(db)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Docker servisi başlatılırken hata oluştu: " + err.Error(),
			})
		}
		defer dockerService.Close()

		var images []image.Summary
		var fetchErr error

		// Apply filters if provided
		if nameFilter != "" {
			images, fetchErr = dockerService.FindImagesByName(nameFilter)
		} else {
			images, fetchErr = dockerService.GetImages()
		}

		if fetchErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Görüntüler alınırken hata oluştu: " + fetchErr.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Görüntüler başarıyla alındı",
			"data":    images,
		})
	}
}
