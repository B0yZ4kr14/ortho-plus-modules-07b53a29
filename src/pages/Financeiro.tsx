import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ContasPagarList } from '@/modules/financeiro/components/ContasPagarList';
import { ContasReceberList } from '@/modules/financeiro/components/ContasReceberList';
import { CaixaPanel } from '@/modules/financeiro/components/CaixaPanel';
import { FluxoCaixaDashboard } from '@/modules/financeiro/components/FluxoCaixaDashboard';
import { useFluxoCaixa, useContasPagar, useContasReceber, useCaixa } from '@/presentation/hooks/financeiro';
import { useAuth } from '@/contexts/AuthContext';

export default function Financeiro() {
  const { user } = useAuth();
  const { fluxoCaixa, loading: fluxoLoading } = useFluxoCaixa();
  const contasPagar = useContasPagar();
  const contasReceber = useContasReceber();
  const caixa = useCaixa();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={Wallet}
        title="Gestão Financeira"
        description="Controle completo do fluxo de caixa, contas a pagar e receber"
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fluxoLoading ? '...' : `R$ ${((fluxoCaixa?.saldoReceber || 0) - (fluxoCaixa?.saldoPagar || 0)).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fluxoLoading ? '...' : `R$ ${fluxoCaixa?.totalReceber.toFixed(2) || '0.00'}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {fluxoCaixa?.contasReceberVencidas || 0} vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fluxoLoading ? '...' : `R$ ${fluxoCaixa?.totalPagar.toFixed(2) || '0.00'}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {fluxoCaixa?.contasPagarVencidas || 0} vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fluxoCaixa?.caixaAtual.isAberto ? 'Aberto' : 'Fechado'}
            </div>
            <p className="text-xs text-muted-foreground">
              {fluxoCaixa?.caixaAtual.isAberto ? 'Em operação' : 'Fora de operação'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <FluxoCaixaDashboard data={fluxoCaixa} loading={fluxoLoading} />
        </TabsContent>

        <TabsContent value="receber" className="space-y-4">
          <ContasReceberList 
            contas={contasReceber.contas}
            loading={contasReceber.loading}
            onReceber={contasReceber.receberConta}
          />
        </TabsContent>

        <TabsContent value="pagar" className="space-y-4">
          <ContasPagarList 
            contas={contasPagar.contas}
            loading={contasPagar.loading}
            onPagar={contasPagar.pagarConta}
          />
        </TabsContent>

        <TabsContent value="caixa" className="space-y-4">
          <CaixaPanel 
            caixaAtual={caixa.caixaAtual}
            caixaAberto={caixa.caixaAberto}
            loading={caixa.loading}
            onAbrirCaixa={caixa.abrirCaixa}
            onFecharCaixa={caixa.fecharCaixa}
            onRegistrarSangria={caixa.registrarSangria}
            userId={user?.id || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
