import { MovimentoCaixa } from '@/domain/entities/MovimentoCaixa';
import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';

export interface AbrirCaixaInput {
  clinicId: string;
  valorInicial: number;
  observacoes?: string;
  createdBy: string;
}

export interface AbrirCaixaOutput {
  movimento: MovimentoCaixa;
}

/**
 * Use Case: Abrir Caixa
 * 
 * Abre um novo caixa para o dia
 */
export class AbrirCaixaUseCase {
  constructor(
    private readonly movimentoCaixaRepository: IMovimentoCaixaRepository
  ) {}

  async execute(input: AbrirCaixaInput): Promise<AbrirCaixaOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (input.valorInicial < 0) {
      throw new Error('Valor inicial não pode ser negativo');
    }
    if (!input.createdBy?.trim()) {
      throw new Error('Usuário é obrigatório');
    }

    // Verificar se já existe caixa aberto
    const caixaAberto = await this.movimentoCaixaRepository.findUltimoAberto(input.clinicId);
    if (caixaAberto) {
      throw new Error('Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.');
    }

    // Criar movimento de abertura
    const movimento = MovimentoCaixa.create({
      clinicId: input.clinicId,
      tipo: 'ABERTURA',
      valor: input.valorInicial,
      status: 'ABERTO',
      observacoes: input.observacoes,
      createdBy: input.createdBy,
    });

    // Abrir caixa
    movimento.abrir(input.valorInicial);

    // Salvar no repositório
    await this.movimentoCaixaRepository.save(movimento);

    return { movimento };
  }
}
