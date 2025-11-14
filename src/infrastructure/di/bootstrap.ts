/**
 * Bootstrap - Configuração do DI Container
 * 
 * Registra todas as dependências da aplicação no container.
 * Este arquivo é o único lugar onde as dependências concretas são instanciadas.
 */

import { container } from './Container';
import { SERVICE_KEYS } from './ServiceKeys';

// Repositories
import { SupabasePatientRepository } from '../repositories/SupabasePatientRepository';
import { SupabaseModuleRepository } from '../repositories/SupabaseModuleRepository';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository';

// Use Cases - Patient
import { CreatePatientUseCase } from '@/application/use-cases/patient/CreatePatientUseCase';
import { GetPatientByIdUseCase } from '@/application/use-cases/patient/GetPatientByIdUseCase';
import { ListPatientsByClinicUseCase } from '@/application/use-cases/patient/ListPatientsByClinicUseCase';
import { UpdatePatientUseCase } from '@/application/use-cases/patient/UpdatePatientUseCase';

// Use Cases - Module
import { GetActiveModulesUseCase } from '@/application/use-cases/module/GetActiveModulesUseCase';
import { ToggleModuleStateUseCase } from '@/application/use-cases/module/ToggleModuleStateUseCase';

// Use Cases - User
import { GetUserByIdUseCase } from '@/application/use-cases/user/GetUserByIdUseCase';
import { UpdateUserUseCase } from '@/application/use-cases/user/UpdateUserUseCase';
import { ListUsersByClinicUseCase } from '@/application/use-cases/user/ListUsersByClinicUseCase';

/**
 * Inicializa o DI Container com todas as dependências
 */
export function bootstrapContainer(): void {
  // Registrar Repositories (Singletons)
  container.register(
    SERVICE_KEYS.PATIENT_REPOSITORY,
    () => new SupabasePatientRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.MODULE_REPOSITORY,
    () => new SupabaseModuleRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.USER_REPOSITORY,
    () => new SupabaseUserRepository(),
    true
  );

  // Registrar Use Cases - Patient
  container.register(
    SERVICE_KEYS.CREATE_PATIENT_USE_CASE,
    () => new CreatePatientUseCase(
      container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.GET_PATIENT_BY_ID_USE_CASE,
    () => new GetPatientByIdUseCase(
      container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.LIST_PATIENTS_BY_CLINIC_USE_CASE,
    () => new ListPatientsByClinicUseCase(
      container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_PATIENT_USE_CASE,
    () => new UpdatePatientUseCase(
      container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY)
    ),
    true
  );

  // Registrar Use Cases - Module
  container.register(
    SERVICE_KEYS.GET_ACTIVE_MODULES_USE_CASE,
    () => new GetActiveModulesUseCase(
      container.resolve(SERVICE_KEYS.MODULE_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.TOGGLE_MODULE_STATE_USE_CASE,
    () => new ToggleModuleStateUseCase(
      container.resolve(SERVICE_KEYS.MODULE_REPOSITORY)
    ),
    true
  );

  // Registrar Use Cases - User
  container.register(
    SERVICE_KEYS.GET_USER_BY_ID_USE_CASE,
    () => new GetUserByIdUseCase(
      container.resolve(SERVICE_KEYS.USER_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_USER_USE_CASE,
    () => new UpdateUserUseCase(
      container.resolve(SERVICE_KEYS.USER_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.LIST_USERS_BY_CLINIC_USE_CASE,
    () => new ListUsersByClinicUseCase(
      container.resolve(SERVICE_KEYS.USER_REPOSITORY)
    ),
    true
  );
}

// Auto-bootstrap ao importar
bootstrapContainer();
