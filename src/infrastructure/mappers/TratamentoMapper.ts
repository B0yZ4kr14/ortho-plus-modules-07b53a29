import { Tratamento, TratamentoProps } from '@/domain/entities/Tratamento';
import { Database } from '@/integrations/supabase/types';

type TratamentoRow = Database['public']['Tables']['pep_tratamentos']['Row'];

/**
 * Mapper para conversão entre Tratamento (domínio) e dados do Supabase
 */
export class TratamentoMapper {
  static toDomain(raw: TratamentoRow): Tratamento {
    // Buscar clinic_id via join ou assumir (precisará ser feito na query)
    const props: TratamentoProps = {
      id: raw.id,
      prontuarioId: raw.prontuario_id,
      clinicId: '', // Será preenchido via query com join
      titulo: raw.titulo,
      descricao: raw.descricao || '',
      denteCodigo: raw.dente_codigo || undefined,
      procedimentoId: raw.procedimento_id || undefined,
      status: (raw.status as any) || 'PLANEJADO',
      dataInicio: new Date(raw.data_inicio),
      dataTermino: raw.data_conclusao ? new Date(raw.data_conclusao) : undefined,
      valorEstimado: raw.valor_estimado || undefined,
      valorCobrado: undefined, // Campo não existe na tabela atual
      observacoes: raw.observacoes || undefined,
      createdBy: raw.created_by,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };

    return Tratamento.restore(props);
  }

  static toPersistence(tratamento: Tratamento): Partial<TratamentoRow> {
    return {
      id: tratamento.id,
      prontuario_id: tratamento.prontuarioId,
      titulo: tratamento.titulo,
      descricao: tratamento.descricao,
      dente_codigo: tratamento.denteCodigo || null,
      procedimento_id: tratamento.procedimentoId || null,
      status: tratamento.status,
      data_inicio: tratamento.dataInicio.toISOString().split('T')[0],
      data_conclusao: tratamento.dataTermino?.toISOString().split('T')[0] || null,
      valor_estimado: tratamento.valorEstimado || null,
      observacoes: tratamento.observacoes || null,
      updated_at: tratamento.updatedAt.toISOString(),
    };
  }

  static toInsert(tratamento: Tratamento): Database['public']['Tables']['pep_tratamentos']['Insert'] {
    return {
      prontuario_id: tratamento.prontuarioId,
      titulo: tratamento.titulo,
      descricao: tratamento.descricao,
      dente_codigo: tratamento.denteCodigo || null,
      procedimento_id: tratamento.procedimentoId || null,
      status: tratamento.status,
      data_inicio: tratamento.dataInicio.toISOString().split('T')[0],
      data_conclusao: tratamento.dataTermino?.toISOString().split('T')[0] || null,
      valor_estimado: tratamento.valorEstimado || null,
      observacoes: tratamento.observacoes || null,
      created_by: tratamento.createdBy,
    };
  }
}
