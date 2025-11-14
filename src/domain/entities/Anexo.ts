/**
 * Anexo Entity
 * Representa um anexo (arquivo, imagem, documento) do prontuário
 */
export interface AnexoProps {
  id: string;
  prontuarioId: string;
  historicoId?: string;
  clinicId: string;
  tipo: 'IMAGEM' | 'DOCUMENTO' | 'RAIO_X' | 'LAUDO' | 'EXAME' | 'RECEITA' | 'ATESTADO' | 'OUTRO';
  nomeArquivo: string;
  storagePath: string;
  url: string;
  tamanhoBytes: number;
  mimeType: string;
  descricao?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Anexo {
  private props: AnexoProps;

  private constructor(props: AnexoProps) {
    this.props = props;
  }

  static create(props: Omit<AnexoProps, 'id' | 'createdAt' | 'updatedAt'>): Anexo {
    // Validações de domínio
    if (!props.prontuarioId) {
      throw new Error('ID do prontuário é obrigatório');
    }

    if (!props.nomeArquivo || props.nomeArquivo.trim().length === 0) {
      throw new Error('Nome do arquivo é obrigatório');
    }

    if (!props.storagePath || props.storagePath.trim().length === 0) {
      throw new Error('Caminho de armazenamento é obrigatório');
    }

    if (!props.url || props.url.trim().length === 0) {
      throw new Error('URL do arquivo é obrigatória');
    }

    if (props.tamanhoBytes <= 0) {
      throw new Error('Tamanho do arquivo deve ser maior que zero');
    }

    if (!props.mimeType || props.mimeType.trim().length === 0) {
      throw new Error('Tipo MIME é obrigatório');
    }

    // Validar tamanho máximo (50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB em bytes
    if (props.tamanhoBytes > MAX_SIZE) {
      throw new Error('Arquivo excede o tamanho máximo permitido de 50MB');
    }

    const now = new Date();

    return new Anexo({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: AnexoProps): Anexo {
    return new Anexo(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get prontuarioId(): string {
    return this.props.prontuarioId;
  }

  get historicoId(): string | undefined {
    return this.props.historicoId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get tipo(): 'IMAGEM' | 'DOCUMENTO' | 'RAIO_X' | 'LAUDO' | 'EXAME' | 'RECEITA' | 'ATESTADO' | 'OUTRO' {
    return this.props.tipo;
  }

  get nomeArquivo(): string {
    return this.props.nomeArquivo;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }

  get url(): string {
    return this.props.url;
  }

  get tamanhoBytes(): number {
    return this.props.tamanhoBytes;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get uploadedBy(): string {
    return this.props.uploadedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isImagem(): boolean {
    return this.props.tipo === 'IMAGEM' || this.props.tipo === 'RAIO_X';
  }

  isDocumento(): boolean {
    return ['DOCUMENTO', 'LAUDO', 'EXAME', 'RECEITA', 'ATESTADO'].includes(this.props.tipo);
  }

  getTamanhoFormatado(): string {
    const bytes = this.props.tamanhoBytes;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getExtensao(): string {
    const parts = this.props.nomeArquivo.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  atualizarDescricao(novaDescricao: string): void {
    this.props.descricao = novaDescricao.trim();
    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos
  toObject(): AnexoProps {
    return { ...this.props };
  }
}
