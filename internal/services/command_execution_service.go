package services

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"
	"regexp"
	"strings"
	"text/template"

	"github.com/sivasbeltr/sisman/internal/models"
	"gorm.io/gorm"
)

// CommandExecutionService, komutların yürütülmesini yönetir.
type CommandExecutionService struct {
	db *gorm.DB
}

// NewCommandExecutionService yeni bir CommandExecutionService örneği oluşturur.
func NewCommandExecutionService(db *gorm.DB) *CommandExecutionService {
	return &CommandExecutionService{db: db}
}

// ExecuteCommand verilen parametrelerle bir komutu yürütür.
func (s *CommandExecutionService) ExecuteCommand(command *models.Command, params map[string]interface{}) (string, error) {
	// Go'nun template motoru ile bir komut şablonu oluştur.
	cmdTemplate, err := template.New("command").Parse(command.Command)
	if err != nil {
		return "", fmt.Errorf("geçersiz komut şablonu: %w", err)
	}

	// Şablonu parametrelerle uygula.
	var cmdBuffer bytes.Buffer
	if err := cmdTemplate.Execute(&cmdBuffer, params); err != nil {
		return "", fmt.Errorf("parametreler komuta uygulanırken hata oluştu: %w", err)
	}

	// Son komut string'ini al.
	cmdStr := cmdBuffer.String()

	// Güvenlik kontrolü - shell injection'ı önle.
	// Komutta yalnızca belirli karakterlere izin ver.
	if !isCommandSafe(cmdStr) {
		return "", errors.New("potansiyel komut enjeksiyonu tespit edildi")
	}

	// Komutu ve argümanları ayır.
	cmdParts := strings.Fields(cmdStr)
	if len(cmdParts) == 0 {
		return "", errors.New("boş komut")
	}

	// OS komutu oluştur.
	cmd := exec.Command(cmdParts[0], cmdParts[1:]...)

	// stdout ve stderr'ı yakala.
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Komutu yürüt.
	err = cmd.Run()

	// Sonucu işle.
	var result string
	if err != nil {
		if stderr.Len() > 0 {
			return "", fmt.Errorf("komut başarısız: %s", stderr.String())
		}
		return "", fmt.Errorf("komut başarısız: %w", err)
	}

	result = stdout.String()
	if result == "" && stderr.Len() > 0 {
		result = stderr.String() // Bazı komutlar başarı durumunda bile stderr'a çıktı verir.
	}

	return result, nil
}

// LogCommandExecution bir komutun yürütülmesini veritabanına kaydeder.
func (s *CommandExecutionService) LogCommandExecution(
	commandID uint,
	userID uint,
	parameters string,
	status string,
	result string,
	errorMessage string,
	duration int64,
	ipAddress string,
) (*models.CommandExecution, error) {
	// Kayıt oluştur.
	execution := models.CommandExecution{
		CommandID:    commandID,
		UserID:       userID,
		Parameters:   parameters,
		Status:       status,
		Result:       result,
		ErrorMessage: errorMessage,
		Duration:     duration,
		IPAddress:    ipAddress,
	}

	if err := s.db.Create(&execution).Error; err != nil {
		return nil, err
	}

	return &execution, nil
}

// GetCommandExecutions belirli bir komutun yürütme geçmişini alır.
func (s *CommandExecutionService) GetCommandExecutions(commandID uint, limit, offset int) ([]models.CommandExecution, int64, error) {
	var executions []models.CommandExecution
	var count int64

	// Toplam kayıt sayısını al.
	if err := s.db.Model(&models.CommandExecution{}).
		Where("command_id = ?", commandID).
		Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Sayfalandırılmış kayıtları al.
	if err := s.db.Where("command_id = ?", commandID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&executions).Error; err != nil {
		return nil, 0, err
	}

	return executions, count, nil
}

// GetUserCommandExecutions belirli bir kullanıcının komut yürütme geçmişini alır.
func (s *CommandExecutionService) GetUserCommandExecutions(userID uint, limit, offset int) ([]models.CommandExecution, int64, error) {
	var executions []models.CommandExecution
	var count int64

	// Toplam kayıt sayısını al.
	if err := s.db.Model(&models.CommandExecution{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Sayfalandırılmış kayıtları al.
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&executions).Error; err != nil {
		return nil, 0, err
	}

	return executions, count, nil
}

// isCommandSafe bir komut dizesinin yürütülmesinin güvenli olup olmadığını kontrol eder.
// Bu basit bir uygulamadır ve üretim için geliştirilmesi gerekebilir.
func isCommandSafe(cmd string) bool {
	// Komut zincirleme için kullanılabilecek karakterlere izin verme.
	dangerousChars := []string{";", "&&", "||", "|", ">", "<", "$", "`", "\\"}
	for _, char := range dangerousChars {
		if strings.Contains(cmd, char) {
			return false
		}
	}

	// Yalnızca alfanümerik karakterlere, boşluğa, tireye, alt çizgiye, noktaya, eğik çizgiye ve bazı diğer güvenli karakterlere izin ver.
	safePattern := `^[a-zA-Z0-9\s\-_\./,:"'=+]+$`
	matched, _ := regexp.MatchString(safePattern, cmd)
	return matched
}
