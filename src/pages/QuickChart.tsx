import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileHeart, 
  Clock, 
  Pill, 
  Image, 
  Activity,
  ArrowLeft,
  Printer,
  Plus
} from 'lucide-react';

export default function QuickChart() {
  const { patientId } = useParams();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [chairsideMode, setChairsideMode] = useState(false);

  // Buscar dados do paciente
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Buscar tratamentos ativos
  const { data: tratamentos = [] } = useQuery({
    queryKey: ['tratamentos-ativos', patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select(`
          *,
          procedimento:procedimentos(nome, codigo_tuss)
        `)
        .eq('prontuario_id', patient.id)
        .eq('status', 'EM_ANDAMENTO');
      
      if (error) throw error;
      return data;
    },
    enabled: !!patient?.id,
  });

  return (
    <div className={`h-screen flex flex-col ${chairsideMode ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{patient?.patient_name || 'Carregando...'}</h1>
            <p className="text-sm text-muted-foreground">
              Quick Chart - Atendimento Rápido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={chairsideMode ? 'default' : 'outline'}
            onClick={() => setChairsideMode(!chairsideMode)}
          >
            Modo Chairside {chairsideMode ? '✓' : ''}
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Layout Split-Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Odontograma (Fixo) */}
        <div className="w-80 border-r p-4 overflow-y-auto bg-muted/30">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Odontograma</CardTitle>
              <CardDescription>Visualização do estado dos dentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Odontograma será exibido aqui</p>
                <p className="text-xs mt-2">Componente em desenvolvimento</p>
              </div>

              {selectedTooth && (
                <div className="mt-4 p-3 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Dente {selectedTooth}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge>Hígido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Últimos procedimentos:</span>
                      <span className="text-muted-foreground">Nenhum</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Legenda */}
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Legenda:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span>Hígido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span>Cárie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <span>Tratado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Tabs + Quick Actions */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="historico" className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList className="h-auto p-1">
                <TabsTrigger value="historico" className="gap-2">
                  <FileHeart className="h-4 w-4" />
                  Histórico Clínico
                </TabsTrigger>
                <TabsTrigger value="tratamentos" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Tratamentos Ativos ({tratamentos.length})
                </TabsTrigger>
                <TabsTrigger value="radiografias" className="gap-2">
                  <Image className="h-4 w-4" />
                  Radiografias
                </TabsTrigger>
                <TabsTrigger value="prescricoes" className="gap-2">
                  <Pill className="h-4 w-4" />
                  Prescrições
                </TabsTrigger>
                <TabsTrigger value="evolucao" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Evolução (Timeline)
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="historico" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico Clínico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Histórico completo do paciente será exibido aqui.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tratamentos" className="mt-0">
                <div className="space-y-4">
                  {tratamentos.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Nenhum tratamento ativo no momento
                      </CardContent>
                    </Card>
                  ) : (
                    tratamentos.map((trat: any) => (
                      <Card key={trat.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {trat.procedimento?.nome || 'Procedimento'}
                          </CardTitle>
                          <CardDescription>
                            Código TUSS: {trat.procedimento?.codigo_tuss || 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge>{trat.status}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Dente: {trat.dente || 'Múltiplos'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="radiografias" className="mt-0">
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Radiografias serão exibidas aqui
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescricoes" className="mt-0">
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Prescrições serão exibidas aqui
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evolucao" className="mt-0">
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Timeline de evolução será exibida aqui
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Quick Actions (Sempre visíveis) */}
          <div className="border-t p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Procedimento
              </Button>
              <Button variant="outline" className="gap-2">
                <Pill className="h-4 w-4" />
                Nova Prescrição
              </Button>
              <Button variant="outline" className="gap-2">
                <Image className="h-4 w-4" />
                Upload Radiografia
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Receita
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
