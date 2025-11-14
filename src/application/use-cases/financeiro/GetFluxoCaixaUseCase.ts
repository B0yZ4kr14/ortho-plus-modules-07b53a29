import { IContaPagarRepository } from '@/domain/repositories/IContaPagarRepository';
import { IContaReceberRepository } from '@/domain/repositories/IContaReceberRepository';
import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';

export interface GetFluxoCaixaInput {
  clinicId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FluxoCaixaData {
  totalReceber: number;
  totalPagar: number;
  totalRecebido: number;
  totalPago: number;
  saldoReceber: number;
  saldoPagar: number;
  contasReceberVencidas: number;
  contasPagarVencidas: number;
  caixaAtual: {
    isAberto: boolean;
    valorInicial?: number;
    valorAtual?: number;
  };
}

export interface GetFluxoCaixaOutput {
  data: FluxoCaixaData;
}

/**
 * Use Case: Obter Fluxo de Caixa
 * 
 * Retorna dados consolidados do fluxo de caixa para dashboards
 */
export class GetFluxoCaixaUseCase {
  constructor(
    private readonly contaPagarRepository: IContaPagarRepository,
    private readonly contaReceberRepository: IContaReceberRepository,
    private readonly movimentoCaixaRepository: IMovimentoCaixaRepository
  ) {}

  async execute(input: GetFluxoCaixaInput): Promise<GetFluxoCaixaOutput> {
    // Validações de input
    if (!input.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    // Buscar dados
    const contasPagar = input.startDate && input.endDate
      ? await this.contaPagarRepository.findByPeriodo(input.clinicId, input.startDate, input.endDate)
      : await this.contaPagarRepository.findByClinicId(input.clinicId);

    const contasReceber = input.startDate && input.endDate
      ? await this.contaReceberRepository.findByPeriodo(input.clinicId, input.startDate, input.endDate)
      : await this.contaReceberRepository.findByClinicId(input.clinicId);

    const caixaAberto = await this.movimentoCaixaRepository.findUltimoAberto(input.clinicId);

    // Calcular totais - Contas a Receber
    const totalReceber = contasReceber.reduce((acc, c) => acc + c.valor, 0);
    const totalRecebido = contasReceber
      .filter((c) => c.isRecebida())
      .reduce((acc, c) => acc + (c.valorPago || 0), 0);
    const saldoReceber = contasReceber
      .filter((c) => c.isPendente())
      .reduce((acc, c) => acc + c.calcularSaldoReceber(), 0);
    const contasReceberVencidas = contasReceber.filter((c) => c.isVencida()).length;

    // Calcular totais - Contas a Pagar
    const totalPagar = contasPagar.reduce((acc, c) => acc + c.valor, 0);
    const totalPago = contasPagar
      .filter((c) => c.isPaga())
      .reduce((acc, c) => acc + (c.valorPago || 0), 0);
    const saldoPagar = contasPagar
      .filter((c) => c.isPendente())
      .reduce((acc, c) => acc + c.calcularSaldoDevedor(), 0);
    const contasPagarVencidas = contasPagar.filter((c) => c.isVencida()).length;

    // Status do caixa
    const caixaAtual = {
      isAberto: !!caixaAberto,
      valorInicial: caixaAberto?.valorInicial,
      valorAtual: undefined, // Seria calculado com base em movimentações
    };

    const data: FluxoCaixaData = {
      totalReceber,
      totalPagar,
      totalRecebido,
      totalPago,
      saldoReceber,
      saldoPagar,
      contasReceberVencidas,
      contasPagarVencidas,
      caixaAtual,
    };

    return { data };
  }
}
