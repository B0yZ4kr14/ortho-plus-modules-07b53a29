// @ts-nocheck
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePDVSupabase } from '@/hooks/usePDVSupabase';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AberturaCaixaDialog } from '@/components/pdv/AberturaCaixaDialog';
import { FechamentoCaixaDialog } from '@/components/pdv/FechamentoCaixaDialog';
import { 
  CreditCard, 
  DollarSign, 
  ShoppingCart, 
  Lock,
  Plus,
  Trash2,
  AlertCircle,
  Receipt,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formasPagamento = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: DollarSign },
  { value: 'CARTAO_CREDITO', label: 'Cartão Crédito', icon: CreditCard },
  { value: 'CARTAO_DEBITO', label: 'Cartão Débito', icon: CreditCard },
  { value: 'PIX', label: 'PIX', icon: Wallet },
  { value: 'TRANSFERENCIA', label: 'Transferência', icon: Wallet },
  { value: 'CRYPTO', label: 'Criptomoeda', icon: Wallet },
];

export default function PDVPage() {
  const { clinicId, user } = useAuth();
  const { caixaAberto, loading, abrirCaixa, fecharCaixa, criarVenda } = usePDVSupabase(clinicId);
  
  const [showAbertura, setShowAbertura] = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);
  
  const [itens, setItens] = useState<any[]>([]);
  const [descricaoItem, setDescricaoItem] = useState('');
  const [valorItem, setValorItem] = useState('');
  const [quantidadeItem, setQuantidadeItem] = useState('1');
  
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [valorPagamento, setValorPagamento] = useState('');
  const [parcelas, setParcelas] = useState('1');

  const totalVenda = useMemo(() => 
    itens.reduce((sum, item) => sum + item.valor_total, 0),
    [itens]
  );

  const valorEsperado = caixaAberto ? caixaAberto.valor_inicial + 0 : 0;

  const adicionarItem = () => {
    if (!descricaoItem || !valorItem) return;

    const quantidade = parseFloat(quantidadeItem) || 1;
    const valor = parseFloat(valorItem) || 0;

    setItens([...itens, {
      tipo: 'SERVICO',
      descricao: descricaoItem,
      quantidade,
      valor_unitario: valor,
      desconto: 0,
      valor_total: quantidade * valor,
    }]);

    setDescricaoItem('');
    setValorItem('');
    setQuantidadeItem('1');
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const finalizarVenda = async () => {
    if (itens.length === 0 || !caixaAberto) return;

    const taxaOperacao = formaPagamento === 'CARTAO_CREDITO' ? totalVenda * 0.035 : 0;
    const valorLiquido = totalVenda - taxaOperacao;

    await criarVenda(
      {
        valor_total: totalVenda,
        desconto: 0,
        valor_final: totalVenda,
        status: 'PAGO',
      },
      itens,
      [{
        forma_pagamento: formaPagamento as any,
        valor: totalVenda,
        parcelas: parseInt(parcelas) || 1,
        taxa_operacao: taxaOperacao,
        valor_liquido: valorLiquido,
      }]
    );

    setItens([]);
    setValorPagamento('');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader icon={ShoppingCart} title="Ponto de Venda (PDV)" />
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader icon={ShoppingCart} title="Ponto de Venda (PDV)" />

      {!caixaAberto ? (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            O caixa está fechado. Abra o caixa para iniciar as vendas.
            <Button onClick={() => setShowAbertura(true)} className="ml-4" size="sm">
              Abrir Caixa
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Caixa Aberto</p>
                <p className="text-2xl font-bold">
                  R$ {caixaAberto.valor_inicial.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aberto em {format(new Date(caixaAberto.aberto_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <Button variant="destructive" onClick={() => setShowFechamento(true)}>
                Fechar Caixa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Consulta"
                    value={descricaoItem}
                    onChange={(e) => setDescricaoItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={valorItem}
                    onChange={(e) => setValorItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    value={quantidadeItem}
                    onChange={(e) => setQuantidadeItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button onClick={adicionarItem} disabled={!caixaAberto} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {itens.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Itens da Venda</Label>
                  {itens.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidade}x R$ {item.valor_unitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">R$ {item.valor_total.toFixed(2)}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removerItem(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map((forma) => (
                    <Button
                      key={forma.value}
                      variant={formaPagamento === forma.value ? 'default' : 'outline'}
                      onClick={() => setFormaPagamento(forma.value)}
                      disabled={!caixaAberto}
                      className="justify-start"
                    >
                      <forma.icon className="h-4 w-4 mr-2" />
                      {forma.label}
                    </Button>
                  ))}
                </div>
              </div>

              {formaPagamento === 'CARTAO_CREDITO' && (
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {totalVenda.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {totalVenda.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={finalizarVenda}
                disabled={!caixaAberto || itens.length === 0}
                className="w-full"
                size="lg"
              >
                <Receipt className="mr-2 h-5 w-5" />
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AberturaCaixaDialog
        open={showAbertura}
        onOpenChange={setShowAbertura}
        onConfirm={abrirCaixa}
      />

      <FechamentoCaixaDialog
        open={showFechamento}
        onOpenChange={setShowFechamento}
        onConfirm={fecharCaixa}
        caixaAberto={caixaAberto}
        valorEsperado={valorEsperado}
      />
    </div>
  );
}
