import { IncidenteCaixa, TipoIncidenteCaixa } from '@/domain/entities/IncidenteCaixa';
import { IIncidenteCaixaRepository } from '@/domain/repositories/IIncidenteCaixaRepository';

export interface RegistrarIncidenteCaixaInput {
  clinicId: string;
  tipoIncidente: TipoIncidenteCaixa;
  dataIncidente: Date;
  horarioIncidente: string;
  valorPerdido?: number;
  valorCaixaMomento?: number;
  descricao?: string;
  boletimOcorrencia?: string;
  metadata?: Record<string, any>;
}

export interface RegistrarIncidenteCaixaOutput {
  incidente: IncidenteCaixa;
}

/**
 * Use Case: Registrar Incidente de Caixa
 * 
 * Registra incidentes de segurança relacionados ao caixa (roubos, furtos, etc.)
 */
export class RegistrarIncidenteCaixaUseCase {
  constructor(
    private readonly incidenteCaixaRepository: IIncidenteCaixaRepository
  ) {}

  async execute(input: RegistrarIncidenteCaixaInput): Promise<RegistrarIncidenteCaixaOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (!input.horarioIncidente?.trim()) {
      throw new Error('Horário do incidente é obrigatório');
    }
    if (input.valorPerdido !== undefined && input.valorPerdido < 0) {
      throw new Error('Valor perdido não pode ser negativo');
    }
    if (input.valorCaixaMomento !== undefined && input.valorCaixaMomento < 0) {
      throw new Error('Valor do caixa no momento não pode ser negativo');
    }

    // Calcular dia da semana
    const diaSemana = input.dataIncidente.getDay(); // 0-6 (Domingo a Sábado)

    // Criar incidente
    const incidente = IncidenteCaixa.create({
      clinicId: input.clinicId,
      tipoIncidente: input.tipoIncidente,
      dataIncidente: input.dataIncidente,
      horarioIncidente: input.horarioIncidente,
      diaSemana,
      valorPerdido: input.valorPerdido,
      valorCaixaMomento: input.valorCaixaMomento,
      descricao: input.descricao,
      boletimOcorrencia: input.boletimOcorrencia,
      metadata: input.metadata,
    });

    // Salvar no repositório
    await this.incidenteCaixaRepository.save(incidente);

    return { incidente };
  }
}
