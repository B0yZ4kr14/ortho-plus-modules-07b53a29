import { useState, useEffect } from 'react';
import { Plus, Video, Calendar, Clock, User, FileText, Pill, ClipboardList } from 'lucide-react';
import { useTeleodontologiaSupabase } from '@/modules/teleodonto/application/hooks/useTeleodontologiaSupabase';
import { VideoRoom } from '@/modules/teleodonto/presentation/components/VideoRoom';
import { TeleconsultaForm } from '@/modules/teleodonto/presentation/components/TeleconsultaForm';
import { PrescricaoRemotaForm } from '@/modules/teleodonto/presentation/components/PrescricaoRemotaForm';
import { TriagemForm } from '@/modules/teleodonto/presentation/components/TriagemForm';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Teleodontologia() {
  const [activeTab, setActiveTab] = useState('agendadas');
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  const [prescricaoDialogOpen, setPrescricaoDialogOpen] = useState(false);
  const [triagemDialogOpen, setTriagemDialogOpen] = useState(false);
  const [selectedTeleconsulta, setSelectedTeleconsulta] = useState<any>(null);
  const [videoRoomData, setVideoRoomData] = useState<any>(null);
  const { toast } = useToast();
  const { user, selectedClinic } = useAuth();

  const {
    teleconsultas,
    loading,
    createTeleconsulta,
    iniciarConsulta,
    createPrescricao,
    createTriagem,
  } = useTeleodontologiaSupabase(selectedClinic?.id || '');

  const agendadas = teleconsultas.filter(t => t.status === 'AGENDADA');
  const emAndamento = teleconsultas.filter(t => t.status === 'EM_ANDAMENTO');
  const concluidas = teleconsultas.filter(t => t.status === 'CONCLUIDA');

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      AGENDADA: 'default',
      EM_ANDAMENTO: 'warning',
      CONCLUIDA: 'success',
      CANCELADA: 'destructive',
      NAO_COMPARECEU: 'destructive',
    };
    return variants[status] || 'default';
  };

  const handleAgendar = async (formData: any) => {
    try {
      await createTeleconsulta({
        ...formData,
        created_by: user?.id,
      });
      setAgendarDialogOpen(false);
    } catch (error) {
      console.error('Error scheduling teleconsulta:', error);
    }
  };

  const handleIniciarConsulta = async (teleconsultaId: string) => {
    try {
      const videoData = await iniciarConsulta(teleconsultaId);
      setVideoRoomData(videoData);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handlePrescricao = async (data: any) => {
    try {
      await createPrescricao(data);
      setPrescricaoDialogOpen(false);
      setSelectedTeleconsulta(null);
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  const handleTriagem = async (data: any) => {
    try {
      await createTriagem(data);
      setTriagemDialogOpen(false);
      setSelectedTeleconsulta(null);
    } catch (error) {
      console.error('Error creating triagem:', error);
    }
  };

  const handleLeaveVideoRoom = () => {
    setVideoRoomData(null);
    toast({
      title: 'Consulta encerrada',
      description: 'A videochamada foi encerrada com sucesso.',
    });
  };

  if (videoRoomData) {
    return (
      <VideoRoom
        token={videoRoomData.token}
        appId={videoRoomData.appId}
        channelName={videoRoomData.channelName}
        uid={videoRoomData.uid}
        teleconsultaId={videoRoomData.teleconsultaId}
        onLeave={handleLeaveVideoRoom}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Video}
          title="Teleodontologia"
          description="Atendimento remoto via videochamada, áudio ou chat"
        />
        <Button variant="elevated" onClick={() => setAgendarDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agendar Teleconsulta
        </Button>
      </div>

      {/* Dialog de Agendamento */}
      <Dialog open={agendarDialogOpen} onOpenChange={setAgendarDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Teleconsulta</DialogTitle>
            <DialogDescription>
              Configure uma videochamada, áudio ou chat com o paciente
            </DialogDescription>
          </DialogHeader>
          <TeleconsultaForm
            onSubmit={handleAgendar}
            onCancel={() => setAgendarDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Prescrição Digital */}
      <Dialog open={prescricaoDialogOpen} onOpenChange={setPrescricaoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescrição Digital Remota</DialogTitle>
            <DialogDescription>
              Crie uma prescrição de medicamento, procedimento ou recomendação
            </DialogDescription>
          </DialogHeader>
          {selectedTeleconsulta && (
            <PrescricaoRemotaForm
              teleconsultaId={selectedTeleconsulta.id}
              onSubmit={handlePrescricao}
              onCancel={() => {
                setPrescricaoDialogOpen(false);
                setSelectedTeleconsulta(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Triagem */}
      <Dialog open={triagemDialogOpen} onOpenChange={setTriagemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Triagem Pré-Consulta</DialogTitle>
            <DialogDescription>
              Preencha as informações sobre os sintomas e anexe fotos se necessário
            </DialogDescription>
          </DialogHeader>
          {selectedTeleconsulta && (
            <TriagemForm
              teleconsultaId={selectedTeleconsulta.id}
              onSubmit={handleTriagem}
              onCancel={() => {
                setTriagemDialogOpen(false);
                setSelectedTeleconsulta(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Agendadas Hoje</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Video className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Em Andamento</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm text-muted-foreground">Concluídas no Mês</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">35min</div>
              <div className="text-sm text-muted-foreground">Duração Média</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="agendadas">
          <Card className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {agendadas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma teleconsulta agendada</p>
                  </div>
                ) : (
                  agendadas.map((consulta) => (
                    <div
                      key={consulta.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{consulta.titulo}</h3>
                          <Badge variant={getStatusVariant(consulta.status)}>Agendada</Badge>
                          <Badge variant="outline">
                            {consulta.tipo === 'VIDEO' ? 'Vídeo' : consulta.tipo}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {consulta.patient_name || 'Paciente'}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(consulta.data_agendada).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs">{consulta.motivo}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTeleconsulta(consulta);
                            setTriagemDialogOpen(true);
                          }}
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Triagem
                        </Button>
                        <Button
                          variant="elevated"
                          onClick={() => handleIniciarConsulta(consulta.id)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Iniciar Consulta
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="andamento">
          <Card className="p-6">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : emAndamento.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Nenhuma consulta em andamento no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emAndamento.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-warning/10"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{consulta.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {consulta.patient_name || 'Paciente'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTeleconsulta(consulta);
                          setPrescricaoDialogOpen(true);
                        }}
                      >
                        <Pill className="h-4 w-4 mr-2" />
                        Prescrição
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleIniciarConsulta(consulta.id)}
                      >
                        Retornar à Consulta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="concluidas">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Funcionalidade em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Histórico completo em desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}