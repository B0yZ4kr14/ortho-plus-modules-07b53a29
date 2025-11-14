import { Anexo, AnexoProps } from '@/domain/entities/Anexo';
import { Database } from '@/integrations/supabase/types';

type AnexoRow = Database['public']['Tables']['pep_anexos']['Row'];

/**
 * Mapper para conversão entre Anexo (domínio) e dados do Supabase
 */
export class AnexoMapper {
  static toDomain(raw: AnexoRow): Anexo {
    // Gerar URL a partir do caminho de storage
    const url = raw.caminho_storage; // Simplificado por enquanto
    
    const props: AnexoProps = {
      id: raw.id,
      prontuarioId: raw.prontuario_id,
      historicoId: raw.historico_id || undefined,
      clinicId: '', // Tabela não tem clinic_id, será preenchido via query
      tipo: (raw.tipo_arquivo as any) || 'OUTRO',
      nomeArquivo: raw.nome_arquivo,
      storagePath: raw.caminho_storage,
      url: url,
      tamanhoBytes: raw.tamanho_bytes || 0,
      mimeType: raw.mime_type,
      descricao: raw.descricao || undefined,
      uploadedBy: raw.uploaded_by,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.created_at), // Tabela não tem updated_at
    };

    return Anexo.restore(props);
  }

  static toPersistence(anexo: Anexo): Partial<AnexoRow> {
    return {
      id: anexo.id,
      prontuario_id: anexo.prontuarioId,
      historico_id: anexo.historicoId || null,
      tipo_arquivo: anexo.tipo,
      nome_arquivo: anexo.nomeArquivo,
      caminho_storage: anexo.storagePath,
      tamanho_bytes: anexo.tamanhoBytes,
      mime_type: anexo.mimeType,
      descricao: anexo.descricao || null,
    };
  }

  static toInsert(anexo: Anexo): Database['public']['Tables']['pep_anexos']['Insert'] {
    return {
      prontuario_id: anexo.prontuarioId,
      historico_id: anexo.historicoId || null,
      tipo_arquivo: anexo.tipo,
      nome_arquivo: anexo.nomeArquivo,
      caminho_storage: anexo.storagePath,
      tamanho_bytes: anexo.tamanhoBytes,
      mime_type: anexo.mimeType,
      descricao: anexo.descricao || null,
      uploaded_by: anexo.uploadedBy,
    };
  }
}
