import { Evolucao, EvolucaoProps } from '@/domain/entities/Evolucao';
import { Database } from '@/integrations/supabase/types';

type EvolucaoRow = Database['public']['Tables']['pep_evolucoes']['Row'];

/**
 * Mapper para conversão entre Evolucao (domínio) e dados do Supabase
 */
export class EvolucaoMapper {
  static toDomain(raw: EvolucaoRow): Evolucao {
    // A tabela atual é muito simples, vamos adaptar
    const props: EvolucaoProps = {
      id: raw.id,
      tratamentoId: raw.tratamento_id,
      prontuarioId: '', // Será preenchido via query com join
      clinicId: '', // Será preenchido via query com join
      data: new Date(raw.data_evolucao),
      descricao: raw.descricao,
      procedimentosRealizados: [raw.tipo], // Usar o tipo como procedimento
      observacoes: undefined,
      assinadoPor: raw.created_by,
      assinadoEm: new Date(raw.created_at), // Considerar criação como assinatura
      createdBy: raw.created_by,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.created_at), // Tabela não tem updated_at
    };

    return Evolucao.restore(props);
  }

  static toPersistence(evolucao: Evolucao): Partial<EvolucaoRow> {
    return {
      id: evolucao.id,
      tratamento_id: evolucao.tratamentoId,
      data_evolucao: evolucao.data.toISOString().split('T')[0],
      descricao: evolucao.descricao,
      tipo: evolucao.procedimentosRealizados[0] || 'Evolução',
    };
  }

  static toInsert(evolucao: Evolucao): Database['public']['Tables']['pep_evolucoes']['Insert'] {
    return {
      tratamento_id: evolucao.tratamentoId,
      data_evolucao: evolucao.data.toISOString().split('T')[0],
      descricao: evolucao.descricao,
      tipo: evolucao.procedimentosRealizados[0] || 'Evolução',
      created_by: evolucao.createdBy,
    };
  }
}
