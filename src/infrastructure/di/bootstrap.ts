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
import { SupabaseProntuarioRepository } from '../repositories/SupabaseProntuarioRepository';
import { SupabaseTratamentoRepository } from '../repositories/SupabaseTratamentoRepository';
import { SupabaseEvolucaoRepository } from '../repositories/SupabaseEvolucaoRepository';
import { SupabaseAnexoRepository } from '../repositories/SupabaseAnexoRepository';

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

// Use Cases - Prontuario (PEP)
import { CreateTratamentoUseCase } from '@/application/use-cases/prontuario/CreateTratamentoUseCase';
import { GetTratamentosByProntuarioUseCase } from '@/application/use-cases/prontuario/GetTratamentosByProntuarioUseCase';
import { UpdateTratamentoStatusUseCase } from '@/application/use-cases/prontuario/UpdateTratamentoStatusUseCase';
import { CreateEvolucaoUseCase } from '@/application/use-cases/prontuario/CreateEvolucaoUseCase';
import { UploadAnexoUseCase } from '@/application/use-cases/prontuario/UploadAnexoUseCase';

// Agenda Module
import { SupabaseAgendamentoRepository } from '@/infrastructure/repositories/SupabaseAgendamentoRepository';
import { SupabaseConfirmacaoRepository } from '@/infrastructure/repositories/SupabaseConfirmacaoRepository';
import { CreateAgendamentoUseCase } from '@/application/use-cases/agenda/CreateAgendamentoUseCase';
import { UpdateAgendamentoUseCase } from '@/application/use-cases/agenda/UpdateAgendamentoUseCase';
import { CancelAgendamentoUseCase } from '@/application/use-cases/agenda/CancelAgendamentoUseCase';
import { SendConfirmacaoWhatsAppUseCase } from '@/application/use-cases/agenda/SendConfirmacaoWhatsAppUseCase';
import { GetAgendamentosByDateRangeUseCase } from '@/application/use-cases/agenda/GetAgendamentosByDateRangeUseCase';

// Orcamentos Module
import { SupabaseOrcamentoRepository } from '@/infrastructure/repositories/SupabaseOrcamentoRepository';
import { SupabaseItemOrcamentoRepository } from '@/infrastructure/repositories/SupabaseItemOrcamentoRepository';
import { CreateOrcamentoUseCase } from '@/application/use-cases/orcamentos/CreateOrcamentoUseCase';
import { UpdateOrcamentoUseCase } from '@/application/use-cases/orcamentos/UpdateOrcamentoUseCase';
import { AprovarOrcamentoUseCase } from '@/application/use-cases/orcamentos/AprovarOrcamentoUseCase';
import { RejeitarOrcamentoUseCase } from '@/application/use-cases/orcamentos/RejeitarOrcamentoUseCase';
import { AddItemOrcamentoUseCase } from '@/application/use-cases/orcamentos/AddItemOrcamentoUseCase';

