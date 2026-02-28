import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { 
  Camera, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  AlertCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date.utils';

type ScanMode = 'entrada' | 'saida' | 'consulta';

interface ScanHistory {
  id: string;
  code: string;
  format?: string;
  mode: ScanMode;
  produto?: any;
  timestamp: Date;
  status: 'success' | 'error';
  message: string;
}

export default function EstoqueScannerMobile() {
  const { toast } = useToast();
  const { produtos, addMovimentacao, loading } = useEstoqueSupabase();
  const [scanMode, setScanMode] = useState<ScanMode>('consulta');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [lastScannedProduct, setLastScannedProduct] = useState<any>(null);

  const handleScan = async (code: string, format?: string) => {
    setIsScanning(false);

    // Buscar produto pelo código
    const produto = produtos.find(
      p => p.codigo === code || p.codigoBarras === code
    );

    const historyEntry: ScanHistory = {
      id: Date.now().toString(),
      code,
      format,
      mode: scanMode,
      produto,
      timestamp: new Date(),
      status: produto ? 'success' : 'error',
      message: produto ? `Produto encontrado: ${produto.nome}` : 'Produto não encontrado no sistema',
    };

    setScanHistory(prev => [historyEntry, ...prev]);
    setLastScannedProduct(produto);

    if (!produto) {
      toast({
        title: 'Produto Não Encontrado',
        description: `Código ${code} não está cadastrado no sistema`,
        variant: 'destructive',
      });
      return;
    }

    // Processar de acordo com o modo
    if (scanMode === 'consulta') {
      toast({
        title: 'Produto Identificado',
        description: `${produto.nome} - Estoque: ${produto.quantidadeAtual} un`,
      });
    } else if (scanMode === 'entrada') {
      try {
        await addMovimentacao({
          produtoId: produto.id,
          tipo: 'ENTRADA',
          quantidade: 1,
          motivo: 'Entrada via Scanner Mobile',
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: 'Entrada Registrada',
          description: `+1 ${produto.nome} - Novo estoque: ${(produto.quantidadeAtual || 0) + 1} un`,
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar a entrada',
          variant: 'destructive',
        });
      }
    } else if (scanMode === 'saida') {
      if ((produto.quantidadeAtual || 0) < 1) {
        toast({
          title: 'Estoque Insuficiente',
          description: `${produto.nome} não possui estoque disponível`,
          variant: 'destructive',
        });
        return;
      }

      try {
        await addMovimentacao({
          produtoId: produto.id,
          tipo: 'SAIDA',
          quantidade: 1,
          motivo: 'Saída via Scanner Mobile',
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: 'Saída Registrada',
          description: `-1 ${produto.nome} - Novo estoque: ${(produto.quantidadeAtual || 0) - 1} un`,
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar a saída',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <LoadingState variant="spinner" size="lg" message="Carregando produtos..." />;
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Scanner Mobile de Estoque"
        description="Entrada e saída automatizada via código de barras/QR code"
        icon={Smartphone}
      />

      {/* Modo de Scanner */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Modo de Scanner
          </CardTitle>
          <CardDescription>Selecione o tipo de operação antes de escanear</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as ScanMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="consulta" className="gap-2">
                <Package className="h-4 w-4" />
                Consulta
              </TabsTrigger>
              <TabsTrigger value="entrada" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Entrada
              </TabsTrigger>
              <TabsTrigger value="saida" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Saída
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <TabsContent value="consulta" className="mt-0">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Modo Consulta</p>
                    <p className="text-xs text-muted-foreground">
                      Visualize informações do produto sem alterar estoque
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="entrada" className="mt-0">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Modo Entrada</p>
                    <p className="text-xs text-muted-foreground">
                      Adiciona +1 unidade ao estoque automaticamente
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="saida" className="mt-0">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Modo Saída</p>
                    <p className="text-xs text-muted-foreground">
                      Remove -1 unidade do estoque automaticamente
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Scanner */}
      {!isScanning ? (
        <Button
          onClick={() => setIsScanning(true)}
          size="lg"
          className="w-full h-16 text-lg gap-3"
        >
          <Camera className="h-6 w-6" />
          Iniciar Scanner de Código
        </Button>
      ) : (
        <BarcodeScanner
          onScan={handleScan}
          onCancel={() => setIsScanning(false)}
        />
      )}

      {/* Último Produto Escaneado */}
      {lastScannedProduct && (
        <Card variant="elevated" className="border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Último Produto Escaneado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-semibold text-lg">{lastScannedProduct.nome}</p>
              <p className="text-sm text-muted-foreground">
                Código: {lastScannedProduct.codigo || lastScannedProduct.codigoBarras}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Estoque Atual:</span>
              <span className="text-lg font-bold">
                {lastScannedProduct.quantidadeAtual} {lastScannedProduct.unidadeMedida}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Scans */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Scans ({scanHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  {entry.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          entry.mode === 'entrada'
                            ? 'default'
                            : entry.mode === 'saida'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {entry.mode === 'entrada' ? 'Entrada' : entry.mode === 'saida' ? 'Saída' : 'Consulta'}
                      </Badge>
                      {entry.format && (
                        <span className="text-xs text-muted-foreground">
                          {entry.format}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium truncate">
                      {entry.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {entry.code} • {formatDate(entry.timestamp.toISOString(), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {scanHistory.filter(h => h.mode === 'entrada').length}
              </p>
              <p className="text-xs text-muted-foreground">Entradas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {scanHistory.filter(h => h.mode === 'saida').length}
              </p>
              <p className="text-xs text-muted-foreground">Saídas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
