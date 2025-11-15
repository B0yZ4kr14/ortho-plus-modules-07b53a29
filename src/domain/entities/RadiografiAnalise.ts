/**
 * FASE 2 - TASK 2.5: IA Radiografia Domain Entity
 * Representa uma análise de radiografia por IA
 */

export type TipoRadiografia = 'periapical' | 'panoramica' | 'bite_wing' | 'oclusal' | 'lateral';
export type StatusAnalise = 'pendente' | 'processando' | 'concluida' | 'erro' | 'revisada';
export type AIModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-lite';

export interface ProblemaDetectado {
  tipo: string;
  localizacao?: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  confidence: number;
  descricao: string;
}

export interface RadiografiAnaliseProps {
  id: string;
  clinicId: string;
  patientId: string;
  prontuarioId?: string;
  
  // Imagem
  imagemUrl: string;
  imagemStoragePath: string;
  tipoRadiografia: TipoRadiografia;
  
  // Análise IA
  resultadoIa?: {
    problemas: ProblemaDetectado[];
    observacoes: string;
    recomendacoes: string[];
  };
  confidenceScore?: number;
  problemasDetectados?: number;
  aiModelVersion: AIModel;
  aiProcessingTimeMs?: number;
  
  // Status
  statusAnalise: StatusAnalise;
  autoApproved: boolean;
  
  // Revisão humana
  revisadoPorDentista: boolean;
  revisadoPor?: string;
  revisadoEm?: Date;
  observacoesDentista?: string;
  
  // Feedback
  feedbackRating?: number; // 1-5
  feedbackComments?: string;
  
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export class RadiografiAnalise {
  private constructor(private props: RadiografiAnaliseProps) {}

  static create(
    props: Omit<RadiografiAnaliseProps, 'id' | 'statusAnalise' | 'revisadoPorDentista' | 'autoApproved' | 'createdAt' | 'updatedAt'>
  ): RadiografiAnalise {
    if (!props.clinicId || !props.patientId || !props.imagemUrl || !props.createdBy) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    return new RadiografiAnalise({
      ...props,
      id: crypto.randomUUID(),
      statusAnalise: 'pendente',
      revisadoPorDentista: false,
      autoApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: RadiografiAnaliseProps): RadiografiAnalise {
    return new RadiografiAnalise(props);
  }

  // Getters
  get id() { return this.props.id; }
  get clinicId() { return this.props.clinicId; }
  get patientId() { return this.props.patientId; }
  get imagemUrl() { return this.props.imagemUrl; }
  get tipoRadiografia() { return this.props.tipoRadiografia; }
  get statusAnalise() { return this.props.statusAnalise; }
  get resultadoIa() { return this.props.resultadoIa; }
  get confidenceScore() { return this.props.confidenceScore; }
  get revisadoPorDentista() { return this.props.revisadoPorDentista; }

  // Domain methods
  iniciarProcessamento(): void {
    if (this.props.statusAnalise !== 'pendente') {
      throw new Error('Análise não está pendente');
    }

    this.props.statusAnalise = 'processando';
    this.props.updatedAt = new Date();
  }

  concluirAnalise(
    resultado: {
      problemas: ProblemaDetectado[];
      observacoes: string;
      recomendacoes: string[];
    },
    processingTimeMs: number,
    confidence: number
  ): void {
    if (this.props.statusAnalise !== 'processando') {
      throw new Error('Análise não está em processamento');
    }

    this.props.statusAnalise = 'concluida';
    this.props.resultadoIa = resultado;
    this.props.problemasDetectados = resultado.problemas.length;
    this.props.confidenceScore = confidence;
    this.props.aiProcessingTimeMs = processingTimeMs;

    // Auto-aprovar se confidence alta e sem problemas críticos
    const temProblemasCriticos = resultado.problemas.some(p => p.severidade === 'critica');
    if (confidence >= 90 && !temProblemasCriticos) {
      this.props.autoApproved = true;
    }

    this.props.updatedAt = new Date();
  }

  registrarErro(mensagem: string): void {
    this.props.statusAnalise = 'erro';
    this.props.observacoesDentista = mensagem;
    this.props.updatedAt = new Date();
  }

  revisar(dentistaId: string, observacoes: string): void {
    if (this.props.statusAnalise !== 'concluida') {
      throw new Error('Análise deve estar concluída para revisão');
    }

    this.props.statusAnalise = 'revisada';
    this.props.revisadoPorDentista = true;
    this.props.revisadoPor = dentistaId;
    this.props.revisadoEm = new Date();
    this.props.observacoesDentista = observacoes;
    this.props.updatedAt = new Date();
  }

  adicionarFeedback(rating: number, comments?: string): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating deve estar entre 1 e 5');
    }

    this.props.feedbackRating = rating;
    if (comments) {
      this.props.feedbackComments = comments;
    }
    this.props.updatedAt = new Date();
  }

  calcularAcuracia(): number {
    // Baseado no confidence e problemas detectados
    if (!this.props.confidenceScore) return 0;
    
    let score = this.props.confidenceScore;
    
    // Penalizar se não foi aprovado automaticamente
    if (!this.props.autoApproved) {
      score *= 0.9;
    }
    
    // Bonus se foi revisado e confirmado
    if (this.props.revisadoPorDentista && this.props.feedbackRating && this.props.feedbackRating >= 4) {
      score *= 1.1;
    }
    
    return Math.min(score, 100);
  }

  toObject(): RadiografiAnaliseProps {
    return { ...this.props };
  }
}

/**
 * Template de Laudo
 */
export interface LaudoTemplateProps {
  id: string;
  clinicId: string;
  nomeTemplate: string;
  tipoRadiografia: TipoRadiografia;
  templateMarkdown: string;
  variaveisDisponiveis: string[];
  isDefault: boolean;
  createdAt: Date;
  createdBy: string;
}

export class LaudoTemplate {
  private constructor(private props: LaudoTemplateProps) {}

  static create(
    props: Omit<LaudoTemplateProps, 'id' | 'isDefault' | 'createdAt'>
  ): LaudoTemplate {
    return new LaudoTemplate({
      ...props,
      id: crypto.randomUUID(),
      isDefault: false,
      createdAt: new Date(),
    });
  }

  static restore(props: LaudoTemplateProps): LaudoTemplate {
    return new LaudoTemplate(props);
  }

  get id() { return this.props.id; }
  get nomeTemplate() { return this.props.nomeTemplate; }
  get templateMarkdown() { return this.props.templateMarkdown; }

  definirComoPadrao(): void {
    this.props.isDefault = true;
  }

  gerarLaudo(variaveis: Record<string, any>): string {
    let laudo = this.props.templateMarkdown;

    // Substituir variáveis
    Object.entries(variaveis).forEach(([key, value]) => {
      laudo = laudo.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return laudo;
  }

  toObject(): LaudoTemplateProps {
    return { ...this.props };
  }
}
