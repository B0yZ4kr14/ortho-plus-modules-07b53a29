/**
 * Shared types for Edge Functions
 * FASE 2.3: Tipagem forte centralizada
 */

// ============= MODULE MANAGEMENT =============

export interface ToggleModuleRequest {
  module_key: string;
}

export interface ToggleModuleResponse {
  success: boolean;
  message: string;
  module: ModuleState;
  cascade_activated?: number;
}

export interface ModuleState {
  id: number;
  module_key: string;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
}

export interface ModuleWithDependencies {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_active: boolean;
  subscribed: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  blocking_dependencies: string[];
}

export interface GetModulesResponse {
  modules: ModuleWithDependencies[];
}

// ============= BACKUP MANAGEMENT =============

export interface BackupManagerRequest {
  action: 'deduplicate' | 'check-immutability' | 'stream-upload' | 'validate-integrity';
  payload: {
    backupId?: string;
    clinicId?: string;
    backupType?: string;
  };
}

export interface DeduplicationStats {
  uniqueBlocks: number;
  duplicateBlocks: number;
  deduplicationRatio: number;
}

export interface ImmutabilityCheck {
  isImmutable: boolean;
  backupId: string;
  completedAt: string;
  verifiedAt: string | null;
}

export interface IntegrityValidation {
  isValid: boolean;
  backupId: string;
  checksums: {
    md5: string | null;
    sha256: string | null;
  };
}

// ============= COMMON RESPONSES =============

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ============= AUTHENTICATION =============

export interface AuthenticatedUser {
  id: string;
  email: string;
  app_role: 'ADMIN' | 'MEMBER';
  clinic_id: string;
}

// ============= RATE LIMITING =============

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}
