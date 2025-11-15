import { Orcamento } from '../../domain/entities/Orcamento';
import { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export interface CreateOrcamentoInput {
  clinicId: string;
  patientId: string;
  createdBy: string;
  titulo: string;
  descricao?: string;
  tipoPlano: string;
  validadeDias: number;
  valorSubtotal: number;
  descontoPercentual?: number;
  descontoValor?: number;
  observacoes?: string;
}

export interface CreateOrcamentoOutput {
  orcamento: Orcamento;
}

export class CreateOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: CreateOrcamentoInput): Promise<CreateOrcamentoOutput> {
    // Calcular valor total
    let valorTotal = input.valorSubtotal;
    if (input.descontoPercentual) {
      valorTotal -= (input.valorSubtotal * input.descontoPercentual) / 100;
    }
    if (input.descontoValor) {
      valorTotal -= input.descontoValor;
    }

    const orcamento = Orcamento.create({
      ...input,
      valorTotal: Math.max(0, valorTotal),
    });
    
    await this.orcamentoRepository.save(orcamento);
    return { orcamento };
  }
}
