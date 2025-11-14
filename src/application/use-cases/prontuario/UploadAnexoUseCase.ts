import { IAnexoRepository } from '@/domain/repositories/IAnexoRepository';
import { Anexo } from '@/domain/entities/Anexo';
import { ValidationError } from '@/infrastructure/errors/ValidationError';
import { UnauthorizedError } from '@/infrastructure/errors/UnauthorizedError';

export interface UploadAnexoDTO {
  prontuarioId: string;
  historicoId?: string;
  clinicId: string;
  tipo: 'IMAGEM' | 'DOCUMENTO' | 'RAIO_X' | 'LAUDO' | 'EXAME' | 'RECEITA' | 'ATESTADO' | 'OUTRO';
  file: File;
  descricao?: string;
  uploadedBy: string;
}

export class UploadAnexoUseCase {
  constructor(private anexoRepository: IAnexoRepository) {}

  async execute(dto: UploadAnexoDTO): Promise<Anexo> {
    // Validações
    if (!dto.prontuarioId) {
      throw new ValidationError('ID do prontuário é obrigatório');
    }

    if (!dto.file) {
      throw new ValidationError('Arquivo é obrigatório');
    }

    if (!dto.uploadedBy) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    // Validar tamanho (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (dto.file.size > MAX_SIZE) {
      throw new ValidationError('Arquivo excede o tamanho máximo de 50MB');
    }

    // Gerar path único
    const timestamp = Date.now();
    const safeFileName = dto.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${dto.prontuarioId}/${timestamp}-${safeFileName}`;

    // Upload para storage
    const url = await this.anexoRepository.uploadFile(dto.file, storagePath);

    // Criar entidade
    const anexo = Anexo.create({
      prontuarioId: dto.prontuarioId,
      historicoId: dto.historicoId,
      clinicId: dto.clinicId,
      tipo: dto.tipo,
      nomeArquivo: dto.file.name,
      storagePath: storagePath,
      url: url,
      tamanhoBytes: dto.file.size,
      mimeType: dto.file.type,
      descricao: dto.descricao,
      uploadedBy: dto.uploadedBy,
    });

    // Persistir metadados
    await this.anexoRepository.save(anexo);

    return anexo;
  }
}
