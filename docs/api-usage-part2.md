# SISMAN API Kullanım Rehberi - Bölüm 2

## Aktivite Kaydı Yönetimi

### Tüm Aktiviteleri Listeleme
**Endpoint:** `/activity`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "activityType": "login",
      "description": "User logged in",
      "timestamp": "2023-01-01T12:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  ]
}
```

---

### Belirli Tipteki Aktiviteleri Listeleme
**Endpoint:** `/activity/type/:type`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "activityType": "login",
      "description": "User logged in",
      "timestamp": "2023-01-01T12:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  ]
}
```

---

### Aktivitelerde Arama Yapma
**Endpoint:** `/activity/search`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Sorgu Parametreleri:
- `q`: Arama yapılacak metin

#### Yanıt:
```json
{
  "error": false,
  "message": "Search results retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "activityType": "login",
      "description": "User logged in",
      "timestamp": "2023-01-01T12:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  ]
}
```

---

### Eski Aktiviteleri Temizleme
**Endpoint:** `/activity/cleanup`  
**Yöntem:** `DELETE`  
**Yetki:** Admin

#### Sorgu Parametreleri:
- `days`: Silinecek aktivitelerin kaç gün öncesine ait olduğu

#### Yanıt:
```json
{
  "error": false,
  "message": "Old activities deleted successfully"
}
```
