import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CryptoPaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
}

interface PaymentStatus {
  status: string;
  confirmations: number;
  requiredConfirmations: number;
  transactionId?: string;
  confirmedAt?: string;
}

export function CryptoPaymentStatus({ paymentId, onStatusChange }: CryptoPaymentStatusProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`payment:${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_payments',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          console.log('Payment updated:', payload);
          const newStatus = payload.new as any;
          setPaymentStatus({
            status: newStatus.status,
            confirmations: newStatus.confirmations || 0,
            requiredConfirmations: 3,
            transactionId: newStatus.transaction_id,
            confirmedAt: newStatus.confirmed_at,
          });
          onStatusChange?.(newStatus.status);

          if (newStatus.status === 'CONFIRMED') {
            toast.success('Pagamento confirmado!', {
              description: 'Seu pagamento em criptomoeda foi confirmado com sucesso.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, onStatusChange]);

  const fetchPaymentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('status, confirmations, transaction_id, confirmed_at')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      setPaymentStatus({
        status: data.status,
        confirmations: data.confirmations || 0,
        requiredConfirmations: 3,
        transactionId: data.transaction_id,
        confirmedAt: data.confirmed_at,
      });
    } catch (error) {
      console.error('Error fetching payment status:', error);
      toast.error('Erro ao buscar status do pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Pagamento não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'PENDING':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'PROCESSING':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'EXPIRED':
      case 'FAILED':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus.status) {
      case 'PENDING':
        return 'Aguardando Pagamento';
      case 'PROCESSING':
        return 'Processando Pagamento';
      case 'CONFIRMED':
        return 'Pagamento Confirmado';
      case 'EXPIRED':
        return 'Pagamento Expirado';
      case 'FAILED':
        return 'Pagamento Falhou';
      default:
        return 'Status Desconhecido';
    }
  };

  const confirmationProgress =
    (paymentStatus.confirmations / paymentStatus.requiredConfirmations) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Pagamento</CardTitle>
        <CardDescription>Acompanhe o progresso do seu pagamento</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Icon & Text */}
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          <div className="text-center">
            <p className="text-xl font-semibold">{getStatusText()}</p>
            {paymentStatus.status === 'PROCESSING' && (
              <p className="text-sm text-muted-foreground mt-1">
                Aguardando confirmações da blockchain
              </p>
            )}
          </div>
        </div>

        {/* Confirmations Progress */}
        {paymentStatus.status === 'PROCESSING' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confirmações</span>
              <span className="font-mono">
                {paymentStatus.confirmations} / {paymentStatus.requiredConfirmations}
              </span>
            </div>
            <Progress value={confirmationProgress} className="h-2" />
          </div>
        )}

        {/* Transaction ID */}
        {paymentStatus.transactionId && (
          <div className="space-y-2">
            <p className="text-sm font-medium">ID da Transação</p>
            <code className="block p-3 bg-muted rounded-md text-xs break-all">
              {paymentStatus.transactionId}
            </code>
          </div>
        )}

        {/* Confirmed At */}
        {paymentStatus.confirmedAt && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✅ Confirmado em{' '}
              {new Date(paymentStatus.confirmedAt).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Linha do Tempo</p>
          <div className="space-y-2">
            <TimelineItem
              completed={true}
              label="Pagamento iniciado"
              time="Completo"
            />
            <TimelineItem
              completed={paymentStatus.status !== 'PENDING'}
              label="Transação detectada"
              time={
                paymentStatus.status !== 'PENDING'
                  ? 'Completo'
                  : 'Aguardando...'
              }
            />
            <TimelineItem
              completed={paymentStatus.status === 'CONFIRMED'}
              label="Confirmações recebidas"
              time={
                paymentStatus.status === 'CONFIRMED'
                  ? 'Completo'
                  : 'Aguardando...'
              }
            />
            <TimelineItem
              completed={paymentStatus.status === 'CONFIRMED'}
              label="Pagamento processado"
              time={
                paymentStatus.status === 'CONFIRMED'
                  ? 'Completo'
                  : 'Aguardando...'
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineItemProps {
  completed: boolean;
  label: string;
  time: string;
}

function TimelineItem({ completed, label, time }: TimelineItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          completed ? 'bg-green-500' : 'bg-muted'
        }`}
      />
      <div className="flex-1 flex justify-between">
        <span className={`text-sm ${completed ? '' : 'text-muted-foreground'}`}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}
