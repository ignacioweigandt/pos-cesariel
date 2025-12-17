/**
 * Servicio de notificaciones para POS Cesariel Frontend
 *
 * Proporciona funciones para interactuar con el sistema de notificaciones del backend.
 */

import { api } from '@/lib/api';

export interface Notification {
  id: number;
  type: 'low_stock' | 'daily_sales_report' | 'backup_reminder' | 'system_alert' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  is_active: boolean;
  user_id?: number;
  branch_id?: number;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  low_stock_enabled: boolean;
  low_stock_threshold: number;
  daily_sales_enabled: boolean;
  daily_sales_time: string;
  backup_reminder_enabled: boolean;
  backup_reminder_frequency: 'daily' | 'weekly' | 'monthly';
  backup_reminder_day: number;
  enabled: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsUpdate {
  low_stock_enabled?: boolean;
  low_stock_threshold?: number;
  daily_sales_enabled?: boolean;
  daily_sales_time?: string;
  backup_reminder_enabled?: boolean;
  backup_reminder_frequency?: 'daily' | 'weekly' | 'monthly';
  backup_reminder_day?: number;
  enabled?: boolean;
  email_notifications?: boolean;
}

class NotificationService {
  /**
   * Obtener notificaciones del usuario actual
   */
  async getNotifications(params?: {
    skip?: number;
    limit?: number;
    is_read?: boolean;
    type?: string;
  }): Promise<Notification[]> {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStats(): Promise<NotificationStats> {
    const response = await api.get('/notifications/stats');
    return response.data;
  }

  /**
   * Obtener resumen completo de notificaciones
   */
  async getSummary(): Promise<any> {
    const response = await api.get('/notifications/summary');
    return response.data;
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  /**
   * Obtener una notificación específica
   */
  async getNotification(id: number): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/mark-read`);
    return response.data;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  }

  /**
   * Marcar múltiples notificaciones como leídas
   */
  async markMultipleAsRead(notification_ids: number[]): Promise<{ message: string; count: number }> {
    const response = await api.post('/notifications/mark-multiple-read', { notification_ids });
    return response.data;
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }

  /**
   * Eliminar múltiples notificaciones
   */
  async bulkDelete(notification_ids: number[]): Promise<{ message: string; count: number }> {
    const response = await api.post('/notifications/bulk-delete', { notification_ids });
    return response.data;
  }

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async getSettings(): Promise<NotificationSettings> {
    const response = await api.get('/notifications/settings/my-settings');
    return response.data;
  }

  /**
   * Actualizar configuración de notificaciones
   */
  async updateSettings(data: NotificationSettingsUpdate): Promise<NotificationSettings> {
    const response = await api.put('/notifications/settings/my-settings', data);
    return response.data;
  }

  /**
   * Trigger manual de verificación de stock bajo (solo ADMIN)
   */
  async triggerLowStockCheck(): Promise<{ message: string; alerts_created: number }> {
    const response = await api.post('/notifications/admin/trigger-low-stock-check');
    return response.data;
  }

  /**
   * Trigger manual de reporte diario (solo ADMIN)
   */
  async triggerDailySalesReport(): Promise<{ message: string; reports_created: number }> {
    const response = await api.post('/notifications/admin/trigger-daily-sales-report');
    return response.data;
  }

  /**
   * Trigger manual de recordatorio de respaldo (solo ADMIN)
   */
  async triggerBackupReminder(frequency: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<{ message: string; reminders_created: number }> {
    const response = await api.post(`/notifications/admin/trigger-backup-reminder?frequency=${frequency}`);
    return response.data;
  }

  /**
   * Limpiar notificaciones antiguas (solo ADMIN)
   */
  async cleanupOldNotifications(days: number = 30): Promise<{ message: string; cleaned: number }> {
    const response = await api.post(`/notifications/admin/cleanup-old?days=${days}`);
    return response.data;
  }

  /**
   * Desactivar notificaciones expiradas (solo ADMIN)
   */
  async deactivateExpired(): Promise<{ message: string; deactivated: number }> {
    const response = await api.post('/notifications/admin/deactivate-expired');
    return response.data;
  }

  /**
   * Utilidad: Obtener icono según tipo de notificación
   */
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      low_stock: '📦',
      daily_sales_report: '📊',
      backup_reminder: '💾',
      system_alert: '⚠️',
      custom: '📢'
    };
    return icons[type] || '🔔';
  }

  /**
   * Utilidad: Obtener color según prioridad
   */
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      urgent: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'gray'
    };
    return colors[priority] || 'gray';
  }

  /**
   * Utilidad: Formatear tiempo relativo
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    return date.toLocaleDateString();
  }
}

export default new NotificationService();
