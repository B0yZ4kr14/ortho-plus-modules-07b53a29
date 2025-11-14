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

  // Repositories - Orçamentos
  ORCAMENTO_REPOSITORY: 'IOrcamentoRepository',
  ITEM_ORCAMENTO_REPOSITORY: 'IItemOrcamentoRepository',

  // Use Cases - Orçamentos
  CREATE_ORCAMENTO_USE_CASE: 'CreateOrcamentoUseCase',
  UPDATE_ORCAMENTO_USE_CASE: 'UpdateOrcamentoUseCase',
  APROVAR_ORCAMENTO_USE_CASE: 'AprovarOrcamentoUseCase',
  REJEITAR_ORCAMENTO_USE_CASE: 'RejeitarOrcamentoUseCase',
  ADD_ITEM_ORCAMENTO_USE_CASE: 'AddItemOrcamentoUseCase',

  // Repositories - Odontograma
  ODONTOGRAMA_REPOSITORY: 'IOdontogramaRepository',

  // Use Cases - Odontograma
  GET_ODONTOGRAMA_USE_CASE: 'GetOdontogramaUseCase',
  UPDATE_TOOTH_STATUS_USE_CASE: 'UpdateToothStatusUseCase',
  UPDATE_TOOTH_SURFACE_USE_CASE: 'UpdateToothSurfaceUseCase',
  UPDATE_TOOTH_NOTES_USE_CASE: 'UpdateToothNotesUseCase',

  // Repositories - Estoque
  PRODUTO_REPOSITORY: 'IProdutoRepository',
  MOVIMENTACAO_ESTOQUE_REPOSITORY: 'IMovimentacaoEstoqueRepository',

  // Use Cases - Estoque
  CREATE_PRODUTO_USE_CASE: 'CreateProdutoUseCase',
  UPDATE_PRODUTO_USE_CASE: 'UpdateProdutoUseCase',
  GET_PRODUTO_BY_ID_USE_CASE: 'GetProdutoByIdUseCase',
  LIST_PRODUTOS_BY_CLINIC_USE_CASE: 'ListProdutosByClinicUseCase',
  REGISTRAR_ENTRADA_USE_CASE: 'RegistrarEntradaUseCase',
  REGISTRAR_SAIDA_USE_CASE: 'RegistrarSaidaUseCase',
  AJUSTAR_ESTOQUE_USE_CASE: 'AjustarEstoqueUseCase',
  GET_MOVIMENTACOES_BY_PRODUTO_USE_CASE: 'GetMovimentacoesByProdutoUseCase',

  // Repositories - Financeiro
  CONTA_PAGAR_REPOSITORY: 'IContaPagarRepository',
  CONTA_RECEBER_REPOSITORY: 'IContaReceberRepository',
  MOVIMENTO_CAIXA_REPOSITORY: 'IMovimentoCaixaRepository',
  INCIDENTE_CAIXA_REPOSITORY: 'IIncidenteCaixaRepository',

  // Use Cases - Financeiro
  CREATE_CONTA_PAGAR_USE_CASE: 'CreateContaPagarUseCase',
  PAGAR_CONTA_USE_CASE: 'PagarContaUseCase',
  LIST_CONTAS_PAGAR_USE_CASE: 'ListContasPagarUseCase',
  CREATE_CONTA_RECEBER_USE_CASE: 'CreateContaReceberUseCase',
  RECEBER_CONTA_USE_CASE: 'ReceberContaUseCase',
  LIST_CONTAS_RECEBER_USE_CASE: 'ListContasReceberUseCase',
  ABRIR_CAIXA_USE_CASE: 'AbrirCaixaUseCase',
  FECHAR_CAIXA_USE_CASE: 'FecharCaixaUseCase',
  REGISTRAR_SANGRIA_USE_CASE: 'RegistrarSangriaUseCase',
  REGISTRAR_INCIDENTE_CAIXA_USE_CASE: 'RegistrarIncidenteCaixaUseCase',
  GET_FLUXO_CAIXA_USE_CASE: 'GetFluxoCaixaUseCase',

  // Repositories - CRM
  LEAD_REPOSITORY: 'ILeadRepository',
  ATIVIDADE_REPOSITORY: 'IAtividadeRepository',

  // Use Cases - CRM
  CREATE_LEAD_USE_CASE: 'CreateLeadUseCase',
  UPDATE_LEAD_STATUS_USE_CASE: 'UpdateLeadStatusUseCase',
  GET_LEADS_BY_STATUS_USE_CASE: 'GetLeadsByStatusUseCase',
  CREATE_ATIVIDADE_USE_CASE: 'CreateAtividadeUseCase',
  CONCLUIR_ATIVIDADE_USE_CASE: 'ConcluirAtividadeUseCase',
} as const;

export type ServiceKey = typeof SERVICE_KEYS[keyof typeof SERVICE_KEYS];
