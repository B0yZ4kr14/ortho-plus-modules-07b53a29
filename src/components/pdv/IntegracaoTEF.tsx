import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader2, CheckCircle, XCircle, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IntegracaoTEFProps {
  vendaId: string;
  valorTotal: number;
  onSuccess?: () => void;
}

export default function IntegracaoTEF({ vendaId, valorTotal, onSuccess }: IntegracaoTEFProps) {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const [processando, setProcessando] = useState(false);
  const [tipoOperacao, setTipoOperacao] = useState("DEBITO");
  const [numParcelas, setNumParcelas] = useState(1);
  const [transacao, setTransacao] = useState<any>(null);
  const [showComprovante, setShowComprovante] = useState(false);

  const processar = async () => {
    try {
      setProcessando(true);

      const { data, error } = await supabase.functions.invoke("processar-pagamento-tef", {
        body: {
          clinic_id: clinicId,
          venda_id: vendaId,
          tipo_operacao: tipoOperacao,
          valor: valorTotal,
          num_parcelas: tipoOperacao === "CREDITO" ? numParcelas : 1,
          provedor: "SITEF"
        }
      });

      if (error) throw error;

      if (data.success) {
        setTransacao(data.transacao);
        setShowComprovante(true);
        toast({
          title: "Pagamento Aprovado",
          description: `Transação aprovada com sucesso. NSU: ${data.transacao.nsu_sitef}`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Pagamento Negado",
          description: data.error || "A transação foi negada pela operadora",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao processar TEF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento via TEF",
        variant: "destructive"
      });
    } finally {
      setProcessando(false);
    }
  };

  const imprimirComprovante = () => {
    if (!transacao?.comprovante_cliente) return;

    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write('<pre style="font-family: monospace; font-size: 12px;">');
      printWindow.document.write(transacao.comprovante_cliente);
      printWindow.document.write('</pre>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <Card depth="normal" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Pagamento com Cartão (TEF)</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Tipo de Operação</Label>
            <Select value={tipoOperacao} onValueChange={setTipoOperacao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBITO">Débito</SelectItem>
                <SelectItem value="CREDITO">Crédito</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
                <SelectItem value="PIX_TEF">PIX (TEF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoOperacao === "CREDITO" && (
            <div>
              <Label>Número de Parcelas</Label>
              <Select
                value={numParcelas.toString()}
                onValueChange={(v) => setNumParcelas(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}x de R$ {(valorTotal / n).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</p>
          </div>

          <Button
            onClick={processar}
            disabled={processando}
            className="w-full"
            size="lg"
          >
            {processando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando TEF...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Processar Pagamento
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Aguarde a confirmação no terminal PinPad
          </p>
        </div>
      </Card>

      <Dialog open={showComprovante} onOpenChange={setShowComprovante}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Pagamento Aprovado
            </DialogTitle>
          </DialogHeader>

          {transacao && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">NSU</p>
                    <p className="font-medium">{transacao.nsu_sitef}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Autorização</p>
                    <p className="font-medium">{transacao.codigo_autorizacao}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">{transacao.tipo_operacao}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p className="font-medium">R$ {parseFloat(transacao.valor).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <pre className="bg-background p-4 rounded border text-xs font-mono whitespace-pre-wrap">
                {transacao.comprovante_cliente}
              </pre>

              <div className="flex gap-2">
                <Button onClick={imprimirComprovante} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Comprovante
                </Button>
                <Button variant="outline" onClick={() => setShowComprovante(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}