// Odontograma Module
import { SupabaseOdontogramaRepository } from '@/infrastructure/repositories/SupabaseOdontogramaRepository';
import { GetOdontogramaUseCase } from '@/application/use-cases/odontograma/GetOdontogramaUseCase';
import { UpdateToothStatusUseCase } from '@/application/use-cases/odontograma/UpdateToothStatusUseCase';
import { UpdateToothSurfaceUseCase } from '@/application/use-cases/odontograma/UpdateToothSurfaceUseCase';
import { UpdateToothNotesUseCase } from '@/application/use-cases/odontograma/UpdateToothNotesUseCase';

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

  // Registrar Repositories - Prontuario (PEP)
  container.register(
    SERVICE_KEYS.PRONTUARIO_REPOSITORY,
    () => new SupabaseProntuarioRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.TRATAMENTO_REPOSITORY,
    () => new SupabaseTratamentoRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.EVOLUCAO_REPOSITORY,
    () => new SupabaseEvolucaoRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.ANEXO_REPOSITORY,
    () => new SupabaseAnexoRepository(),
    true
  );

  // Registrar Use Cases - Prontuario (PEP)
  container.register(
    SERVICE_KEYS.CREATE_TRATAMENTO_USE_CASE,
    () => new CreateTratamentoUseCase(
      container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.GET_TRATAMENTOS_BY_PRONTUARIO_USE_CASE,
    () => new GetTratamentosByProntuarioUseCase(
      container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_TRATAMENTO_STATUS_USE_CASE,
    () => new UpdateTratamentoStatusUseCase(
      container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.CREATE_EVOLUCAO_USE_CASE,
    () => new CreateEvolucaoUseCase(
      container.resolve(SERVICE_KEYS.EVOLUCAO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPLOAD_ANEXO_USE_CASE,
    () => new UploadAnexoUseCase(
      container.resolve(SERVICE_KEYS.ANEXO_REPOSITORY)
    ),
    true
  );

  // Registrar Repositories - Agenda
  container.register(
    SERVICE_KEYS.AGENDAMENTO_REPOSITORY,
    () => new SupabaseAgendamentoRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.CONFIRMACAO_REPOSITORY,
    () => new SupabaseConfirmacaoRepository(),
    true
  );

  // Registrar Use Cases - Agenda
  container.register(
    SERVICE_KEYS.CREATE_AGENDAMENTO_USE_CASE,
    () => new CreateAgendamentoUseCase(
      container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_AGENDAMENTO_USE_CASE,
    () => new UpdateAgendamentoUseCase(
      container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.CANCEL_AGENDAMENTO_USE_CASE,
    () => new CancelAgendamentoUseCase(
      container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.SEND_CONFIRMACAO_WHATSAPP_USE_CASE,
    () => new SendConfirmacaoWhatsAppUseCase(
      container.resolve(SERVICE_KEYS.CONFIRMACAO_REPOSITORY),
      container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.GET_AGENDAMENTOS_BY_DATE_RANGE_USE_CASE,
    () => new GetAgendamentosByDateRangeUseCase(
      container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY)
    ),
    true
  );

  // Registrar Repositories - Orçamentos
  container.register(
    SERVICE_KEYS.ORCAMENTO_REPOSITORY,
    () => new SupabaseOrcamentoRepository(),
    true
  );

  container.register(
    SERVICE_KEYS.ITEM_ORCAMENTO_REPOSITORY,
    () => new SupabaseItemOrcamentoRepository(),
    true
  );

  // Registrar Use Cases - Orçamentos
  container.register(
    SERVICE_KEYS.CREATE_ORCAMENTO_USE_CASE,
    () => new CreateOrcamentoUseCase(
      container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_ORCAMENTO_USE_CASE,
    () => new UpdateOrcamentoUseCase(
      container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.APROVAR_ORCAMENTO_USE_CASE,
    () => new AprovarOrcamentoUseCase(
      container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.REJEITAR_ORCAMENTO_USE_CASE,
    () => new RejeitarOrcamentoUseCase(
      container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.ADD_ITEM_ORCAMENTO_USE_CASE,
    () => new AddItemOrcamentoUseCase(
      container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
      container.resolve(SERVICE_KEYS.ITEM_ORCAMENTO_REPOSITORY)
    ),
    true
  );

  // Registrar Repositories - Odontograma
  container.register(
    SERVICE_KEYS.ODONTOGRAMA_REPOSITORY,
    () => new SupabaseOdontogramaRepository(),
    true
  );

  // Registrar Use Cases - Odontograma
  container.register(
    SERVICE_KEYS.GET_ODONTOGRAMA_USE_CASE,
    () => new GetOdontogramaUseCase(
      container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_STATUS_USE_CASE,
    () => new UpdateToothStatusUseCase(
      container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_SURFACE_USE_CASE,
    () => new UpdateToothSurfaceUseCase(
      container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY)
    ),
    true
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_NOTES_USE_CASE,
    () => new UpdateToothNotesUseCase(
      container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY)
    ),
    true
  );
}

// Auto-bootstrap ao importar
bootstrapContainer();
