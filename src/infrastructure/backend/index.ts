/**
 * Backend Service Factory
 * Allows switching between Supabase and PostgreSQL implementations
 */

import { SupabaseBackendService } from './SupabaseBackendService';
import type { IBackendService } from './IBackendService';

// Check localStorage first, then environment variable
const BACKEND_TYPE = typeof window !== 'undefined' 
  ? localStorage.getItem('selected_backend') || import.meta.env.VITE_BACKEND_TYPE || 'supabase'
  : import.meta.env.VITE_BACKEND_TYPE || 'supabase';

/**
 * Get the active backend service
 * Supports both Supabase and PostgreSQL (Ubuntu Server)
 */
export function getBackendService(): IBackendService {
  if (BACKEND_TYPE === 'ubuntu-server' || BACKEND_TYPE === 'postgresql') {
    const { PostgreSQLBackendService } = require('./PostgreSQLBackendService');
    return new PostgreSQLBackendService();
  }

  // Default to Supabase
  return new SupabaseBackendService();
}

// Singleton instance
export const backend = getBackendService();

// Export types
export type { IBackendService, IAuthService, IDataService, IStorageService, IFunctionsService } from './IBackendService';
