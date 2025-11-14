import { Confirmacao, ConfirmacaoProps } from '@/domain/entities/Confirmacao';
import { Database } from '@/integrations/supabase/types';

type ConfirmationRow = Database['public']['Tables']['appointment_confirmations']['Row'];
type ConfirmationInsert = Database['public']['Tables']['appointment_confirmations']['Insert'];

/**
 * Mapper para converter entre Confirmacao (Domain) e appointment_confirmations (Database)
 */
export class ConfirmacaoMapper {
  /**
   * Converte do banco de dados para entidade de domínio
   */
  static toDomain(row: ConfirmationRow): Confirmacao {
    const props: ConfirmacaoProps = {
      id: row.id,
      agendamentoId: row.appointment_id,
      phoneNumber: row.phone_number || '',
      confirmationMethod: this.mapMethodToDomain(row.confirmation_method),
      status: this.mapStatusToDomain(row.status),
      messageContent: row.message_content || undefined,
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
      errorMessage: row.error_message || undefined,
      createdAt: new Date(row.created_at),
    };

    return Confirmacao.restore(props);
  }

  /**
   * Converte da entidade de domínio para insert no banco
   */
  static toDatabase(confirmacao: Confirmacao): ConfirmationInsert {
    return {
      id: confirmacao.id,
      appointment_id: confirmacao.agendamentoId,
      phone_number: confirmacao.phoneNumber,
      confirmation_method: this.mapMethodToDatabase(confirmacao.confirmationMethod),
      status: this.mapStatusToDatabase(confirmacao.status),
      message_content: confirmacao.messageContent || null,
      sent_at: confirmacao.sentAt?.toISOString() || null,
      confirmed_at: confirmacao.confirmedAt?.toISOString() || null,
      error_message: confirmacao.errorMessage || null,
      created_at: confirmacao.createdAt.toISOString(),
    };
  }

  /**
   * Mapeia método do banco para domínio
   */
  private static mapMethodToDomain(dbMethod: string): ConfirmacaoProps['confirmationMethod'] {
    const methodMap: Record<string, ConfirmacaoProps['confirmationMethod']> = {
      'WHATSAPP': 'WHATSAPP',
      'SMS': 'SMS',
      'EMAIL': 'EMAIL',
      'TELEFONE': 'TELEFONE',
    };

    return methodMap[dbMethod.toUpperCase()] || 'WHATSAPP';
  }

  /**
   * Mapeia método do domínio para banco
   */
  private static mapMethodToDatabase(domainMethod: ConfirmacaoProps['confirmationMethod']): string {
    return domainMethod;
  }

  /**
   * Mapeia status do banco para domínio
   */
  private static mapStatusToDomain(dbStatus: string): ConfirmacaoProps['status'] {
    const statusMap: Record<string, ConfirmacaoProps['status']> = {
      'PENDING': 'PENDENTE',
      'SENT': 'ENVIADA',
      'CONFIRMED': 'CONFIRMADA',
      'ERROR': 'ERRO',
    };

    return statusMap[dbStatus.toUpperCase()] || 'PENDENTE';
  }

  /**
   * Mapeia status do domínio para banco
   */
  private static mapStatusToDatabase(domainStatus: ConfirmacaoProps['status']): string {
    const statusMap: Record<ConfirmacaoProps['status'], string> = {
      'PENDENTE': 'PENDING',
      'ENVIADA': 'SENT',
      'CONFIRMADA': 'CONFIRMED',
      'ERRO': 'ERROR',
    };

    return statusMap[domainStatus];
  }
}
