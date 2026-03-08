/**
 * Bootstrap - Configuração do DI Container
 *
 * Registra todas as dependências da aplicação no container.
 * Este arquivo é o único lugar onde as dependências concretas são instanciadas.
 */

import { container } from "./Container";
import { SERVICE_KEYS } from "./ServiceKeys";

// Repositories
import { DbAnexoRepository } from "../repositories/DbAnexoRepository";
import { DbEvolucaoRepository } from "../repositories/DbEvolucaoRepository";
import { DbModuleRepository } from "../repositories/DbModuleRepository";
import { DbPatientRepository } from "../repositories/DbPatientRepository";
import { DbProntuarioRepository } from "../repositories/DbProntuarioRepository";
import { DbTratamentoRepository } from "../repositories/DbTratamentoRepository";
import { DbUserRepository } from "../repositories/DbUserRepository";

// Use Cases - Patient
import { CreatePatientUseCase } from "@/application/use-cases/patient/CreatePatientUseCase";
import { GetPatientByIdUseCase } from "@/application/use-cases/patient/GetPatientByIdUseCase";
import { ListPatientsByClinicUseCase } from "@/application/use-cases/patient/ListPatientsByClinicUseCase";
import { UpdatePatientUseCase } from "@/application/use-cases/patient/UpdatePatientUseCase";

// Use Cases - Module
import { GetActiveModulesUseCase } from "@/application/use-cases/module/GetActiveModulesUseCase";
import { ToggleModuleStateUseCase } from "@/application/use-cases/module/ToggleModuleStateUseCase";

// Use Cases - User
import { GetUserByIdUseCase } from "@/application/use-cases/user/GetUserByIdUseCase";
import { ListUsersByClinicUseCase } from "@/application/use-cases/user/ListUsersByClinicUseCase";
import { UpdateUserUseCase } from "@/application/use-cases/user/UpdateUserUseCase";

// Use Cases - Prontuario (PEP)
import { CreateEvolucaoUseCase } from "@/application/use-cases/prontuario/CreateEvolucaoUseCase";
import { CreateTratamentoUseCase } from "@/application/use-cases/prontuario/CreateTratamentoUseCase";
import { GetTratamentosByProntuarioUseCase } from "@/application/use-cases/prontuario/GetTratamentosByProntuarioUseCase";
import { UpdateTratamentoStatusUseCase } from "@/application/use-cases/prontuario/UpdateTratamentoStatusUseCase";
import { UploadAnexoUseCase } from "@/application/use-cases/prontuario/UploadAnexoUseCase";

// Agenda Module
import { CancelAgendamentoUseCase } from "@/application/use-cases/agenda/CancelAgendamentoUseCase";
import { CreateAgendamentoUseCase } from "@/application/use-cases/agenda/CreateAgendamentoUseCase";
import { GetAgendamentosByDateRangeUseCase } from "@/application/use-cases/agenda/GetAgendamentosByDateRangeUseCase";
import { SendConfirmacaoWhatsAppUseCase } from "@/application/use-cases/agenda/SendConfirmacaoWhatsAppUseCase";
import { UpdateAgendamentoUseCase } from "@/application/use-cases/agenda/UpdateAgendamentoUseCase";
import { DbAgendamentoRepository } from "@/infrastructure/repositories/DbAgendamentoRepository";
import { DbConfirmacaoRepository } from "@/infrastructure/repositories/DbConfirmacaoRepository";

// Orcamentos Module
import { AddItemOrcamentoUseCase } from "@/application/use-cases/orcamentos/AddItemOrcamentoUseCase";
import { AprovarOrcamentoUseCase } from "@/application/use-cases/orcamentos/AprovarOrcamentoUseCase";
import { CreateOrcamentoUseCase } from "@/application/use-cases/orcamentos/CreateOrcamentoUseCase";
import { RejeitarOrcamentoUseCase } from "@/application/use-cases/orcamentos/RejeitarOrcamentoUseCase";
import { UpdateOrcamentoUseCase } from "@/application/use-cases/orcamentos/UpdateOrcamentoUseCase";
import { ItemOrcamentoRepositoryApi } from "@/infrastructure/repositories/ItemOrcamentoRepositoryApi";
import { OrcamentoRepositoryApi } from "@/infrastructure/repositories/OrcamentoRepositoryApi";

