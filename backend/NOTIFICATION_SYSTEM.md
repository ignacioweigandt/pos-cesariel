# Sistema de Notificaciones - POS Cesariel

Sistema completo de notificaciones automáticas para el POS Cesariel, que incluye alertas de stock bajo, reportes diarios de ventas y recordatorios de respaldo.

## 📋 Características

### Tipos de Notificaciones

1. **Alertas de Stock Bajo** (`low_stock`)
   - Verificación automática cada hora
   - Umbral configurable por usuario
   - Prioridad HIGH para stock crítico (≤5 unidades)
   - Prioridad MEDIUM para stock bajo

2. **Reporte Diario de Ventas** (`daily_sales_report`)
   - Generación automática diaria a las 18:00
   - Resumen de ventas, montos totales y productos vendidos
   - Filtrado por sucursal del usuario
   - Expira automáticamente después de 7 días

3. **Recordatorio de Respaldo** (`backup_reminder`)
   - Frecuencias: diaria, semanal, mensual
   - Configurable por usuario
   - Día específico para recordatorios semanales/mensuales

4. **Notificaciones del Sistema** (`system_alert`)
   - Alertas generadas por el sistema

5. **Notificaciones Personalizadas** (`custom`)
   - Creadas manualmente por administradores

### Niveles de Prioridad

- `URGENT`: Notificaciones críticas
- `HIGH`: Alta prioridad
- `MEDIUM`: Prioridad media (por defecto)
- `LOW`: Baja prioridad

## 🏗️ Arquitectura

### Estructura de Archivos

```
backend/
├── app/
│   ├── models/
│   │   └── notification.py          # Modelos Notification y NotificationSetting
│   ├── schemas/
│   │   └── notification.py          # Schemas Pydantic
│   ├── repositories/
│   │   └── notification.py          # Acceso a datos
│   └── services/
│       └── notification_service.py  # Lógica de negocio
├── routers/
│   └── notifications.py             # Endpoints API
├── notification_scheduler.py        # Tareas programadas
└── migrate_notifications.py         # Script de migración
```

### Modelos de Base de Datos

#### Notification
```python
- id: int
- type: NotificationType
- priority: NotificationPriority
- title: str (max 200)
- message: str
- data: JSON (opcional)
- is_read: bool
- is_active: bool
- user_id: int (FK)
- branch_id: int (FK, opcional)
- created_at: datetime
- read_at: datetime (opcional)
- expires_at: datetime (opcional)
```

#### NotificationSetting
```python
- id: int
- user_id: int (FK, unique)
- low_stock_enabled: bool
- low_stock_threshold: int (default: 10)
- daily_sales_enabled: bool
- daily_sales_time: str (HH:MM)
- backup_reminder_enabled: bool
- backup_reminder_frequency: str
- backup_reminder_day: int
- enabled: bool
- email_notifications: bool
- created_at: datetime
- updated_at: datetime
```

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración

```bash
# Dentro del contenedor backend
make shell-backend
python migrate_notifications.py
```

Esto creará:
- Tablas `notifications` y `notification_settings`
- Configuración por defecto para todos los usuarios existentes

### 2. Iniciar el Scheduler (Opcional)

El scheduler ejecuta tareas programadas para generar notificaciones automáticamente:

```bash
# En producción
python notification_scheduler.py

# O como servicio de fondo
nohup python notification_scheduler.py > scheduler.log 2>&1 &
```

**Tareas programadas:**
- Verificación de stock bajo: cada hora
- Reporte diario: todos los días a las 18:00
- Recordatorios de respaldo diarios: todos los días a las 09:00
- Recordatorios de respaldo semanales: lunes a las 09:00
- Limpieza de notificaciones antiguas: domingos a las 03:00

### 3. Verificar Instalación

```python
# En Python shell
from database import get_db
from app.services.notification_service import NotificationService

db = next(get_db())
service = NotificationService(db)

# Verificar configuración de un usuario
settings = service.get_user_settings(user_id=1)
print(settings)
```

## 📡 API Endpoints

### Obtener Notificaciones del Usuario

```http
GET /notifications?skip=0&limit=50&is_read=false
Authorization: Bearer {token}
```

### Obtener Estadísticas

```http
GET /notifications/stats
Authorization: Bearer {token}
```

Respuesta:
```json
{
  "total": 25,
  "unread": 5,
  "by_type": {
    "low_stock": 3,
    "daily_sales_report": 2
  },
  "by_priority": {
    "high": 3,
    "medium": 2
  }
}
```

### Marcar como Leída

```http
PATCH /notifications/{id}/mark-read
Authorization: Bearer {token}
```

### Marcar Todas como Leídas

```http
POST /notifications/mark-all-read
Authorization: Bearer {token}
```

### Configuración de Notificaciones

```http
GET /notifications/settings/my-settings
Authorization: Bearer {token}
```

```http
PUT /notifications/settings/my-settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "low_stock_enabled": true,
  "low_stock_threshold": 15,
  "daily_sales_enabled": true,
  "daily_sales_time": "18:00",
  "backup_reminder_enabled": true,
  "backup_reminder_frequency": "weekly",
  "backup_reminder_day": 1
}
```

