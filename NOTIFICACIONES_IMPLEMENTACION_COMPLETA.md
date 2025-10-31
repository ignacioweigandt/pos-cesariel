# Sistema de Notificaciones - Implementación Completa

## ✅ Resumen Ejecutivo

Se ha implementado un sistema completo de notificaciones para el POS Cesariel que incluye:

### Backend (100% Completado) ✓

#### 1. **Modelos de Base de Datos**
- ✅ `Notification`: Modelo principal de notificaciones con todos los campos necesarios
- ✅ `NotificationSetting`: Configuración personalizable por usuario
- ✅ Relaciones con User y Branch models
- **Ubicación**: `backend/app/models/notification.py`

#### 2. **Schemas Pydantic**
- ✅ 13 schemas de validación completos
- ✅ Validadores personalizados para horarios y frecuencias
- ✅ Schemas para operaciones bulk
- **Ubicación**: `backend/app/schemas/notification.py`

#### 3. **Repository Layer**
- ✅ `NotificationRepository` con 15+ métodos especializados
- ✅ `NotificationSettingRepository` con gestión de configuración
- ✅ Queries optimizadas con paginación y filtros
- **Ubicación**: `backend/app/repositories/notification.py`

#### 4. **Service Layer**
- ✅ `NotificationService` con lógica de negocio completa
- ✅ Generación automática de 3 tipos de notificaciones
- ✅ Métodos de limpieza y mantenimiento
- **Ubicación**: `backend/app/services/notification_service.py`

#### 5. **API Endpoints**
- ✅ 16 endpoints REST completos
- ✅ Endpoints públicos y administrativos
- ✅ Autenticación y autorización por rol
- **Ubicación**: `backend/routers/notifications.py`

#### 6. **Tareas Programadas**
- ✅ Scheduler con 6 tareas automáticas
- ✅ Verificación de stock bajo cada hora
- ✅ Reporte diario a las 18:00
- ✅ Recordatorios de respaldo configurables
- **Ubicación**: `backend/notification_scheduler.py`

#### 7. **Migración de Base de Datos**
- ✅ Script completo de migración
- ✅ Creación automática de configuraciones por defecto
- ✅ Verificación post-migración
- **Ubicación**: `backend/migrate_notifications.py`

#### 8. **Documentación**
- ✅ README completo del sistema
- ✅ Guía de API
- ✅ Ejemplos de uso
- **Ubicación**: `backend/NOTIFICATION_SYSTEM.md`

### Frontend (Parcialmente Completado - 40%)

#### Completado:
- ✅ Servicio API TypeScript completo (`notification-service.ts`)
- ✅ 20+ métodos para interactuar con el backend
- ✅ Utilidades de formateo y visualización

#### Pendiente de Desarrollo:
- ⏳ Componente de lista de notificaciones
- ⏳ Componente de configuración de notificaciones
- ⏳ Componente de badge de notificaciones no leídas
- ⏳ Integración con la interfaz principal

---

## 🚀 Pasos para Completar el Sistema

### Paso 1: Ejecutar Migración de Base de Datos

```bash
# 1. Iniciar servicios
make dev

# 2. Acceder al contenedor backend
make shell-backend

# 3. Ejecutar migración
python migrate_notifications.py

# 4. Verificar que se crearon las tablas
# Deberías ver mensajes de éxito
```

### Paso 2: Iniciar el Scheduler (Opcional pero Recomendado)

```bash
# Dentro del contenedor backend
python notification_scheduler.py

# O en background
nohup python notification_scheduler.py > scheduler.log 2>&1 &
```

### Paso 3: Probar los Endpoints

```bash
# 1. Obtener token de autenticación
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# 2. Obtener notificaciones (usar el token obtenido)
curl -X GET http://localhost:8000/notifications \
  -H "Authorization: Bearer {tu_token}"

# 3. Obtener configuración
curl -X GET http://localhost:8000/notifications/settings/my-settings \
  -H "Authorization: Bearer {tu_token}"

# 4. Trigger manual de verificación de stock bajo
curl -X POST http://localhost:8000/notifications/admin/trigger-low-stock-check \
  -H "Authorization: Bearer {tu_token}"
```

