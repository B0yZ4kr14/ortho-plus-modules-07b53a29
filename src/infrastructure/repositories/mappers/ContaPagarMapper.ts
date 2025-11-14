import { ContaPagar, CategoriaContaPagar, StatusContaPagar } from '@/domain/entities/ContaPagar';
import type { Database } from '@/integrations/supabase/types';

type ContaPagarRow = Database['public']['Tables']['contas_pagar']['Row'];
type ContaPagarInsert = Database['public']['Tables']['contas_pagar']['Insert'];

/**
 * Mapper para converter entre ContaPagar (domínio) e tabela Supabase
 */
export class ContaPagarMapper {
  /**
   * Converte registro do Supabase para entidade de domínio
   */
  static toDomain(row: ContaPagarRow): ContaPagar {
    return ContaPagar.restore({
      id: row.id,
      clinicId: row.clinic_id,
      descricao: row.descricao,
      fornecedor: row.fornecedor,
      categoria: row.categoria as CategoriaContaPagar,
      valor: Number(row.valor),
      dataEmissao: new Date(row.data_emissao),
      dataVencimento: new Date(row.data_vencimento),
      dataPagamento: row.data_pagamento ? new Date(row.data_pagamento) : undefined,
      status: row.status as StatusContaPagar,
      formaPagamento: row.forma_pagamento || undefined,
      valorPago: row.valor_pago ? Number(row.valor_pago) : undefined,
      recorrente: row.recorrente || false,
      periodicidade: row.periodicidade || undefined,
      parcelaNumero: row.parcela_numero || undefined,
      parcelaTotal: row.parcela_total || undefined,
      observacoes: row.observacoes || undefined,
      anexoUrl: row.anexo_url || undefined,
      createdBy: row.created_by || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Converte entidade de domínio para formato de insert/update do Supabase
   */
  static toSupabaseInsert(conta: ContaPagar): ContaPagarInsert {
    return {
      id: conta.id,
      clinic_id: conta.clinicId,
      descricao: conta.descricao,
      fornecedor: conta.fornecedor,
      categoria: conta.categoria,
      valor: conta.valor,
      data_emissao: conta.dataEmissao.toISOString(),
      data_vencimento: conta.dataVencimento.toISOString(),
      data_pagamento: conta.dataPagamento?.toISOString(),
      status: conta.status,
      forma_pagamento: conta.formaPagamento,
      valor_pago: conta.valorPago,
      recorrente: conta.recorrente,
      periodicidade: conta.periodicidade,
      parcela_numero: conta.parcelaNumero,
      parcela_total: conta.parcelaTotal,
      observacoes: conta.observacoes,
      anexo_url: conta.anexoUrl,
      created_by: conta.createdBy,
      created_at: conta.createdAt.toISOString(),
      updated_at: conta.updatedAt.toISOString(),
    };
  }
}
