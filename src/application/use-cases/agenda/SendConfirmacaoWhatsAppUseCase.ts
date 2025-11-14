import { Confirmacao } from '@/domain/entities/Confirmacao';
import { IConfirmacaoRepository } from '@/domain/repositories/IConfirmacaoRepository';
import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';

export interface SendConfirmacaoWhatsAppInput {
  agendamentoId: string;
  phoneNumber: string;
  messageTemplate?: string;
}

export class SendConfirmacaoWhatsAppUseCase {
  constructor(
    private confirmacaoRepository: IConfirmacaoRepository,
    private agendamentoRepository: IAgendamentoRepository
  ) {}

  async execute(input: SendConfirmacaoWhatsAppInput): Promise<void> {
    // Validações de input
    if (!input.agendamentoId?.trim()) {
      throw new Error('ID do agendamento é obrigatório');
    }

    if (!input.phoneNumber?.trim()) {
      throw new Error('Número de telefone é obrigatório');
    }

    // Verificar se agendamento existe
    const agendamento = await this.agendamentoRepository.findById(input.agendamentoId);

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // Verificar se já existe confirmação para este agendamento
    const confirmacaoExistente = await this.confirmacaoRepository.findByAgendamentoId(
      input.agendamentoId
    );

    let confirmacao: Confirmacao;

    if (confirmacaoExistente) {
      // Se já existe, atualizar
      confirmacao = confirmacaoExistente;
    } else {
      // Se não existe, criar nova
      confirmacao = Confirmacao.create({
        agendamentoId: input.agendamentoId,
        phoneNumber: input.phoneNumber,
        confirmationMethod: 'WHATSAPP',
      });
    }

    // Preparar mensagem
    const messageContent = input.messageTemplate || this.generateDefaultMessage(agendamento);

    // Marcar como enviada
    try {
      confirmacao.marcarEnviada(messageContent);

      // Persistir
      if (confirmacaoExistente) {
        await this.confirmacaoRepository.update(confirmacao);
      } else {
        await this.confirmacaoRepository.save(confirmacao);
      }

      // Aqui seria feita a integração real com WhatsApp API
      // Por enquanto, apenas simulamos o envio
      console.log('Mensagem WhatsApp enviada:', {
        to: input.phoneNumber,
        message: messageContent,
      });

    } catch (error) {
      // Se houver erro no envio, marcar como erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      confirmacao.marcarErro(errorMessage);
      
      if (confirmacaoExistente) {
        await this.confirmacaoRepository.update(confirmacao);
      } else {
        await this.confirmacaoRepository.save(confirmacao);
      }
      
      throw error;
    }
  }

  private generateDefaultMessage(agendamento: any): string {
    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(agendamento.startTime);

    return `Olá! Confirmamos seu agendamento "${agendamento.title}" para ${dataFormatada}. Aguardamos você!`;
  }
}
