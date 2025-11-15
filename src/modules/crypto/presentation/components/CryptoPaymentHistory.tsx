import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CryptoPayment {
  id: string;
  invoice_id: string;
  amount_brl: number;
  crypto_amount?: number;
  crypto_currency?: string;
  status: string;
  created_at: string;
  confirmed_at?: string;
  transaction_id?: string;
}

export function CryptoPaymentHistory() {
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Erro ao buscar histórico de pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', variant: 'secondary' as const },
      PROCESSING: { label: 'Processando', variant: 'default' as const },
      CONFIRMED: { label: 'Confirmado', variant: 'default' as const },
      EXPIRED: { label: 'Expirado', variant: 'destructive' as const },
      FAILED: { label: 'Falhou', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">Nenhum pagamento encontrado</p>
          <p className="text-sm text-muted-foreground">
            Os pagamentos em criptomoeda aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <CardDescription>
          Visualize todos os pagamentos em criptomoeda realizados
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Valor (BRL)</TableHead>
                <TableHead>Cripto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{payment.invoice_id}</code>
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount_brl)}</TableCell>
                  <TableCell>
                    {payment.crypto_amount && payment.crypto_currency ? (
                      <span className="text-sm">
                        {payment.crypto_amount.toFixed(8)} {payment.crypto_currency}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    {payment.transaction_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Open blockchain explorer (example for Bitcoin)
                          window.open(
                            `https://blockchair.com/search?q=${payment.transaction_id}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
