# SISMAN API Kullanım Rehberi - Bölüm 1

## Genel Bilgiler

### API URL
Tüm API istekleri aşağıdaki temel URL üzerinden yapılır:
```
http://localhost:8080/api/v1/sisman
```

### Kimlik Doğrulama
SISMAN API, Bearer Token yöntemiyle kimlik doğrulama yapar. Tüm korumalı endpoint'lere erişim için `Authorization` başlığına bir JWT token eklenmelidir:
```
Authorization: Bearer <token>
```

Token, `/auth/login` endpoint'inden alınır ve `/auth/refresh` ile yenilenebilir.

### İstek ve Yanıt Formatları
- **İstek Formatı:** JSON
- **Yanıt Formatı:** JSON
- **Başlıklar:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (korumalı endpoint'ler için)

### Hata Kodları
| HTTP Kod | Açıklama             |
| -------- | -------------------- |
| 200      | Başarılı             |
| 201      | Kaynak oluşturuldu   |
| 400      | Geçersiz istek       |
| 401      | Yetkilendirme hatası |
| 403      | Erişim reddedildi    |
| 404      | Kaynak bulunamadı    |
| 500      | Sunucu hatası        |

---

## Kimlik Doğrulama İşlemleri

### Giriş Yapma
**Endpoint:** `/auth/login`  
**Yöntem:** `POST`

#### İstek Gövdesi:
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "expires_in": 86400
  }
}
```

---

### Token Yenileme
**Endpoint:** `/auth/refresh`  
**Yöntem:** `POST`

#### İstek Gövdesi:
```json
{
  "token": "<jwt_token>"
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Token refreshed successfully",
  "data": {
    "token": "<new_jwt_token>",
    "expires_in": 86400
  }
}
```

---

## Kullanıcı Yönetimi

### Tüm Kullanıcıları Listeleme
**Endpoint:** `/user`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["admin", "user"],
      "active": true
    }
  ]
}
```

---

### Belirli Bir Kullanıcıyı Görüntüleme
**Endpoint:** `/user/:id`  
**Yöntem:** `GET`  
**Yetki:** Admin veya kullanıcı kendi bilgilerini görüntüleyebilir.

#### Yanıt:
```json
{
  "error": false,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["admin", "user"],
    "active": true
  }
}
```

---

### Yeni Kullanıcı Oluşturma
**Endpoint:** `/user`  
**Yöntem:** `POST`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "username": "newuser",
  "password": "Password123!",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "roles": ["user"]
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "firstName": "New",
    "lastName": "User",
    "roles": ["user"],
    "active": true
  }
}
```

---

### Kullanıcı Güncelleme
**Endpoint:** `/user/:id`  
**Yöntem:** `PUT`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "email": "updateduser@example.com",
  "firstName": "Updated",
  "lastName": "User",
  "active": true,
  "roles": ["admin", "user"]
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "updateduser@example.com",
    "firstName": "Updated",
    "lastName": "User",
    "roles": ["admin", "user"],
    "active": true
  }
}
```

---

### Kullanıcı Silme
**Endpoint:** `/user/:id`  
**Yöntem:** `DELETE`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "User deleted successfully"
}
```

---

### Kullanıcı Aktivitelerini Görüntüleme
**Endpoint:** `/user/:id/activities`  
**Yöntem:** `GET`  
**Yetki:** Admin veya kullanıcı kendi aktivitelerini görüntüleyebilir.

#### Yanıt:
```json
{
  "error": false,
  "message": "User activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "activityType": "login",
      "description": "User logged in",
      "timestamp": "2023-01-01T12:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  ],
    "meta": {
	    "total":  1000,
		"limit":  10,
		"offset": 10,
	},
}
```
