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
  PRONTUARIO_REPOSITORY: 'IProntuarioRepository',
  TRATAMENTO_REPOSITORY: 'ITratamentoRepository',
  EVOLUCAO_REPOSITORY: 'IEvolucaoRepository',
  ANEXO_REPOSITORY: 'IAnexoRepository',
  AGENDAMENTO_REPOSITORY: 'IAgendamentoRepository',
  CONFIRMACAO_REPOSITORY: 'IConfirmacaoRepository',

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

  // Use Cases - Prontuario (PEP)
  CREATE_TRATAMENTO_USE_CASE: 'CreateTratamentoUseCase',
  GET_TRATAMENTOS_BY_PRONTUARIO_USE_CASE: 'GetTratamentosByProntuarioUseCase',
  UPDATE_TRATAMENTO_STATUS_USE_CASE: 'UpdateTratamentoStatusUseCase',
  CREATE_EVOLUCAO_USE_CASE: 'CreateEvolucaoUseCase',
  UPLOAD_ANEXO_USE_CASE: 'UploadAnexoUseCase',

  // Use Cases - Agenda
  CREATE_AGENDAMENTO_USE_CASE: 'CreateAgendamentoUseCase',
  UPDATE_AGENDAMENTO_USE_CASE: 'UpdateAgendamentoUseCase',
  CANCEL_AGENDAMENTO_USE_CASE: 'CancelAgendamentoUseCase',
  SEND_CONFIRMACAO_WHATSAPP_USE_CASE: 'SendConfirmacaoWhatsAppUseCase',
  GET_AGENDAMENTOS_BY_DATE_RANGE_USE_CASE: 'GetAgendamentosByDateRangeUseCase',
} as const;

export type ServiceKey = typeof SERVICE_KEYS[keyof typeof SERVICE_KEYS];
