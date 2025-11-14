import { MovimentoCaixa, TipoMovimentoCaixa, StatusMovimentoCaixa } from '@/domain/entities/MovimentoCaixa';
import type { Database } from '@/integrations/supabase/types';

type MovimentoCaixaRow = Database['public']['Tables']['caixa_movimentos']['Row'];
type MovimentoCaixaInsert = Database['public']['Tables']['caixa_movimentos']['Insert'];

/**
 * Mapper para converter entre MovimentoCaixa (domínio) e tabela Supabase
 */
export class MovimentoCaixaMapper {
  /**
   * Converte registro do Supabase para entidade de domínio
   */
  static toDomain(row: MovimentoCaixaRow): MovimentoCaixa {
    return MovimentoCaixa.restore({
      id: row.id,
      clinicId: row.clinic_id,
      caixaId: row.caixa_id || undefined,
      tipo: row.tipo as TipoMovimentoCaixa,
      valor: Number(row.valor),
      status: row.status as StatusMovimentoCaixa,
      abertoEm: row.aberto_em ? new Date(row.aberto_em) : undefined,
      fechadoEm: row.fechado_em ? new Date(row.fechado_em) : undefined,
      valorInicial: row.valor_inicial ? Number(row.valor_inicial) : undefined,
      valorFinal: row.valor_final ? Number(row.valor_final) : undefined,
      valorEsperado: row.valor_esperado ? Number(row.valor_esperado) : undefined,
      diferenca: row.diferenca ? Number(row.diferenca) : undefined,
      observacoes: row.observacoes || undefined,
      motivoSangria: row.motivo_sangria || undefined,
      horarioRisco: row.horario_risco || undefined,
      riscoCalculado: row.risco_calculado ? Number(row.risco_calculado) : undefined,
      sugeridoPorIA: row.sugerido_por_ia || undefined,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.created_at!), // Usar created_at como fallback
    });
  }

  /**
   * Converte entidade de domínio para formato de insert/update do Supabase
   */
  static toSupabaseInsert(movimento: MovimentoCaixa): MovimentoCaixaInsert {
    return {
      id: movimento.id,
      clinic_id: movimento.clinicId,
      caixa_id: movimento.caixaId,
      tipo: movimento.tipo,
      valor: movimento.valor,
      status: movimento.status,
      aberto_em: movimento.abertoEm?.toISOString(),
      fechado_em: movimento.fechadoEm?.toISOString(),
      valor_inicial: movimento.valorInicial,
      valor_final: movimento.valorFinal,
      valor_esperado: movimento.valorEsperado,
      diferenca: movimento.diferenca,
      observacoes: movimento.observacoes,
      motivo_sangria: movimento.motivoSangria,
      horario_risco: movimento.horarioRisco,
      risco_calculado: movimento.riscoCalculado,
      sugerido_por_ia: movimento.sugeridoPorIA,
      created_by: movimento.createdBy,
      created_at: movimento.createdAt.toISOString(),
    };
  }
}