### Paso 4: Completar Frontend (Instrucciones Detalladas)

#### A. Crear Componente de Notificaciones

Crear archivo: `frontend/pos-cesariel/app/components/NotificationCenter.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import notificationService, { Notification } from '@/app/lib/notification-service';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Actualizar cada 2 minutos
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        limit: 10,
        is_read: false
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay notificaciones nuevas
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">
                      {notificationService.getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notificationService.getRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

#### B. Crear Componente de Configuración

Crear archivo: `frontend/pos-cesariel/app/components/NotificationSettings.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import notificationService, { NotificationSettings } from '@/app/lib/notification-service';

export default function NotificationSettingsComponent() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await notificationService.updateSettings({
        low_stock_enabled: settings.low_stock_enabled,
        low_stock_threshold: settings.low_stock_threshold,
        daily_sales_enabled: settings.daily_sales_enabled,
        daily_sales_time: settings.daily_sales_time,
        backup_reminder_enabled: settings.backup_reminder_enabled,
        backup_reminder_frequency: settings.backup_reminder_frequency,
        backup_reminder_day: settings.backup_reminder_day,
        enabled: settings.enabled
      });
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando configuración...</div>;
  }

  if (!settings) {
    return <div>No se pudo cargar la configuración</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Configuración de Notificaciones</h2>

      {/* Habilitar/Deshabilitar todo */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
            className="mr-3 h-4 w-4"
          />
          <span className="font-semibold">Habilitar todas las notificaciones</span>
        </label>
      </div>

      {/* Alertas de Stock Bajo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📦 Alertas de Stock Bajo</h3>
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={settings.low_stock_enabled}
            onChange={(e) => setSettings({...settings, low_stock_enabled: e.target.checked})}
            className="mr-3 h-4 w-4"
          />
          <span>Recibir alertas de stock bajo</span>
        </label>
        {settings.low_stock_enabled && (
          <div className="ml-7">
            <label className="block text-sm mb-2">
              Umbral de stock bajo (unidades):
            </label>
            <input
              type="number"
              value={settings.low_stock_threshold}
              onChange={(e) => setSettings({...settings, low_stock_threshold: parseInt(e.target.value)})}
              min="1"
              max="1000"
              className="border rounded px-3 py-2 w-32"
            />
          </div>
        )}
      </div>

      {/* Reporte Diario */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">📊 Reporte Diario de Ventas</h3>
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={settings.daily_sales_enabled}
            onChange={(e) => setSettings({...settings, daily_sales_enabled: e.target.checked})}
            className="mr-3 h-4 w-4"
          />
          <span>Recibir reporte diario de ventas</span>
        </label>
        {settings.daily_sales_enabled && (
          <div className="ml-7">
            <label className="block text-sm mb-2">
              Hora de envío:
            </label>
            <input
              type="time"
              value={settings.daily_sales_time}
              onChange={(e) => setSettings({...settings, daily_sales_time: e.target.value})}
              className="border rounded px-3 py-2"
            />
          </div>
        )}
      </div>

      {/* Recordatorio de Respaldo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">💾 Recordatorio de Respaldo</h3>
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={settings.backup_reminder_enabled}
            onChange={(e) => setSettings({...settings, backup_reminder_enabled: e.target.checked})}
            className="mr-3 h-4 w-4"
          />
          <span>Recibir recordatorios de respaldo</span>
        </label>
        {settings.backup_reminder_enabled && (
          <div className="ml-7 space-y-3">
            <div>
              <label className="block text-sm mb-2">Frecuencia:</label>
              <select
                value={settings.backup_reminder_frequency}
                onChange={(e) => setSettings({
                  ...settings,
                  backup_reminder_frequency: e.target.value as any
                })}
                className="border rounded px-3 py-2"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">
                {settings.backup_reminder_frequency === 'weekly'
                  ? 'Día de la semana (1=Lunes, 7=Domingo):'
                  : 'Día del mes:'}
              </label>
              <input
                type="number"
                value={settings.backup_reminder_day}
                onChange={(e) => setSettings({...settings, backup_reminder_day: parseInt(e.target.value)})}
                min="1"
                max={settings.backup_reminder_frequency === 'weekly' ? '7' : '31'}
                className="border rounded px-3 py-2 w-32"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  );
}
```

#### C. Integrar en el Layout Principal

Agregar en `frontend/pos-cesariel/app/layout.tsx` o en el navbar:

```typescript
import NotificationCenter from './components/NotificationCenter';

// En el navbar:
<div className="flex items-center space-x-4">
  <NotificationCenter />
  {/* otros elementos del navbar */}
</div>
```

#### D. Crear Página de Configuración

Crear archivo: `frontend/pos-cesariel/app/configuracion/notificaciones/page.tsx`

```typescript
import NotificationSettingsComponent from '@/app/components/NotificationSettings';

export default function NotificacionesPage() {
  return (
    <div className="container mx-auto p-6">
      <NotificationSettingsComponent />
    </div>
  );
}
```

---

## 📊 Endpoints Disponibles

### Públicos (requieren autenticación)
- `GET /notifications` - Listar notificaciones
- `GET /notifications/stats` - Estadísticas
- `GET /notifications/summary` - Resumen completo
- `GET /notifications/unread-count` - Contador de no leídas
- `GET /notifications/{id}` - Obtener notificación específica
- `PATCH /notifications/{id}/mark-read` - Marcar como leída
- `POST /notifications/mark-all-read` - Marcar todas como leídas
- `POST /notifications/mark-multiple-read` - Marcar múltiples como leídas
- `DELETE /notifications/{id}` - Eliminar notificación
- `POST /notifications/bulk-delete` - Eliminar múltiples
- `GET /notifications/settings/my-settings` - Obtener configuración
- `PUT /notifications/settings/my-settings` - Actualizar configuración

### Administrativos (requieren rol ADMIN)
- `POST /notifications/admin/trigger-low-stock-check` - Verificar stock manualmente
- `POST /notifications/admin/trigger-daily-sales-report` - Generar reporte manual
- `POST /notifications/admin/trigger-backup-reminder` - Generar recordatorio manual
- `POST /notifications/admin/cleanup-old` - Limpiar notificaciones antiguas
- `POST /notifications/admin/deactivate-expired` - Desactivar expiradas

---

## 🔧 Configuración del Scheduler

Para ejecutar el scheduler en producción con systemd:

1. Crear archivo: `/etc/systemd/system/pos-notification-scheduler.service`

```ini
[Unit]
Description=POS Cesariel Notification Scheduler
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/pos-cesariel/backend
ExecStart=/usr/bin/python3 /path/to/pos-cesariel/backend/notification_scheduler.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. Habilitar e iniciar:
```bash
sudo systemctl enable pos-notification-scheduler
sudo systemctl start pos-notification-scheduler
sudo systemctl status pos-notification-scheduler
```

---

## 📝 Notas Finales

1. **Seguridad**: Todos los endpoints están protegidos con autenticación JWT
2. **Performance**: Las queries están optimizadas con índices en la BD
3. **Escalabilidad**: El sistema soporta múltiples usuarios y sucursales
4. **Mantenimiento**: Limpieza automática de notificaciones antiguas
5. **Flexibilidad**: Configuración personalizable por usuario

## ✅ Checklist de Implementación

### Backend
- [x] Modelos de base de datos
- [x] Schemas de validación
- [x] Repository layer
- [x] Service layer
- [x] API endpoints
- [x] Scheduler de tareas
- [x] Script de migración
- [x] Documentación

### Frontend
- [x] Servicio API TypeScript
- [ ] Componente NotificationCenter
- [ ] Componente NotificationSettings
- [ ] Integración en layout
- [ ] Página de configuración
- [ ] Tests

### Deployment
- [ ] Ejecutar migración en producción
- [ ] Configurar scheduler como servicio
- [ ] Monitorear logs
- [ ] Ajustar configuraciones

---

**Desarrollado para POS Cesariel - Sistema Completo de Notificaciones**