// Odontograma Module
import { GetOdontogramaUseCase } from "@/application/use-cases/odontograma/GetOdontogramaUseCase";
import { UpdateToothNotesUseCase } from "@/application/use-cases/odontograma/UpdateToothNotesUseCase";
import { UpdateToothStatusUseCase } from "@/application/use-cases/odontograma/UpdateToothStatusUseCase";
import { UpdateToothSurfaceUseCase } from "@/application/use-cases/odontograma/UpdateToothSurfaceUseCase";
import { DbOdontogramaRepository } from "@/infrastructure/repositories/DbOdontogramaRepository";

// Estoque Module (usando repositórios do módulo)
import { AjustarEstoqueUseCase } from "@/application/use-cases/estoque/AjustarEstoqueUseCase";
import { CreateProdutoUseCase } from "@/application/use-cases/estoque/CreateProdutoUseCase";
import { GetMovimentacoesByProdutoUseCase } from "@/application/use-cases/estoque/GetMovimentacoesByProdutoUseCase";
import { GetProdutoByIdUseCase } from "@/application/use-cases/estoque/GetProdutoByIdUseCase";
import { ListProdutosByClinicUseCase } from "@/application/use-cases/estoque/ListProdutosByClinicUseCase";
import { RegistrarEntradaUseCase } from "@/application/use-cases/estoque/RegistrarEntradaUseCase";
import { RegistrarSaidaUseCase } from "@/application/use-cases/estoque/RegistrarSaidaUseCase";
import { UpdateProdutoUseCase } from "@/application/use-cases/estoque/UpdateProdutoUseCase";
import { ApiMovimentacaoEstoqueRepository } from "@/modules/estoque/infrastructure/repositories/ApiMovimentacaoEstoqueRepository";
import { ApiProdutoRepository } from "@/modules/estoque/infrastructure/repositories/ApiProdutoRepository";

// Financeiro Module
import { AbrirCaixaUseCase } from "@/application/use-cases/financeiro/AbrirCaixaUseCase";
import { CreateContaPagarUseCase } from "@/application/use-cases/financeiro/CreateContaPagarUseCase";
import { CreateContaReceberUseCase } from "@/application/use-cases/financeiro/CreateContaReceberUseCase";
import { FecharCaixaUseCase } from "@/application/use-cases/financeiro/FecharCaixaUseCase";
import { GetFluxoCaixaUseCase } from "@/application/use-cases/financeiro/GetFluxoCaixaUseCase";
import { ListContasPagarUseCase } from "@/application/use-cases/financeiro/ListContasPagarUseCase";
import { ListContasReceberUseCase } from "@/application/use-cases/financeiro/ListContasReceberUseCase";
import { PagarContaUseCase } from "@/application/use-cases/financeiro/PagarContaUseCase";
import { ReceberContaUseCase } from "@/application/use-cases/financeiro/ReceberContaUseCase";
import { RegistrarIncidenteCaixaUseCase } from "@/application/use-cases/financeiro/RegistrarIncidenteCaixaUseCase";
import { RegistrarSangriaUseCase } from "@/application/use-cases/financeiro/RegistrarSangriaUseCase";
import { DbContaPagarRepository } from "@/infrastructure/repositories/DbContaPagarRepository";
import { DbContaReceberRepository } from "@/infrastructure/repositories/DbContaReceberRepository";
import { DbIncidenteCaixaRepository } from "@/infrastructure/repositories/DbIncidenteCaixaRepository";
import { DbMovimentoCaixaRepository } from "@/infrastructure/repositories/DbMovimentoCaixaRepository";

// CRM Module
import { ConcluirAtividadeUseCase } from "@/modules/crm/application/use-cases/ConcluirAtividadeUseCase";
import { CreateAtividadeUseCase } from "@/modules/crm/application/use-cases/CreateAtividadeUseCase";
import { GetLeadsByStatusUseCase } from "@/modules/crm/application/use-cases/GetLeadsByStatusUseCase";
import { UpdateLeadStatusUseCase } from "@/modules/crm/application/use-cases/UpdateLeadStatusUseCase";
import { AtividadeRepositoryApi } from "@/modules/crm/infrastructure/repositories/AtividadeRepositoryApi";
import { LeadRepositoryApi } from "@/modules/crm/infrastructure/repositories/LeadRepositoryApi";

/**
 * Inicializa o DI Container com todas as dependências
 */