### Endpoints Administrativos (Solo ADMIN)

#### Trigger Manual de Verificación de Stock Bajo
```http
POST /notifications/admin/trigger-low-stock-check
Authorization: Bearer {admin_token}
```

#### Trigger Manual de Reporte Diario
```http
POST /notifications/admin/trigger-daily-sales-report
Authorization: Bearer {admin_token}
```

#### Trigger Manual de Recordatorio de Respaldo
```http
POST /notifications/admin/trigger-backup-reminder?frequency=weekly
Authorization: Bearer {admin_token}
```

#### Limpiar Notificaciones Antiguas
```http
POST /notifications/admin/cleanup-old?days=30
Authorization: Bearer {admin_token}
```

## 💻 Uso Programático

### Crear Notificación Personalizada

```python
from app.services.notification_service import NotificationService
from app.models.notification import NotificationPriority

service = NotificationService(db)

notification = service.create_custom_notification(
    user_id=1,
    title="Título de la notificación",
    message="Mensaje detallado de la notificación",
    priority=NotificationPriority.HIGH,
    branch_id=1,  # opcional
    data={"key": "value"},  # opcional
    expires_in_days=7  # opcional
)
```

### Obtener Notificaciones de un Usuario

```python
# Obtener todas las notificaciones
notifications = service.get_user_notifications(user_id=1, skip=0, limit=50)

# Solo no leídas
unread = service.get_user_notifications(user_id=1, is_read=False)

# Contar no leídas
count = service.get_unread_count(user_id=1)
```

### Actualizar Configuración

```python
from app.schemas.notification import NotificationSettingUpdate

update_data = NotificationSettingUpdate(
    low_stock_threshold=20,
    daily_sales_enabled=True
)

settings = service.update_user_settings(user_id=1, settings_data=update_data)
```

## 🔧 Mantenimiento

### Limpieza Automática

El scheduler ejecuta las siguientes tareas de limpieza:

- **Notificaciones expiradas**: Se desactivan cada 6 horas
- **Notificaciones antiguas**: Se eliminan (soft delete) semanalmente si tienen más de 30 días y están leídas

### Limpieza Manual

```python
service = NotificationService(db)

# Limpiar notificaciones antiguas (30 días por defecto)
count = service.cleanup_old_notifications(days=30)

# Desactivar notificaciones expiradas
count = service.deactivate_expired_notifications()
```

## 🎯 Mejores Prácticas

1. **Configurar el Scheduler**: Para producción, ejecutar el scheduler como servicio del sistema (systemd, supervisor, etc.)

2. **Monitorear Logs**: Revisar `scheduler.log` regularmente para detectar errores

3. **Ajustar Umbrales**: Cada usuario puede configurar su propio umbral de stock bajo

4. **Personalizar Horarios**: Los horarios de reportes son configurables por usuario

5. **Limpiar Regularmente**: Las notificaciones antiguas se acumulan, asegurar que la limpieza automática esté activa

## 🐛 Troubleshooting

### Las notificaciones no se crean automáticamente
- Verificar que el scheduler esté corriendo: `ps aux | grep notification_scheduler`
- Revisar logs del scheduler: `tail -f scheduler.log`
- Verificar configuración del usuario: `GET /notifications/settings/my-settings`

### Las notificaciones no aparecen para un usuario
- Verificar que `enabled = true` en la configuración
- Verificar el tipo específico de notificación esté habilitado
- Verificar que el usuario tenga `is_active = true`

### Error al ejecutar migración
- Verificar conexión a la base de datos
- Asegurar que las tablas relacionadas (users, branches) existan
- Verificar permisos del usuario de base de datos

## 📊 Estadísticas y Métricas

El sistema provee estadísticas completas sobre notificaciones:

```python
stats = service.get_notification_stats(user_id=1)
# {
#   "total": 25,
#   "unread": 5,
#   "by_type": {"low_stock": 10, "daily_sales_report": 15},
#   "by_priority": {"high": 5, "medium": 15, "low": 5}
# }

# Resumen completo con notificaciones recientes
summary = service.get_notification_summary(user_id=1)
```

## 🔐 Seguridad y Permisos

- Usuarios solo pueden ver sus propias notificaciones
- Solo ADMIN puede ejecutar endpoints administrativos
- Notificaciones por sucursal filtradas automáticamente
- Autenticación JWT requerida para todos los endpoints

## 📝 Notas de Implementación

- Las notificaciones usan **soft delete** (is_active=False)
- El campo `data` es JSON flexible para información adicional
- Las fechas de expiración son opcionales
- Los recordatorios evitan duplicados dentro de 12 horas
- Las alertas de stock bajo evitan duplicados dentro de 24 horas

## 🚀 Próximas Mejoras

- [ ] Notificaciones por email
- [ ] Notificaciones push (WebSockets en tiempo real)
- [ ] Plantillas de notificaciones personalizables
- [ ] Historial de notificaciones enviadas
- [ ] Estadísticas avanzadas y dashboards
- [ ] Integración con sistema de auditoría
