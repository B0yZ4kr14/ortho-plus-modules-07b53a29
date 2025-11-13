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

export default function PDV() {
  const { clinicId, user } = useAuth();
  const { caixaAberto, loading, abrirCaixa, fecharCaixa, criarVenda } = usePDVSupabase(clinicId);
  
  const [showAbertura, setShowAbertura] = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);
  
  // Estado da venda atual
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

  const valorEsperado = caixaAberto ? caixaAberto.valor_inicial + 0 : 0; // TODO: calcular baseado em vendas

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

    // Limpar venda
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

  if (!caixaAberto) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader icon={ShoppingCart} title="Ponto de Venda (PDV)" />
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-orange-500/10 p-6">
                  <Lock className="h-16 w-16 text-orange-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Caixa Fechado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Para começar a utilizar o PDV, primeiro você precisa abrir o caixa.
                  Informe o valor inicial em dinheiro disponível.
                </p>
              </div>
              <Button onClick={() => setShowAbertura(true)} size="lg">
                <DollarSign className="h-5 w-5 mr-2" />
                Abrir Caixa
              </Button>
            </div>
          </CardContent>
        </Card>

        <AberturaCaixaDialog
          open={showAbertura}
          onOpenChange={setShowAbertura}
          onConfirm={abrirCaixa}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader icon={ShoppingCart} title="Ponto de Venda (PDV)" />
        <div className="flex items-center gap-3">
          <Badge variant="success" className="gap-2">
            <DollarSign className="h-3 w-3" />
            Caixa Aberto
          </Badge>
          <Button variant="destructive" onClick={() => setShowFechamento(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Fechar Caixa
          </Button>
        </div>
      </div>

      {/* Info do Caixa */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              Caixa aberto por <strong>{user?.email}</strong> em{' '}
              {format(new Date(caixaAberto.aberto_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
            <span className="font-semibold">
              Valor Inicial: R$ {caixaAberto.valor_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itens da Venda */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Itens da Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adicionar Item */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <Label>Descrição</Label>
                <Input
                  value={descricaoItem}
                  onChange={(e) => setDescricaoItem(e.target.value)}
                  placeholder="Produto ou serviço"
                  onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
                />
              </div>
              <div className="col-span-2">
                <Label>Qtd</Label>
                <Input
                  type="number"
                  value={quantidadeItem}
                  onChange={(e) => setQuantidadeItem(e.target.value)}
                  min="1"
                />
              </div>
              <div className="col-span-3">
                <Label>Valor Unit.</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorItem}
                  onChange={(e) => setValorItem(e.target.value)}
                  placeholder="0.00"
                  onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
                />
              </div>
              <div className="col-span-2 flex items-end">
                <Button onClick={adicionarItem} className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lista de Itens */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {itens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item adicionado ainda
                </div>
              ) : (
                itens.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade} x R$ {item.valor_unitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">
                        R$ {item.valor_total.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total */}
            <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total da Venda</p>
              <p className="text-4xl font-bold">
                R$ {totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Forma de Pagamento */}
            <div>
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {formasPagamento.map((forma) => {
                  const Icon = forma.icon;
                  return (
                    <Button
                      key={forma.value}
                      variant={formaPagamento === forma.value ? 'default' : 'outline'}
                      className="h-auto py-3"
                      onClick={() => setFormaPagamento(forma.value)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {forma.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {formaPagamento === 'CARTAO_CREDITO' && (
              <div>
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  min="1"
                  max="12"
                />
              </div>
            )}

            <Button 
              onClick={finalizarVenda} 
              disabled={itens.length === 0}
              size="lg"
              className="w-full"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Finalizar Venda
            </Button>
          </CardContent>
        </Card>
      </div>

      <FechamentoCaixaDialog
        open={showFechamento}
        onOpenChange={setShowFechamento}
        caixaAberto={caixaAberto}
        valorEsperado={valorEsperado}
        onConfirm={fecharCaixa}
      />
    </div>
  );
}