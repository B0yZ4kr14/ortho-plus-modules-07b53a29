import { MovimentoCaixa } from '@/domain/entities/MovimentoCaixa';
import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';

export interface RegistrarSangriaInput {
  clinicId: string;
  valor: number;
  motivo: string;
  horarioRisco?: string;
  riscoCalculado?: number;
  sugeridoPorIA?: boolean;
  observacoes?: string;
  createdBy: string;
}

export interface RegistrarSangriaOutput {
  movimento: MovimentoCaixa;
}

/**
 * Use Case: Registrar Sangria
 * 
 * Registra uma retirada de dinheiro do caixa (sangria)
 */
export class RegistrarSangriaUseCase {
  constructor(
    private readonly movimentoCaixaRepository: IMovimentoCaixaRepository
  ) {}

  async execute(input: RegistrarSangriaInput): Promise<RegistrarSangriaOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }
    if (input.valor <= 0) {
      throw new Error('Valor da sangria deve ser maior que zero');
    }
    if (!input.motivo?.trim()) {
      throw new Error('Motivo da sangria é obrigatório');
    }
    if (!input.createdBy?.trim()) {
      throw new Error('Usuário é obrigatório');
    }

    // Verificar se existe caixa aberto
    const caixaAberto = await this.movimentoCaixaRepository.findUltimoAberto(input.clinicId);
    if (!caixaAberto) {
      throw new Error('Não há caixa aberto. Abra um caixa antes de registrar sangria.');
    }

    // Criar movimento de sangria
    const movimento = MovimentoCaixa.create({
      clinicId: input.clinicId,
      caixaId: caixaAberto.id,
      tipo: 'SANGRIA',
      valor: input.valor,
      status: 'PROCESSADO',
      motivoSangria: input.motivo,
      horarioRisco: input.horarioRisco,
      riscoCalculado: input.riscoCalculado,
      sugeridoPorIA: input.sugeridoPorIA,
      observacoes: input.observacoes,
      createdBy: input.createdBy,
    });

    // Salvar no repositório
    await this.movimentoCaixaRepository.save(movimento);

    return { movimento };
  }
}
