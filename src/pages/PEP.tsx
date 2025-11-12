import { useState } from 'react';
import { FileText, Plus, History, Upload, Activity, Smile, Box, Clock, GitCompare } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricoClinicoForm } from '@/modules/pep/components/HistoricoClinicoForm';
import { TratamentoForm } from '@/modules/pep/components/TratamentoForm';
import { AnexosUpload } from '@/modules/pep/components/AnexosUpload';
import { EvolucoesTimeline } from '@/modules/pep/components/EvolucoesTimeline';
import { Odontograma2D } from '@/modules/pep/components/Odontograma2D';
import { Odontograma3D } from '@/modules/pep/components/Odontograma3D';
import { OdontogramaHistory } from '@/modules/pep/components/OdontogramaHistory';
import { OdontogramaComparison } from '@/modules/pep/components/OdontogramaComparison';
import { useOdontogramaStore } from '@/modules/pep/hooks/useOdontogramaStore';

export default function PEP() {
  const [activeTab, setActiveTab] = useState('historico');
  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false);
  const [isTratamentoDialogOpen, setIsTratamentoDialogOpen] = useState(false);
  
  // Mock prontuario ID - em produção viria da seleção do paciente
  const prontuarioId = 'mock-prontuario-id';

  // Estados para comparação de odontogramas
  const [selectedForComparison, setSelectedForComparison] = useState<[string | null, string | null]>([null, null]);
  
  const { history, restoreFromHistory } = useOdontogramaStore(prontuarioId);

  const handleCompareSelect = (historyId: string) => {
    if (selectedForComparison[0] === historyId) {
      setSelectedForComparison([null, null]);
      setActiveTab('historico-odonto');
    } else if (selectedForComparison[0] === null) {
      setSelectedForComparison([historyId, null]);
    } else if (selectedForComparison[1] === null) {
      setSelectedForComparison([selectedForComparison[0], historyId]);
      setActiveTab('comparacao-odonto');
    } else {
      setSelectedForComparison([historyId, null]);
      setActiveTab('historico-odonto');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Prontuário Eletrônico do Paciente (PEP)" 
        icon={FileText}
        description="Gestão completa do histórico clínico, tratamentos e documentação do paciente"
      />

      {/* Informações do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paciente Selecionado</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as informações clínicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">João da Silva</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-medium">123.456.789-00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p className="font-medium">15/03/1985 (39 anos)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="historico">
            <History className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="tratamentos">
            <Activity className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Tratamentos</span>
          </TabsTrigger>
          <TabsTrigger value="odontograma2d">
            <Smile className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Odonto 2D</span>
          </TabsTrigger>
          <TabsTrigger value="odontograma3d">
            <Box className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Odonto 3D</span>
          </TabsTrigger>
          <TabsTrigger value="historico-odonto">
            <Clock className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Histórico Odonto</span>
          </TabsTrigger>
          <TabsTrigger value="comparacao-odonto">
            <GitCompare className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Comparação</span>
          </TabsTrigger>
          <TabsTrigger value="anexos">
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Anexos</span>
          </TabsTrigger>
          <TabsTrigger value="evolucoes">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Evoluções</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Histórico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Histórico Clínico</DialogTitle>
                </DialogHeader>
                <HistoricoClinicoForm
                  prontuarioId={prontuarioId}
                  onSuccess={() => {
                    setIsHistoricoDialogOpen(false);
                    // Refetch data
                  }}
                  onCancel={() => setIsHistoricoDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum histórico clínico registrado</p>
                <p className="text-sm mt-1">Clique em "Novo Histórico" para começar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tratamentos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isTratamentoDialogOpen} onOpenChange={setIsTratamentoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Tratamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Tratamento</DialogTitle>
                </DialogHeader>
                <TratamentoForm
                  prontuarioId={prontuarioId}
                  onSuccess={() => {
                    setIsTratamentoDialogOpen(false);
                    // Refetch data
                  }}
                  onCancel={() => setIsTratamentoDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum tratamento registrado</p>
                <p className="text-sm mt-1">Clique em "Novo Tratamento" para começar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odontograma2d" className="space-y-4">
          <Odontograma2D prontuarioId={prontuarioId} />
        </TabsContent>

        <TabsContent value="odontograma3d" className="space-y-4">
          <Odontograma3D prontuarioId={prontuarioId} />
        </TabsContent>

        <TabsContent value="historico-odonto" className="space-y-4">
          <OdontogramaHistory
            history={history}
            onRestore={restoreFromHistory}
            onCompare={handleCompareSelect}
            selectedForComparison={selectedForComparison[0]}
          />
        </TabsContent>

        <TabsContent value="comparacao-odonto" className="space-y-4">
          <OdontogramaComparison
            history={history}
            selectedIds={selectedForComparison}
            onClearSelection={() => {
              setSelectedForComparison([null, null]);
              setActiveTab('historico-odonto');
            }}
          />
        </TabsContent>

        <TabsContent value="anexos" className="space-y-4">
          <AnexosUpload
            prontuarioId={prontuarioId}
            onUploadSuccess={() => {
              // Refetch data
            }}
          />
        </TabsContent>

        <TabsContent value="evolucoes" className="space-y-4">
          <EvolucoesTimeline prontuarioId={prontuarioId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
