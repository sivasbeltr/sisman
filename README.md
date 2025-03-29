# SISMAN - Sistem Yönetim Uygulaması

SISMAN, organizasyon içerisindeki uygulama servislerini gözlemlemek, güvenli bir şekilde belirli komutları çalıştırmak ve altyapı yönetimi (örneğin, Nginx yapılandırmaları ve alt alan adı yönetimi) gibi işlemleri gerçekleştirmek için geliştirilmiş bir sistem yönetim uygulamasıdır.

## Özellikler
1. **Servis İzleme**
   - Gerçek zamanlı servis durumu izleme
   - Servis metrikleri (CPU, bellek kullanımı vb.)
   - Geçmiş performans grafikleri

2. **Komut Yönetimi**
   - Güvenli komut çalıştırma
   - Dinamik komut parametreleri oluşturma
   - Komut sonuçlarını görüntüleme

3. **Nginx Yapılandırması**
   - Alt alan adı yönetimi
   - Sunucu blok yapılandırması
   - SSL sertifika yönetimi

4. **Docker Konteyner İzleme**
   - Gerçek zamanlı konteyner izleme
   - Konteyner başlatma/durdurma işlemleri
   - Konteyner loglarını görüntüleme
   - Konteyner kaynak kullanım istatistikleri
   - Görüntü yönetimi

5. **Kullanıcı Yönetimi**
   - Rol tabanlı erişim kontrolü
   - Kullanıcı aktivite izleme

## Teknoloji Yığını
### Backend
- **Dil:** Go
- **Framework:** Fiber
- **ORM:** GORM
- **Veritabanı:** SQLite

### Frontend
- **Araçlar:** Vite, React, Tailwind CSS
- **Grafikler:** Chart.js
- **İkonlar:** Hero Icons
- **HTTP İstemcisi:** Axios

## Mimarisi
- **SPA (Single Page Application):** Ön uç ve arka uç bağımsız çalışır.
- **Mobil Uyumluluk:** Tüm cihazlarda duyarlı tasarım.
- **Tema Desteği:** Açık/Koyu tema seçeneği.

## API Yapısı
- **Servis İzleme:** `/api/v1/sisman/service`
- **Komut Yönetimi:** `/api/v1/sisman/command`
- **Nginx Yapılandırması:** `/api/v1/sisman/nginx`
- **Docker İzleme:** `/api/v1/sisman/docker`
- **Kullanıcı Yönetimi:** `/api/v1/sisman/user`

## Kurulum
### Gereksinimler
- Go 1.19 veya üzeri
- Node.js 16 veya üzeri
- SQLite

### Backend Kurulumu
1. Gerekli bağımlılıkları yükleyin:
   ```bash
   go mod tidy
   ```
2. `.env` dosyasını oluşturun ve gerekli ayarları yapın:
   ```env
   PORT=8080
   DB_PATH=sisman.db
   JWT_SECRET=your-secret-key
   ```
3. Backend'i başlatın:
   ```bash
   go run cmd/api/main.go
   ```

### Frontend Kurulumu
1. Gerekli bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Frontend'i başlatın:
   ```bash
   npm run dev
   ```

## Kullanım
- **Backend:** `http://localhost:8080`
- **Frontend:** `http://localhost:5173`

## Katkıda Bulunma
1. Bu repoyu forklayın.
2. Yeni bir dal oluşturun:
   ```bash
   git checkout -b feature/ozellik-adi
   ```
3. Değişikliklerinizi yapın ve commit edin:
   ```bash
   git commit -m "Yeni özellik eklendi"
   ```
4. Dalınızı push edin:
   ```bash
   git push origin feature/ozellik-adi
   ```
5. Bir Pull Request oluşturun.

## Lisans
Bu proje [MIT Lisansı](./LICENSE) ile lisanslanmıştır.
