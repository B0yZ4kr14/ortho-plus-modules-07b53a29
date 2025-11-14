/**
 * Service Keys
 * 
 * Constantes para identificar serviços no DI Container.
 * Usar constantes ao invés de strings evita typos e facilita refatoração.
 */

// Repositories
export const SERVICE_KEYS = {
  // Repositories
  PATIENT_REPOSITORY: 'IPatientRepository',
  MODULE_REPOSITORY: 'IModuleRepository',
  USER_REPOSITORY: 'IUserRepository',

  // Use Cases - Patient
  CREATE_PATIENT_USE_CASE: 'CreatePatientUseCase',
  GET_PATIENT_BY_ID_USE_CASE: 'GetPatientByIdUseCase',
  LIST_PATIENTS_BY_CLINIC_USE_CASE: 'ListPatientsByClinicUseCase',
  UPDATE_PATIENT_USE_CASE: 'UpdatePatientUseCase',

  // Use Cases - Module
  GET_ACTIVE_MODULES_USE_CASE: 'GetActiveModulesUseCase',
  TOGGLE_MODULE_STATE_USE_CASE: 'ToggleModuleStateUseCase',

  // Use Cases - User
  GET_USER_BY_ID_USE_CASE: 'GetUserByIdUseCase',
  UPDATE_USER_USE_CASE: 'UpdateUserUseCase',
  LIST_USERS_BY_CLINIC_USE_CASE: 'ListUsersByClinicUseCase',
} as const;

export type ServiceKey = typeof SERVICE_KEYS[keyof typeof SERVICE_KEYS];
