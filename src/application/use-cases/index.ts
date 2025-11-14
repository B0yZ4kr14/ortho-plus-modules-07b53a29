// Patient Use Cases
export { CreatePatientUseCase } from './patient/CreatePatientUseCase';
export { GetPatientByIdUseCase } from './patient/GetPatientByIdUseCase';
export { ListPatientsByClinicUseCase } from './patient/ListPatientsByClinicUseCase';
export { UpdatePatientUseCase } from './patient/UpdatePatientUseCase';

// Module Use Cases
export { GetActiveModulesUseCase } from './module/GetActiveModulesUseCase';
export { ToggleModuleStateUseCase } from './module/ToggleModuleStateUseCase';

// User Use Cases
export { GetUserByIdUseCase } from './user/GetUserByIdUseCase';
export { UpdateUserUseCase } from './user/UpdateUserUseCase';
export { ListUsersByClinicUseCase } from './user/ListUsersByClinicUseCase';

// Prontuario (PEP) Use Cases
export { CreateTratamentoUseCase } from './prontuario/CreateTratamentoUseCase';
export { GetTratamentosByProntuarioUseCase } from './prontuario/GetTratamentosByProntuarioUseCase';
export { UpdateTratamentoStatusUseCase } from './prontuario/UpdateTratamentoStatusUseCase';
export { CreateEvolucaoUseCase } from './prontuario/CreateEvolucaoUseCase';
export { UploadAnexoUseCase } from './prontuario/UploadAnexoUseCase';

// Agenda Use Cases
export { CreateAgendamentoUseCase } from './agenda/CreateAgendamentoUseCase';
export { UpdateAgendamentoUseCase } from './agenda/UpdateAgendamentoUseCase';
export { CancelAgendamentoUseCase } from './agenda/CancelAgendamentoUseCase';
export { SendConfirmacaoWhatsAppUseCase } from './agenda/SendConfirmacaoWhatsAppUseCase';
export { GetAgendamentosByDateRangeUseCase } from './agenda/GetAgendamentosByDateRangeUseCase';
