/**
 * Orcamento Data Adapter
 * Converte entre formato API (domínio) e Frontend para orçamentos
 */

interface OrcamentoAPI {
  id: string;
  numeroOrcamento: string;
  clinicId: string;
  patientId: string;
  titulo: string;
  descricao?: string;
  status: string;
  valorTotal: number;
  valorSubtotal: number;
  descontoPercentual?: number;
  descontoValor?: number;
  dataExpiracao: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface OrcamentoFrontend {
  id: string;
  numero_orcamento: string;
  clinic_id: string;
  patient_id: string;
  titulo: string;
  descricao?: string;
  status: string;
  valor_total: number;
  valor_subtotal: number;
  desconto_percentual?: number;
  desconto_valor?: number;
  data_expiracao: string;
  created_at: string;
  updated_at: string;
}

export class OrcamentoAdapter {
  static toFrontend(apiOrcamento: OrcamentoAPI): OrcamentoFrontend {
    return {
      id: apiOrcamento.id,
      numero_orcamento: apiOrcamento.numeroOrcamento,
      clinic_id: apiOrcamento.clinicId,
      patient_id: apiOrcamento.patientId,
      titulo: apiOrcamento.titulo,
      descricao: apiOrcamento.descricao,
      status: apiOrcamento.status,
      valor_total: apiOrcamento.valorTotal,
      valor_subtotal: apiOrcamento.valorSubtotal,
      desconto_percentual: apiOrcamento.descontoPercentual,
      desconto_valor: apiOrcamento.descontoValor,
      data_expiracao: apiOrcamento.dataExpiracao.toISOString(),
      created_at: apiOrcamento.createdAt.toISOString(),
      updated_at: apiOrcamento.updatedAt.toISOString(),
    };
  }

  static toAPI(frontendOrcamento: Partial<OrcamentoFrontend>): Partial<OrcamentoAPI> {
    return {
      numeroOrcamento: frontendOrcamento.numero_orcamento,
      clinicId: frontendOrcamento.clinic_id,
      patientId: frontendOrcamento.patient_id,
      titulo: frontendOrcamento.titulo,
      descricao: frontendOrcamento.descricao,
      status: frontendOrcamento.status,
      valorTotal: frontendOrcamento.valor_total,
      valorSubtotal: frontendOrcamento.valor_subtotal,
      descontoPercentual: frontendOrcamento.desconto_percentual,
      descontoValor: frontendOrcamento.desconto_valor,
      dataExpiracao: frontendOrcamento.data_expiracao 
        ? new Date(frontendOrcamento.data_expiracao) 
        : undefined,
      createdAt: frontendOrcamento.created_at 
        ? new Date(frontendOrcamento.created_at) 
        : undefined,
      updatedAt: frontendOrcamento.updated_at 
        ? new Date(frontendOrcamento.updated_at) 
        : undefined,
    };
  }

  static toFrontendList(apiOrcamentos: OrcamentoAPI[]): OrcamentoFrontend[] {
    return apiOrcamentos.map(orcamento => this.toFrontend(orcamento));
  }
}
