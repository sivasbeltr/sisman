package utils

import (
	"crypto/rand"
	"encoding/base64"
	"io"
	"strings"
	"unicode"
)

// GenerateRandomToken belirtilen bayt uzunluğunda güvenli bir rastgele token oluşturur
func GenerateRandomToken(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// SanitizeInput kullanıcı girdisi için temel temizleme işlemi sağlar
func SanitizeInput(input string) string {
	// Kontrol karakterlerini, sekmeleri ve yeni satırları kaldır
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, input)
}

// SanitizeFilename bir dosya adını dizin geçişini önlemek için temizler
func SanitizeFilename(filename string) string {
	// Yol bileşenlerini kaldır
	filename = strings.ReplaceAll(filename, "/", "")
	filename = strings.ReplaceAll(filename, "\\", "")
	filename = strings.ReplaceAll(filename, "..", "")

	return filename
}

// LimitReaderSize okuyucudan en fazla maxSize bayt okur
func LimitReaderSize(r io.Reader, maxSize int64) ([]byte, error) {
	limitReader := io.LimitReader(r, maxSize)
	return io.ReadAll(limitReader)
}

// ValidatePassword bir şifrenin güvenlik gereksinimlerini karşılayıp karşılamadığını kontrol eder
func ValidatePassword(password string) (bool, string) {
	if len(password) < 8 {
		return false, "Şifre en az 8 karakter uzunluğunda olmalıdır"
	}

	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return false, "Şifre en az bir büyük harf içermelidir"
	}
	if !hasLower {
		return false, "Şifre en az bir küçük harf içermelidir"
	}
	if !hasDigit {
		return false, "Şifre en az bir rakam içermelidir"
	}
	if !hasSpecial {
		return false, "Şifre en az bir özel karakter içermelidir"
	}

	return true, ""
}
