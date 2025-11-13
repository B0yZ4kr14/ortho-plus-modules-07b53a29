// @ts-nocheck
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, CheckCircle, QrCode } from 'lucide-react';

interface CupomFiscalProps {
  venda: any;
  items: any[];
}

export const CupomFiscal = ({ venda, items }: CupomFiscalProps) => {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const cupomRef = useRef<HTMLDivElement>(null);

  const emitirNFCeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('emitir-nfce', {
        body: {
          vendaId: venda.id,
          clinicId: clinicId,
          items: items,
          valorTotal: venda.valor_total,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: 'NFCe emitida com sucesso',
        description: `Chave: ${data.nfce.chave_acesso}`,
      });
      
      // Disparar impressão automática em SAT/MFe após emissão NFCe
      await imprimirCupomFiscal();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao emitir NFCe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const imprimirCupomFiscal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('imprimir-cupom-sat', {
        body: {
          vendaId: venda.id,
          clinicId: clinicId,
          items: items.map((item: any) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
          })),
          valorTotal: venda.valor_total,
          formaPagamento: venda.forma_pagamento || 'DINHEIRO',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Cupom fiscal impresso",
          description: `Autorização: ${data.codigoAutorizacao}`,
        });
      } else {
        throw new Error(data.mensagem || 'Erro ao imprimir cupom fiscal');
      }
    } catch (error: any) {
      console.error('Error printing fiscal coupon:', error);
      toast({
        title: "Erro ao imprimir cupom fiscal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (cupomRef.current) {
      const printWindow = window.open('', '', 'height=600,width=400');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Cupom Fiscal</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
          .cupom { max-width: 80mm; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(cupomRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const valorTotal = items.reduce(
    (sum, item) => sum + item.valor_unitario * item.quantidade,
    0
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cupom Fiscal
          </h3>
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Venda #{venda.numero_venda}
          </Badge>
        </div>

        <div
          ref={cupomRef}
          className="cupom border border-border rounded-lg p-6 bg-white text-black font-mono text-sm"
        >
          <div className="center bold">
            <p className="text-lg">CLÍNICA ODONTOLÓGICA</p>
            <p>Ortho+ Sistema</p>
            <p className="text-xs mt-2">CNPJ: 00.000.000/0000-00</p>
            <p className="text-xs">Rua Exemplo, 123 - São Paulo/SP</p>
          </div>

          <div className="divider"></div>

          <div className="center bold">
            <p>CUPOM FISCAL ELETRÔNICO - SAT</p>
            <p className="text-xs">NFCe</p>
          </div>

          <div className="divider"></div>

          <table>
            <thead>
              <tr>
                <td className="bold">ITEM</td>
                <td className="bold right">QTD</td>
                <td className="bold right">VALOR</td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td colSpan={3}>
                    <div>{item.descricao}</div>
                    <div className="flex justify-between">
                      <span>{item.quantidade} x</span>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.valor_unitario)}
                      </span>
                      <span className="bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.valor_unitario * item.quantidade)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider"></div>

          <table>
            <tr>
              <td>TOTAL</td>
              <td className="right bold text-lg">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(valorTotal)}
              </td>
            </tr>
          </table>

          <div className="divider"></div>

          <div className="center">
            <p className="bold">FORMA DE PAGAMENTO</p>
            <p>Dinheiro</p>
          </div>

          <div className="divider"></div>

          <div className="center text-xs">
            <div className="flex items-center justify-center gap-2 my-4">
              <QrCode className="h-16 w-16" />
            </div>
            <p>Consulte pela Chave de Acesso em:</p>
            <p>www.fazenda.sp.gov.br/nfce</p>
            <p className="mt-2">Chave de Acesso:</p>
            <p className="break-all">
              3525 0100 0000 0000 0000 6500 1000 0000 0011 2345 6789
            </p>
          </div>

          <div className="divider"></div>

          <div className="center text-xs">
            <p>Data: {new Date().toLocaleString('pt-BR')}</p>
            <p className="mt-2">
              Protocolo de Autorização: 999123456789012345
            </p>
          </div>

          <div className="divider"></div>

          <div className="center text-xs">
            <p>OBRIGADO PELA PREFERÊNCIA!</p>
            <p className="mt-2">Ortho+ - Sistema de Gestão Odontológica</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Cupom
          </Button>
          <Button
            onClick={() => emitirNFCeMutation.mutate()}
            disabled={emitirNFCeMutation.isPending}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {emitirNFCeMutation.isPending ? 'Emitindo...' : 'Emitir NFCe'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
