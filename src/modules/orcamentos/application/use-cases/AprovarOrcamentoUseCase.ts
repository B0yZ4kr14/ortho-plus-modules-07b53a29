import { Orcamento } from '../../domain/entities/Orcamento';
import { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export interface AprovarOrcamentoInput {
  orcamentoId: string;
  aprovadoPor: string;
}

export interface AprovarOrcamentoOutput {
  orcamento: Orcamento;
}

export class AprovarOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: AprovarOrcamentoInput): Promise<AprovarOrcamentoOutput> {
    const orcamento = await this.orcamentoRepository.findById(input.orcamentoId);
    
    if (!orcamento) {
      throw new Error('Orçamento não encontrado');
    }

    orcamento.aprovar(input.aprovadoPor);
    await this.orcamentoRepository.update(orcamento);

    return { orcamento };
  }
}
