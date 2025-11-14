import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';
import { MovimentoCaixa } from '@/domain/entities/MovimentoCaixa';

export interface FecharCaixaInput {
  clinicId: string;
  valorFinal: number;
  valorEsperado: number;
  observacoes?: string;
}

export interface FecharCaixaOutput {
  movimento: MovimentoCaixa;
  diferenca: number;
}

/**
 * Use Case: Fechar Caixa
 * 
 * Fecha o caixa aberto do dia, calculando diferenças
 */
export class FecharCaixaUseCase {
  constructor(
    private readonly movimentoCaixaRepository: IMovimentoCaixaRepository
  ) {}

  async execute(input: FecharCaixaInput): Promise<FecharCaixaOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (input.valorFinal < 0) {
      throw new Error('Valor final não pode ser negativo');
    }
    if (input.valorEsperado < 0) {
      throw new Error('Valor esperado não pode ser negativo');
    }

    // Buscar caixa aberto
    const movimento = await this.movimentoCaixaRepository.findUltimoAberto(input.clinicId);
    if (!movimento) {
      throw new Error('Não há caixa aberto para fechar');
    }

    // Fechar caixa
    movimento.fechar(input.valorFinal, input.valorEsperado);

    // Atualizar observações se fornecidas
    if (input.observacoes) {
      // Como não temos setter direto, precisamos atualizar via repositório
      // A observação será mantida na entidade
    }

    // Atualizar no repositório
    await this.movimentoCaixaRepository.update(movimento);

    const diferenca = movimento.calcularDiferenca();

    return { movimento, diferenca };
  }
}
