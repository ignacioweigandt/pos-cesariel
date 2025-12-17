/**
 * Configuration Types
 *
 * TypeScript types for configuration module
 */

// ========== Payment Configuration Types ==========

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  requires_change: boolean;
  icon: string;
}

export type CardType = 'bancarizadas' | 'no_bancarizadas' | 'tarjeta_naranja';

export interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: CardType;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentConfigCreate {
  payment_type: string;
  card_type?: CardType;
  installments: number;
  surcharge_percentage: number;
  is_active?: boolean;
  description?: string;
}

export interface PaymentConfigUpdate {
  payment_type?: string;
  card_type?: CardType;
  installments?: number;
  surcharge_percentage?: number;
  is_active?: boolean;
  description?: string;
}

// ========== Custom Installment Types ==========

export interface CustomInstallment {
  id: number;
  card_type: CardType;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description: string;
  created_at?: string;
}

export interface CustomInstallmentCreate {
  card_type: CardType;
  installments: number;
  surcharge_percentage: number;
  description: string;
}

// ========== Currency Configuration Types ==========

export type CurrencyCode = 'ARS' | 'USD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  country: string;
}

export interface CurrencyConfig {
  default_currency: CurrencyCode;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
}

// ========== Tax Rate Types ==========

export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  is_active: boolean;
  is_default: boolean;
  description: string;
}

export interface TaxRateCreate {
  name: string;
  rate: number;
  description: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface TaxRateUpdate {
  name?: string;
  rate?: number;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
}

// ========== Notification Configuration Types ==========

export interface LowStockAlert {
  enabled: boolean;
  threshold: number;
}

export interface DailySalesReport {
  enabled: boolean;
  time: string;
}

export interface BackupReminder {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface NotificationConfig {
  low_stock_alert: LowStockAlert;
  daily_sales_report: DailySalesReport;
  backup_reminder: BackupReminder;
}

// ========== Security & Backup Types ==========

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  retention_days: number;
}

export interface SecurityBackupConfig {
  auto_backup: AutoBackupConfig;
  backup_location: string;
  include_images: boolean;
  compress_backups: boolean;
  last_backup?: string;
  backup_size?: string;
}

// ========== System Configuration Types ==========

export interface SystemFeatures {
  pos: boolean;
  ecommerce: boolean;
  multi_branch: boolean;
  inventory: boolean;
  reports: boolean;
  websockets: boolean;
}

export interface SystemConfig {
  app_name: string;
  version: string;
  environment: string;
  features: SystemFeatures;
  default_currency: CurrencyCode;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
  default_tax_rate: number;
  max_upload_size: string;
  session_timeout: number;
}

// ========== API Response Types ==========

export interface ConfigApiResponse<T> {
  data: T;
  message?: string;
}

// ========== Form State Types ==========

export interface PaymentConfigFormState {
  payment_type: string;
  card_type: CardType | '';
  installments: number;
  surcharge_percentage: number;
  description: string;
}

export interface CustomInstallmentFormState {
  card_type: CardType | '';
  installments: number;
  surcharge_percentage: number;
  description: string;
}
