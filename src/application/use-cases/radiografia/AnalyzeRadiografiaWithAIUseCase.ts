/**
 * FASE 2 - TASK 2.5: Analyze Radiografia with AI Use Case
 */

import { RadiografiAnalise, ProblemaDetectado } from '@/domain/entities/RadiografiAnalise';

export interface AnalyzeRadiografiaDTO {
  clinicId: string;
  patientId: string;
  prontuarioId?: string;
  imagemUrl: string;
  imagemStoragePath: string;
  tipoRadiografia: 'periapical' | 'panoramica' | 'bite_wing' | 'oclusal' | 'lateral';
  aiModel?: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-lite';
  createdBy: string;
}

export interface IRadiografiaRepository {
  save(analise: RadiografiAnalise): Promise<void>;
  findById(id: string): Promise<RadiografiAnalise | null>;
}

export interface IAIVisionService {
  analyzeRadiografia(
    imageUrl: string,
    tipoRadiografia: string,
    model: string
  ): Promise<{
    problemas: ProblemaDetectado[];
    observacoes: string;
    recomendacoes: string[];
    confidence: number;
    processingTimeMs: number;
  }>;
}

export class AnalyzeRadiografiaWithAIUseCase {
  constructor(
    private repository: IRadiografiaRepository,
    private aiService: IAIVisionService
  ) {}

  async execute(dto: AnalyzeRadiografiaDTO): Promise<RadiografiAnalise> {
    const model = dto.aiModel || 'gemini-2.5-flash';

    // Criar análise
    const analise = RadiografiAnalise.create({
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      prontuarioId: dto.prontuarioId,
      imagemUrl: dto.imagemUrl,
      imagemStoragePath: dto.imagemStoragePath,
      tipoRadiografia: dto.tipoRadiografia,
      aiModelVersion: model,
      createdBy: dto.createdBy,
    });

    // Salvar como pendente
    await this.repository.save(analise);

    // Iniciar processamento
    analise.iniciarProcessamento();
    await this.repository.save(analise);

    try {
      // Analisar com IA
      const resultado = await this.aiService.analyzeRadiografia(
        dto.imagemUrl,
        dto.tipoRadiografia,
        model
      );

      // Concluir análise
      analise.concluirAnalise(
        {
          problemas: resultado.problemas,
          observacoes: resultado.observacoes,
          recomendacoes: resultado.recomendacoes,
        },
        resultado.processingTimeMs,
        resultado.confidence
      );

      await this.repository.save(analise);
    } catch (error) {
      // Registrar erro
      analise.registrarErro(error instanceof Error ? error.message : 'Erro desconhecido');
      await this.repository.save(analise);
      throw error;
    }

    return analise;
  }
}
