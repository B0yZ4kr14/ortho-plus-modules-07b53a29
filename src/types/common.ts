/**
 * Common Type Definitions
 * Eliminates 'any' types across the application
 */

// ==================== API & Database Types ====================

export interface DatabaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicRecord extends DatabaseRecord {
  clinic_id: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface QueryFilters {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ==================== Form & UI Types ====================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormSubmitResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormFieldError[];
  message?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  disabled?: boolean;
}

// ==================== Payment & Financial Types ====================

export type PaymentMethod = 
  | 'PIX' 
  | 'CARTAO_CREDITO' 
  | 'CARTAO_DEBITO' 
  | 'DINHEIRO' 
  | 'CRYPTO' 
  | 'TRANSFERENCIA_BANCARIA';

export interface PaymentData {
  metodo: PaymentMethod;
  valor: number;
  dados_pagamento?: Record<string, unknown>;
  observacoes?: string;
}

export interface CreditCardData {
  numero: string;
  nome_titular: string;
  validade: string;
  cvv: string;
  parcelas?: number;
}

export interface CryptoPaymentData {
  currency: 'BTC' | 'USDT' | 'ETH' | 'BNB';
  address: string;
  amount: number;
  qr_code?: string;
  transaction_hash?: string;
}

// ==================== User & Permission Types ====================

export type UserRole = 'ADMIN' | 'MEMBER' | 'PATIENT';

export interface UserPermission {
  user_id: string;
  module_key: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_export: boolean;
}

export interface UserMetadata {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  clinic_id?: string;
  permissions: UserPermission[];
}

// ==================== Module & Configuration Types ====================

export interface ModuleInfo {
  module_key: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  subscribed: boolean;
  can_activate?: boolean;
  can_deactivate?: boolean;
  dependencies?: string[];
  unmet_dependencies?: string[];
}

export interface ModuleDependency {
  module_key: string;
  depends_on_module_key: string;
  depends_on_module_name: string;
}

export interface ConfigurationData {
  [key: string]: string | number | boolean | null | ConfigurationData | ConfigurationData[];
}

// ==================== Appointment & Schedule Types ====================

export type AppointmentStatus = 
  | 'AGENDADO' 
  | 'CONFIRMADO' 
  | 'EM_ATENDIMENTO' 
  | 'CONCLUIDO' 
  | 'CANCELADO' 
  | 'FALTOU';

export interface AppointmentData extends ClinicRecord {
  patient_id: string;
  dentist_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  title: string;
  description?: string;
  treatment_id?: string;
}

// ==================== Patient & Clinical Types ====================

export type PatientStatus = 
  | 'ATIVO' 
  | 'INATIVO' 
  | 'AGUARDANDO_TRATAMENTO' 
  | 'EM_TRATAMENTO' 
  | 'TRATAMENTO_CONCLUIDO';

export interface PatientData extends ClinicRecord {
  full_name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  status: PatientStatus;
  address?: string;
  medical_history?: string;
  allergies?: string;
}

// ==================== Inventory & Product Types ====================

export interface ProductData extends ClinicRecord {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier?: string;
  barcode?: string;
}

// ==================== Chart & Analytics Types ====================

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ==================== Event & Notification Types ====================

export interface DomainEvent<T = unknown> {
  eventType: string;
  aggregateId: string;
  payload: T;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  created_at: string;
  action_url?: string;
}

// ==================== Webhook & Integration Types ====================

export interface WebhookPayload<T = unknown> {
  event_type: string;
  data: T;
  timestamp: string;
  signature?: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    request_id?: string;
  };
}

// ==================== File & Storage Types ====================

export interface FileUploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  mime_type: string;
  bucket?: string;
}

export interface StorageConfig {
  bucket: string;
  path: string;
  maxSize?: number;
  allowedTypes?: string[];
  upsert?: boolean;
}

// ==================== Utility Types ====================

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
