import { Orcamento, OrcamentoProps } from '@/domain/entities/Orcamento';
import { Database } from '@/integrations/supabase/types';

type BudgetRow = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];

/**
 * Mapper: Orcamento Entity <-> Supabase budgets table
 */
export class OrcamentoMapper {
  /**
   * Converte row do Supabase para Entidade de Domínio
   */
  static toDomain(row: BudgetRow): Orcamento {
    const props: OrcamentoProps = {
      id: row.id,
      clinicId: row.clinic_id,
      patientId: row.patient_id,
      numeroOrcamento: row.numero_orcamento,
      titulo: row.titulo,
      descricao: row.descricao ?? undefined,
      status: this.mapStatusToDomain(row.status),
      tipoPagamento: this.mapTipoPagamentoToDomain(row.tipo_plano),
      valorSubtotal: row.valor_subtotal ?? 0,
      descontoPercentual: row.desconto_percentual ?? 0,
      descontoValor: row.desconto_valor ?? 0,
      valorTotal: row.valor_total ?? 0,
      validadeDias: row.validade_dias ?? 30,
      dataExpiracao: new Date(row.data_expiracao!),
      aprovadoEm: row.aprovado_em ? new Date(row.aprovado_em) : undefined,
      aprovadoPor: row.aprovado_por ?? undefined,
      rejeitadoEm: row.rejeitado_em ? new Date(row.rejeitado_em) : undefined,
      rejeitadoPor: row.rejeitado_por ?? undefined,
      motivoRejeicao: row.motivo_rejeicao ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
    };

    return Orcamento.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do Supabase
   */
  static toSupabaseInsert(entity: Orcamento): BudgetInsert {
    return {
      id: entity.id,
      clinic_id: entity.clinicId,
      patient_id: entity.patientId,
      numero_orcamento: entity.numeroOrcamento,
      titulo: entity.titulo,
      descricao: entity.descricao,
      status: this.mapStatusToSupabase(entity.status),
      tipo_plano: this.mapTipoPagamentoToSupabase(entity.tipoPagamento),
      valor_subtotal: entity.valorSubtotal,
      desconto_percentual: entity.descontoPercentual,
      desconto_valor: entity.descontoValor,
      valor_total: entity.valorTotal,
      validade_dias: entity.validadeDias,
      data_expiracao: entity.dataExpiracao.toISOString(),
      aprovado_em: entity.aprovadoEm?.toISOString(),
      aprovado_por: entity.aprovadoPor,
      rejeitado_em: entity.rejeitadoEm?.toISOString(),
      rejeitado_por: entity.rejeitadoPor,
      motivo_rejeicao: entity.motivoRejeicao,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      created_by: entity.createdBy,
    };
  }

  /**
   * Mapeia status do Supabase para domínio
   */
  private static mapStatusToDomain(status: string): OrcamentoProps['status'] {
    const statusMap: Record<string, OrcamentoProps['status']> = {
      'RASCUNHO': 'RASCUNHO',
      'PENDENTE': 'PENDENTE',
      'APROVADO': 'APROVADO',
      'REJEITADO': 'REJEITADO',
      'EXPIRADO': 'EXPIRADO',
    };
    return statusMap[status] || 'RASCUNHO';
  }

  /**
   * Mapeia status do domínio para Supabase
   */
  private static mapStatusToSupabase(status: OrcamentoProps['status']): string {
    return status;
  }

  /**
   * Mapeia tipo de pagamento do Supabase para domínio
   */
  private static mapTipoPagamentoToDomain(tipo: string): OrcamentoProps['tipoPagamento'] {
    const tipoMap: Record<string, OrcamentoProps['tipoPagamento']> = {
      'AVISTA': 'AVISTA',
      'A VISTA': 'AVISTA',
      'PARCELADO': 'PARCELADO',
      'CONVENIO': 'CONVENIO',
      'CONVÊNIO': 'CONVENIO',
    };
    return tipoMap[tipo] || 'AVISTA';
  }

  /**
   * Mapeia tipo de pagamento do domínio para Supabase
   */
  private static mapTipoPagamentoToSupabase(tipo: OrcamentoProps['tipoPagamento']): string {
    return tipo;
  }
}
