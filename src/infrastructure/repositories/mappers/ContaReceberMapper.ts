import { ContaReceber, StatusContaReceber } from '@/domain/entities/ContaReceber';
import type { Database } from '@/integrations/supabase/types';

type ContaReceberRow = Database['public']['Tables']['contas_receber']['Row'];
type ContaReceberInsert = Database['public']['Tables']['contas_receber']['Insert'];

/**
 * Mapper para converter entre ContaReceber (domínio) e tabela Supabase
 */
export class ContaReceberMapper {
  /**
   * Converte registro do Supabase para entidade de domínio
   */
  static toDomain(row: ContaReceberRow): ContaReceber {
    return ContaReceber.restore({
      id: row.id,
      clinicId: row.clinic_id,
      patientId: row.patient_id || undefined,
      descricao: row.descricao,
      valor: Number(row.valor),
      dataEmissao: new Date(row.data_emissao),
      dataVencimento: new Date(row.data_vencimento),
      dataPagamento: row.data_pagamento ? new Date(row.data_pagamento) : undefined,
      status: row.status as StatusContaReceber,
      formaPagamento: row.forma_pagamento || undefined,
      valorPago: row.valor_pago ? Number(row.valor_pago) : undefined,
      parcelaNumero: row.parcela_numero || undefined,
      parcelaTotal: row.parcela_total || undefined,
      observacoes: row.observacoes || undefined,
      createdBy: row.created_by || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Converte entidade de domínio para formato de insert/update do Supabase
   */
  static toSupabaseInsert(conta: ContaReceber): ContaReceberInsert {
    return {
      id: conta.id,
      clinic_id: conta.clinicId,
      patient_id: conta.patientId,
      descricao: conta.descricao,
      valor: conta.valor,
      data_emissao: conta.dataEmissao.toISOString(),
      data_vencimento: conta.dataVencimento.toISOString(),
      data_pagamento: conta.dataPagamento?.toISOString(),
      status: conta.status,
      forma_pagamento: conta.formaPagamento,
      valor_pago: conta.valorPago,
      parcela_numero: conta.parcelaNumero,
      parcela_total: conta.parcelaTotal,
      observacoes: conta.observacoes,
      created_by: conta.createdBy,
      created_at: conta.createdAt.toISOString(),
      updated_at: conta.updatedAt.toISOString(),
    };
  }
}