export function bootstrapContainer(): void {
  // Registrar Repositories (Singletons)
  container.register(
    SERVICE_KEYS.PATIENT_REPOSITORY,
    () => new DbPatientRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.MODULE_REPOSITORY,
    () => new DbModuleRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.USER_REPOSITORY,
    () => new DbUserRepository(),
    true,
  );

  // Registrar Use Cases - Patient
  container.register(
    SERVICE_KEYS.CREATE_PATIENT_USE_CASE,
    () =>
      new CreatePatientUseCase(
        container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_PATIENT_BY_ID_USE_CASE,
    () =>
      new GetPatientByIdUseCase(
        container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.LIST_PATIENTS_BY_CLINIC_USE_CASE,
    () =>
      new ListPatientsByClinicUseCase(
        container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_PATIENT_USE_CASE,
    () =>
      new UpdatePatientUseCase(
        container.resolve(SERVICE_KEYS.PATIENT_REPOSITORY),
      ),
    true,
  );

  // Registrar Use Cases - Module
  container.register(
    SERVICE_KEYS.GET_ACTIVE_MODULES_USE_CASE,
    () =>
      new GetActiveModulesUseCase(
        container.resolve(SERVICE_KEYS.MODULE_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.TOGGLE_MODULE_STATE_USE_CASE,
    () =>
      new ToggleModuleStateUseCase(
        container.resolve(SERVICE_KEYS.MODULE_REPOSITORY),
      ),
    true,
  );

  // Registrar Use Cases - User
  container.register(
    SERVICE_KEYS.GET_USER_BY_ID_USE_CASE,
    () =>
      new GetUserByIdUseCase(container.resolve(SERVICE_KEYS.USER_REPOSITORY)),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_USER_USE_CASE,
    () =>
      new UpdateUserUseCase(container.resolve(SERVICE_KEYS.USER_REPOSITORY)),
    true,
  );

  container.register(
    SERVICE_KEYS.LIST_USERS_BY_CLINIC_USE_CASE,
    () =>
      new ListUsersByClinicUseCase(
        container.resolve(SERVICE_KEYS.USER_REPOSITORY),
      ),
    true,
  );

  // Registrar Repositories - Prontuario (PEP)
  container.register(
    SERVICE_KEYS.PRONTUARIO_REPOSITORY,
    () => new DbProntuarioRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.TRATAMENTO_REPOSITORY,
    () => new DbTratamentoRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.EVOLUCAO_REPOSITORY,
    () => new DbEvolucaoRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.ANEXO_REPOSITORY,
    () => new DbAnexoRepository(),
    true,
  );

  // Registrar Use Cases - Prontuario (PEP)
  container.register(
    SERVICE_KEYS.CREATE_TRATAMENTO_USE_CASE,
    () =>
      new CreateTratamentoUseCase(
        container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_TRATAMENTOS_BY_PRONTUARIO_USE_CASE,
    () =>
      new GetTratamentosByProntuarioUseCase(
        container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_TRATAMENTO_STATUS_USE_CASE,
    () =>
      new UpdateTratamentoStatusUseCase(
        container.resolve(SERVICE_KEYS.TRATAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.CREATE_EVOLUCAO_USE_CASE,
    () =>
      new CreateEvolucaoUseCase(
        container.resolve(SERVICE_KEYS.EVOLUCAO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPLOAD_ANEXO_USE_CASE,
    () =>
      new UploadAnexoUseCase(container.resolve(SERVICE_KEYS.ANEXO_REPOSITORY)),
    true,
  );

  // Registrar Repositories - Agenda
  container.register(
    SERVICE_KEYS.AGENDAMENTO_REPOSITORY,
    () => new DbAgendamentoRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.CONFIRMACAO_REPOSITORY,
    () => new DbConfirmacaoRepository(),
    true,
  );

  // Registrar Use Cases - Agenda
  container.register(
    SERVICE_KEYS.CREATE_AGENDAMENTO_USE_CASE,
    () =>
      new CreateAgendamentoUseCase(
        container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_AGENDAMENTO_USE_CASE,
    () =>
      new UpdateAgendamentoUseCase(
        container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.CANCEL_AGENDAMENTO_USE_CASE,
    () =>
      new CancelAgendamentoUseCase(
        container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.SEND_CONFIRMACAO_WHATSAPP_USE_CASE,
    () =>
      new SendConfirmacaoWhatsAppUseCase(
        container.resolve(SERVICE_KEYS.CONFIRMACAO_REPOSITORY),
        container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_AGENDAMENTOS_BY_DATE_RANGE_USE_CASE,
    () =>
      new GetAgendamentosByDateRangeUseCase(
        container.resolve(SERVICE_KEYS.AGENDAMENTO_REPOSITORY),
      ),
    true,
  );

  // Registrar Repositories - Orçamentos
  container.register(
    SERVICE_KEYS.ORCAMENTO_REPOSITORY,
    () => new OrcamentoRepositoryApi(),
    true,
  );

  container.register(
    SERVICE_KEYS.ITEM_ORCAMENTO_REPOSITORY,
    () => new ItemOrcamentoRepositoryApi(),
    true,
  );

  // Registrar Use Cases - Orçamentos
  container.register(
    SERVICE_KEYS.CREATE_ORCAMENTO_USE_CASE,
    () =>
      new CreateOrcamentoUseCase(
        container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_ORCAMENTO_USE_CASE,
    () =>
      new UpdateOrcamentoUseCase(
        container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.APROVAR_ORCAMENTO_USE_CASE,
    () =>
      new AprovarOrcamentoUseCase(
        container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.REJEITAR_ORCAMENTO_USE_CASE,
    () =>
      new RejeitarOrcamentoUseCase(
        container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.ADD_ITEM_ORCAMENTO_USE_CASE,
    () =>
      new AddItemOrcamentoUseCase(
        container.resolve(SERVICE_KEYS.ORCAMENTO_REPOSITORY),
        container.resolve(SERVICE_KEYS.ITEM_ORCAMENTO_REPOSITORY),
      ),
    true,
  );

  // Registrar Repositories - Odontograma
  container.register(
    SERVICE_KEYS.ODONTOGRAMA_REPOSITORY,
    () => new DbOdontogramaRepository(),
    true,
  );

  // Registrar Use Cases - Odontograma
  container.register(
    SERVICE_KEYS.GET_ODONTOGRAMA_USE_CASE,
    () =>
      new GetOdontogramaUseCase(
        container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_STATUS_USE_CASE,
    () =>
      new UpdateToothStatusUseCase(
        container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_SURFACE_USE_CASE,
    () =>
      new UpdateToothSurfaceUseCase(
        container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_TOOTH_NOTES_USE_CASE,
    () =>
      new UpdateToothNotesUseCase(
        container.resolve(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY),
      ),
    true,
  );

  // Registrar Repositories - Estoque
  container.register(
    SERVICE_KEYS.PRODUTO_REPOSITORY,
    () => new ApiProdutoRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.MOVIMENTACAO_ESTOQUE_REPOSITORY,
    () => new ApiMovimentacaoEstoqueRepository(),
    true,
  );

  // Registrar Use Cases - Estoque
  container.register(
    SERVICE_KEYS.CREATE_PRODUTO_USE_CASE,
    () =>
      new CreateProdutoUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.UPDATE_PRODUTO_USE_CASE,
    () =>
      new UpdateProdutoUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_PRODUTO_BY_ID_USE_CASE,
    () =>
      new GetProdutoByIdUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.LIST_PRODUTOS_BY_CLINIC_USE_CASE,
    () =>
      new ListProdutosByClinicUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.REGISTRAR_ENTRADA_USE_CASE,
    () =>
      new RegistrarEntradaUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
        container.resolve(SERVICE_KEYS.MOVIMENTACAO_ESTOQUE_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.REGISTRAR_SAIDA_USE_CASE,
    () =>
      new RegistrarSaidaUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
        container.resolve(SERVICE_KEYS.MOVIMENTACAO_ESTOQUE_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.AJUSTAR_ESTOQUE_USE_CASE,
    () =>
      new AjustarEstoqueUseCase(
        container.resolve(SERVICE_KEYS.PRODUTO_REPOSITORY),
        container.resolve(SERVICE_KEYS.MOVIMENTACAO_ESTOQUE_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_MOVIMENTACOES_BY_PRODUTO_USE_CASE,
    () =>
      new GetMovimentacoesByProdutoUseCase(
        container.resolve(SERVICE_KEYS.MOVIMENTACAO_ESTOQUE_REPOSITORY),
      ),
    true,
  );

  // ===== Financeiro Module =====
  // Repositories
  container.register(
    SERVICE_KEYS.CONTA_PAGAR_REPOSITORY,
    () => new DbContaPagarRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.CONTA_RECEBER_REPOSITORY,
    () => new DbContaReceberRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY,
    () => new DbMovimentoCaixaRepository(),
    true,
  );

  container.register(
    SERVICE_KEYS.INCIDENTE_CAIXA_REPOSITORY,
    () => new DbIncidenteCaixaRepository(),
    true,
  );

  // Use Cases - Contas a Pagar
  container.register(
    SERVICE_KEYS.CREATE_CONTA_PAGAR_USE_CASE,
    () =>
      new CreateContaPagarUseCase(
        container.resolve(SERVICE_KEYS.CONTA_PAGAR_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.PAGAR_CONTA_USE_CASE,
    () =>
      new PagarContaUseCase(
        container.resolve(SERVICE_KEYS.CONTA_PAGAR_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.LIST_CONTAS_PAGAR_USE_CASE,
    () =>
      new ListContasPagarUseCase(
        container.resolve(SERVICE_KEYS.CONTA_PAGAR_REPOSITORY),
      ),
    true,
  );

  // Use Cases - Contas a Receber
  container.register(
    SERVICE_KEYS.CREATE_CONTA_RECEBER_USE_CASE,
    () =>
      new CreateContaReceberUseCase(
        container.resolve(SERVICE_KEYS.CONTA_RECEBER_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.RECEBER_CONTA_USE_CASE,
    () =>
      new ReceberContaUseCase(
        container.resolve(SERVICE_KEYS.CONTA_RECEBER_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.LIST_CONTAS_RECEBER_USE_CASE,
    () =>
      new ListContasReceberUseCase(
        container.resolve(SERVICE_KEYS.CONTA_RECEBER_REPOSITORY),
      ),
    true,
  );

  // Use Cases - Caixa
  container.register(
    SERVICE_KEYS.ABRIR_CAIXA_USE_CASE,
    () =>
      new AbrirCaixaUseCase(
        container.resolve(SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.FECHAR_CAIXA_USE_CASE,
    () =>
      new FecharCaixaUseCase(
        container.resolve(SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.REGISTRAR_SANGRIA_USE_CASE,
    () =>
      new RegistrarSangriaUseCase(
        container.resolve(SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY),
      ),
    true,
  );

  // Use Cases - Incidentes
  container.register(
    SERVICE_KEYS.REGISTRAR_INCIDENTE_CAIXA_USE_CASE,
    () =>
      new RegistrarIncidenteCaixaUseCase(
        container.resolve(SERVICE_KEYS.INCIDENTE_CAIXA_REPOSITORY),
      ),
    true,
  );

  // Use Cases - Dashboard
  container.register(
    SERVICE_KEYS.GET_FLUXO_CAIXA_USE_CASE,
    () =>
      new GetFluxoCaixaUseCase(
        container.resolve(SERVICE_KEYS.CONTA_PAGAR_REPOSITORY),
        container.resolve(SERVICE_KEYS.CONTA_RECEBER_REPOSITORY),
        container.resolve(SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY),
      ),
    true,
  );

  // ===== CRM MODULE =====
  // Repositories
  container.register(
    SERVICE_KEYS.LEAD_REPOSITORY,
    () => new LeadRepositoryApi(),
    true,
  );

  container.register(
    SERVICE_KEYS.ATIVIDADE_REPOSITORY,
    () => new AtividadeRepositoryApi(),
    true,
  );

  // Use Cases - CRM (removed CreateLeadUseCase - using direct repository)

  container.register(
    SERVICE_KEYS.UPDATE_LEAD_STATUS_USE_CASE,
    () =>
      new UpdateLeadStatusUseCase(
        container.resolve(SERVICE_KEYS.LEAD_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.GET_LEADS_BY_STATUS_USE_CASE,
    () =>
      new GetLeadsByStatusUseCase(
        container.resolve(SERVICE_KEYS.LEAD_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.CREATE_ATIVIDADE_USE_CASE,
    () =>
      new CreateAtividadeUseCase(
        container.resolve(SERVICE_KEYS.ATIVIDADE_REPOSITORY),
      ),
    true,
  );

  container.register(
    SERVICE_KEYS.CONCLUIR_ATIVIDADE_USE_CASE,
    () =>
      new ConcluirAtividadeUseCase(
        container.resolve(SERVICE_KEYS.ATIVIDADE_REPOSITORY),
      ),
    true,
  );
}

// Auto-bootstrap ao importar
bootstrapContainer();
