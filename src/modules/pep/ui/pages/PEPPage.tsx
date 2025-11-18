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

export default function PEPPage() {
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

  // Estado para comparação de odontogramas (dois IDs)
  const [selectedForComparison, setSelectedForComparison] = useState<[string | null, string | null]>([null, null]);
  
  const { history, restoreFromHistory } = useOdontogramaSupabase(prontuarioId || '');

  const handleCompareSelect = (historyId: string) => {
    setSelectedForComparison(prev => {
      // Se o historyId já está selecionado, desmarcar
      if (prev[0] === historyId || prev[1] === historyId) {
        return [null, null];
      }
      // Se o primeiro slot está vazio, preencher
      if (prev[0] === null) {
        return [historyId, null];
      }
      // Se o primeiro está preenchido e o segundo está vazio, preencher o segundo
      if (prev[1] === null) {
        setActiveTab('comparacao-odonto');
        return [prev[0], historyId];
      }
      // Se ambos estão preenchidos, resetar e começar de novo
      return [historyId, null];
    });
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
          denteCodigo: suggestion.tooth_number,
          dataInicio: new Date(),
          createdBy: user.id,
        });
      }
      
      toast({
        title: 'Sucesso',
        description: `${suggestions.length} tratamento(s) criado(s) com sucesso`,
      });
      
      setActiveTab('tratamentos');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar tratamentos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!selectedPatient) {
    return (
      <div className="p-8">
        <PageHeader
          title="Prontuário Eletrônico do Paciente (PEP)"
          description="Sistema completo de prontuário com odontograma 2D/3D e análise por IA"
          icon={FileText}
        />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Selecione um Paciente</CardTitle>
            <CardDescription>
              Escolha o paciente para acessar seu prontuário eletrônico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientSelector
              onSelect={setSelectedPatient}
              placeholder="Buscar paciente por nome ou CPF..."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`PEP - ${selectedPatient.full_name}`}
          description={`Prontuário eletrônico completo do paciente`}
          icon={FileText}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            Trocar Paciente
          </Button>
          <ProntuarioPDF 
            prontuarioId={prontuarioId || ''} 
            patientName={selectedPatient.full_name}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="tratamentos" className="gap-2">
            <Activity className="h-4 w-4" />
            Tratamentos
          </TabsTrigger>
          <TabsTrigger value="odontograma" className="gap-2">
            <Smile className="h-4 w-4" />
            Odontograma 2D
          </TabsTrigger>
          <TabsTrigger value="odontograma-3d" className="gap-2">
            <Box className="h-4 w-4" />
            Odontograma 3D
          </TabsTrigger>
          <TabsTrigger value="historico-odonto" className="gap-2">
            <Clock className="h-4 w-4" />
            Histórico Odonto
          </TabsTrigger>
          <TabsTrigger value="comparacao-odonto" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Comparar
          </TabsTrigger>
          <TabsTrigger value="anexos" className="gap-2">
            <Upload className="h-4 w-4" />
            Anexos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico Clínico & Evoluções</CardTitle>
                <CardDescription>Registro completo das consultas e evoluções</CardDescription>
              </div>
              <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Evolução
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Evolução Clínica</DialogTitle>
                  </DialogHeader>
                  <HistoricoClinicoForm
                    prontuarioId={prontuarioId || ''}
                    onSuccess={() => setIsHistoricoDialogOpen(false)}
                    onCancel={() => setIsHistoricoDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {prontuarioId ? (
                <EvolucoesTimeline prontuarioId={prontuarioId} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum prontuário associado a este paciente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tratamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planos de Tratamento</CardTitle>
                <CardDescription>Gestão completa dos tratamentos planejados e em andamento</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isPrescricaoDialogOpen} onOpenChange={setIsPrescricaoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Prescrição
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Nova Prescrição</DialogTitle>
                    </DialogHeader>
                    <PrescricaoForm
                      prontuarioId={prontuarioId || ''}
                      onSuccess={() => setIsPrescricaoDialogOpen(false)}
                      onCancel={() => setIsPrescricaoDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isReceitaDialogOpen} onOpenChange={setIsReceitaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Nova Receita</DialogTitle>
                    </DialogHeader>
                    <ReceitaForm
                      prontuarioId={prontuarioId || ''}
                      onSuccess={() => setIsReceitaDialogOpen(false)}
                      onCancel={() => setIsReceitaDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isTratamentoDialogOpen} onOpenChange={setIsTratamentoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tratamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Novo Plano de Tratamento</DialogTitle>
                    </DialogHeader>
                    <TratamentoForm
                      prontuarioId={prontuarioId || ''}
                      onSuccess={() => setIsTratamentoDialogOpen(false)}
                      onCancel={() => setIsTratamentoDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tratamentos list aqui */}
              <p className="text-muted-foreground text-center py-8">
                Listagem de tratamentos será implementada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odontograma">
          <Card>
            <CardHeader>
              <CardTitle>Odontograma 2D Interativo</CardTitle>
              <CardDescription>Mapeamento visual do estado dentário do paciente</CardDescription>
            </CardHeader>
            <CardContent>
              {prontuarioId ? (
                <>
                  <Odontograma2D prontuarioId={prontuarioId} />
                  <OdontogramaAIAnalysis prontuarioId={prontuarioId} />
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum prontuário associado a este paciente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odontograma-3d">
          <Card>
            <CardHeader>
              <CardTitle>Odontograma 3D</CardTitle>
              <CardDescription>Visualização tridimensional da arcada dentária</CardDescription>
            </CardHeader>
            <CardContent>
              {prontuarioId ? (
                <Odontograma3D prontuarioId={prontuarioId} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum prontuário associado a este paciente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico-odonto">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações do Odontograma</CardTitle>
              <CardDescription>
                Versionamento completo das mudanças realizadas no odontograma ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prontuarioId ? (
                <OdontogramaHistory
                  history={history}
                  onRestore={restoreFromHistory}
                  onCompare={handleCompareSelect}
                  selectedForComparison={selectedForComparison[0] || selectedForComparison[1] || null}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum prontuário associado a este paciente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacao-odonto">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Odontogramas</CardTitle>
              <CardDescription>
                Compare duas versões do odontograma lado a lado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prontuarioId && selectedForComparison[0] && selectedForComparison[1] ? (
                <OdontogramaComparison
                  history={history}
                  selectedIds={[selectedForComparison[0], selectedForComparison[1]]}
                  onClearSelection={() => {
                    setSelectedForComparison([null, null]);
                    setActiveTab('historico-odonto');
                  }}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selecione duas versões do odontograma na aba "Histórico Odonto" para compará-las.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anexos">
          <Card>
            <CardHeader>
              <CardTitle>Anexos e Documentos</CardTitle>
              <CardDescription>Radiografias, exames e documentos complementares</CardDescription>
            </CardHeader>
            <CardContent>
              {prontuarioId ? (
                <AnexosUpload prontuarioId={prontuarioId} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum prontuário associado a este paciente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {prontuarioId && <AssinaturaDigital onSave={(signature) => console.log('Assinatura salva:', signature)} />}
    </div>
  );
}
