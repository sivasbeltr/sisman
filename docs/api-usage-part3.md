# SISMAN API Kullanım Rehberi - Bölüm 3

## Servis İzleme

### Tüm Servisleri Listeleme
**Endpoint:** `/service`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "web-server",
      "description": "Nginx web server",
      "type": "nginx",
      "config": "{\"port\": 80}",
      "status": "running",
      "monitored": true
    }
  ]
}
```

---

### Belirli Bir Servisi Görüntüleme
**Endpoint:** `/service/:id`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Service retrieved successfully",
  "data": {
    "id": 1,
    "name": "web-server",
    "description": "Nginx web server",
    "type": "nginx",
    "config": "{\"port\": 80}",
    "status": "running",
    "monitored": true
  }
}
```

---

### Servis Metriklerini Görüntüleme
**Endpoint:** `/service/:id/metrics`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Service metrics retrieved successfully",
  "data": [
    {
      "timestamp": 1672531200,
      "cpuUsage": 15.5,
      "memoryUsage": 512,
      "diskUsage": 1024,
      "networkIn": 2048,
      "networkOut": 4096,
      "responseTime": 120,
      "status": "running"
    }
  ]
}
```

---

### Tarih Aralığına Göre Servis Metriklerini Görüntüleme
**Endpoint:** `/service/:id/metrics`  
**Yöntem:** `GET`  
**Sorgu Parametreleri:**
- `start_time`: Başlangıç zamanı (ISO 8601 formatında)
- `end_time`: Bitiş zamanı (ISO 8601 formatında)

#### Örnek İstek:
```
GET /service/1/metrics?start_time=2023-01-01T00:00:00Z&end_time=2023-12-31T23:59:59Z
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Service metrics retrieved successfully",
  "data": [
    {
      "timestamp": 1672531200,
      "cpuUsage": 15.5,
      "memoryUsage": 512,
      "diskUsage": 1024,
      "networkIn": 2048,
      "networkOut": 4096,
      "responseTime": 120,
      "status": "running"
    }
  ]
}
```

---

### Yeni Servis Oluşturma
**Endpoint:** `/service`  
**Yöntem:** `POST`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "name": "web-server",
  "description": "Nginx web server",
  "type": "nginx",
  "config": "{\"port\": 80}",
  "monitored": true
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Service created successfully",
  "data": {
    "id": 2,
    "name": "web-server",
    "description": "Nginx web server",
    "type": "nginx",
    "config": "{\"port\": 80}",
    "status": "unknown",
    "monitored": true
  }
}
```

---

### Servis Güncelleme
**Endpoint:** `/service/:id`  
**Yöntem:** `PUT`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "description": "Updated Nginx web server",
  "monitored": false
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Service updated successfully",
  "data": {
    "id": 2,
    "name": "web-server",
    "description": "Updated Nginx web server",
    "type": "nginx",
    "config": "{\"port\": 80}",
    "status": "unknown",
    "monitored": false
  }
}
```

---

### Servis Silme
**Endpoint:** `/service/:id`  
**Yöntem:** `DELETE`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Service deleted successfully"
}
```

---

## Komut Yönetimi

### Tüm Komutları Listeleme
**Endpoint:** `/command`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Commands retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "diskUsage",
      "description": "Shows disk usage",
      "command": "df -h {{.path}}",
      "category": "system",
      "enabled": true,
      "parameters": [
        {
          "id": 1,
          "name": "path",
          "label": "Directory Path",
          "type": "string",
          "required": true,
          "defaultValue": "/",
          "validation": "^/[a-zA-Z0-9/]*$",
          "order": 1
        }
      ]
    }
  ]
}
```

---

### Belirli Bir Komutu Görüntüleme
**Endpoint:** `/command/:id`  
**Yöntem:** `GET`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Command retrieved successfully",
  "data": {
    "id": 1,
    "name": "diskUsage",
    "description": "Shows disk usage",
    "command": "df -h {{.path}}",
    "category": "system",
    "enabled": true,
    "parameters": [
      {
        "id": 1,
        "name": "path",
        "label": "Directory Path",
        "type": "string",
        "required": true,
        "defaultValue": "/",
        "validation": "^/[a-zA-Z0-9/]*$",
        "order": 1
      }
    ]
  }
}
```

---

### Yeni Komut Oluşturma
**Endpoint:** `/command`  
**Yöntem:** `POST`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "name": "diskUsage",
  "description": "Shows disk usage",
  "command": "df -h {{.path}}",
  "category": "system",
  "enabled": true,
  "parameters": [
    {
      "name": "path",
      "label": "Directory Path",
      "type": "string",
      "required": true,
      "defaultValue": "/",
      "validation": "^/[a-zA-Z0-9/]*$",
      "order": 1
    }
  ]
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Command created successfully",
  "data": {
    "id": 2,
    "name": "diskUsage",
    "description": "Shows disk usage",
    "command": "df -h {{.path}}",
    "category": "system",
    "enabled": true,
    "parameters": [
      {
        "id": 2,
        "name": "path",
        "label": "Directory Path",
        "type": "string",
        "required": true,
        "defaultValue": "/",
        "validation": "^/[a-zA-Z0-9/]*$",
        "order": 1
      }
    ]
  }
}
```

---

### Komut Güncelleme
**Endpoint:** `/command/:id`  
**Yöntem:** `PUT`  
**Yetki:** Admin

#### İstek Gövdesi:
```json
{
  "description": "Updated disk usage command",
  "enabled": false,
  "parameters": [
    {
      "id": 1,
      "name": "path",
      "label": "Directory Path",
      "type": "string",
      "required": true,
      "defaultValue": "/home",
      "validation": "^/[a-zA-Z0-9/]*$",
      "order": 1
    },
    {
      "name": "human",
      "label": "Human Readable Format",
      "type": "boolean",
      "required": false,
      "defaultValue": "true",
      "order": 2
    }
  ]
}
```

#### Yanıt:
```json
{
  "error": false,
  "message": "Command updated successfully",
  "data": {
    "id": 2,
    "name": "diskUsage",
    "description": "Updated disk usage command",
    "command": "df -h {{.path}}",
    "category": "system",
    "enabled": false,
    "parameters": [
      {
        "id": 1,
        "name": "path",
        "label": "Directory Path",
        "type": "string",
        "required": true,
        "defaultValue": "/home",
        "validation": "^/[a-zA-Z0-9/]*$",
        "order": 1
      },
      {
        "id": 2,
        "name": "human",
        "label": "Human Readable Format",
        "type": "boolean",
        "required": false,
        "defaultValue": "true",
        "order": 2
      }
    ]
  }
}
```

---

### Komut Silme
**Endpoint:** `/command/:id`  
**Yöntem:** `DELETE`  
**Yetki:** Admin

#### Yanıt:
```json
{
  "error": false,
  "message": "Command deleted successfully"
}
```
