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
import { AssinaturaDigital } from '@/modules/pep/components/AssinaturaDigital';
import { OdontogramaAIAnalysis } from '@/modules/pep/components/OdontogramaAIAnalysis';
import { PrescricaoForm } from '@/modules/pep/components/PrescricaoForm';
import { ReceitaForm } from '@/modules/pep/components/ReceitaForm';
import { ProntuarioPDF } from '@/modules/pep/components/ProntuarioPDF';
import { useOdontogramaSupabase } from '@/modules/pep/hooks/useOdontogramaSupabase';
import { useTratamentos } from '@/modules/pep/hooks/useTratamentos';
import { PatientSelector } from '@/components/shared/PatientSelector';
import type { Patient } from '@/types/patient';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PEP() {
  const { user, clinicId } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('historico');
  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false);
  const [isTratamentoDialogOpen, setIsTratamentoDialogOpen] = useState(false);
  const [isPrescricaoDialogOpen, setIsPrescricaoDialogOpen] = useState(false);
  const [isReceitaDialogOpen, setIsReceitaDialogOpen] = useState(false);
  
  // Use patient id as prontuario id (simpler approach)
  const prontuarioId = selectedPatient?.id || null;

  // Custom Hooks com Clean Architecture
  const { createTratamento } = useTratamentos(prontuarioId, clinicId || '');

  // Estados para comparação de odontogramas
  const [selectedForComparison, setSelectedForComparison] = useState<[string | null, string | null]>([null, null]);
  
  const { history, restoreFromHistory } = useOdontogramaSupabase(prontuarioId || '');

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

  const handleCreateTreatmentsFromAI = async (suggestions: any[]) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Criar tratamentos usando o Use Case via hook customizado
      for (const suggestion of suggestions) {
        await createTratamento({
          titulo: suggestion.procedure,
          descricao: suggestion.clinical_notes || `Tratamento para o dente ${suggestion.tooth_number}`,
          denteCodigo: suggestion.tooth_number.toString(),
          valorEstimado: suggestion.estimated_cost,
          dataInicio: new Date(),
          createdBy: user.id,
        });
      }

      toast({
        title: 'Sucesso',
        description: `${suggestions.length} tratamento(s) criado(s) a partir da análise de IA`,
      });

      // Mudar para aba de tratamentos
      setActiveTab('tratamentos');
    } catch (error) {
      console.error('Erro ao criar tratamentos:', error);
      // Toast de erro já é exibido pelo hook
    }
  };

  // Se nenhum paciente foi selecionado, mostrar apenas o seletor
  if (!selectedPatient) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader 
          title="Prontuário Eletrônico do Paciente (PEP)" 
          icon={FileText}
          description="Gestão completa do histórico clínico, tratamentos e documentação do paciente"
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um paciente para acessar e gerenciar o prontuário eletrônico.
          </AlertDescription>
        </Alert>

        <PatientSelector 
          onSelect={setSelectedPatient}
          selectedPatient={selectedPatient}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Prontuário Eletrônico do Paciente (PEP)" 
        icon={FileText}
        description="Gestão completa do histórico clínico, tratamentos e documentação do paciente"
      />

      {/* Seletor compacto de paciente */}
      <PatientSelector 
        onSelect={setSelectedPatient}
        selectedPatient={selectedPatient}
        compact
      />

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-11">
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
          <TabsTrigger value="analise-ia">
            <Smile className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Análise IA</span>
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
          <TabsTrigger value="prescricoes">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Prescrições</span>
          </TabsTrigger>
          <TabsTrigger value="receitas">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Receitas</span>
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

        <TabsContent value="analise-ia" className="space-y-4">
          <OdontogramaAIAnalysis 
            prontuarioId={prontuarioId}
            patientId="mock-patient-id"
            onTreatmentCreate={handleCreateTreatmentsFromAI}
          />
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

        <TabsContent value="prescricoes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPrescricaoDialogOpen} onOpenChange={setIsPrescricaoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Prescrição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Prescrição Médica</DialogTitle>
                </DialogHeader>
                <PrescricaoForm
                  prontuarioId={prontuarioId}
                  onSuccess={() => setIsPrescricaoDialogOpen(false)}
                  onCancel={() => setIsPrescricaoDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma prescrição registrada</p>
                <p className="text-sm mt-1">Clique em "Nova Prescrição" para começar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receitas" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isReceitaDialogOpen} onOpenChange={setIsReceitaDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Receita Médica</DialogTitle>
                </DialogHeader>
                <ReceitaForm
                  prontuarioId={prontuarioId}
                  onSuccess={() => setIsReceitaDialogOpen(false)}
                  onCancel={() => setIsReceitaDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma receita registrada</p>
                <p className="text-sm mt-1">Clique em "Nova Receita" para começar</p>
              </div>
            </CardContent>
          </Card>

          <ProntuarioPDF prontuarioId={prontuarioId} patientName="João da Silva" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
