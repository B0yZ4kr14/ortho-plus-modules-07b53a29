// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeleodontologiaSupabase } from '@/modules/teleodontologia/hooks/useTeleodontologiaSupabase';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, FileText, ClipboardList, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { statusLabels, tipoLabels } from '@/modules/teleodontologia/types/teleodontologia.types';

export default function HistoricoTeleconsultas() {
  const { user } = useAuth();
  const clinicId = user?.user_metadata?.clinic_id;
  
  const { teleconsultas, prescricoes, triagens, loading } = useTeleodontologiaSupabase(clinicId);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const consultasConcluidas = teleconsultas.filter(t => t.status === 'CONCLUIDA');

  const getPrescricoesForConsulta = (teleconsultaId: string) => {
    return prescricoes.filter(p => p.teleconsulta_id === teleconsultaId);
  };

  const getTriagemForConsulta = (teleconsultaId: string) => {
    return triagens.find(t => t.teleconsulta_id === teleconsultaId);
  };

  const handleViewDetails = (consulta: any) => {
    setSelectedConsulta(consulta);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Histórico de Teleconsultas"
          description="Revise vídeos gravados, prescrições e triagens"
        />
        <div className="mt-6">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Histórico de Teleconsultas"
        description="Revise vídeos gravados, prescrições e triagens"
      />

      <div className="mt-6 space-y-4">
        {consultasConcluidas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma teleconsulta concluída encontrada.
            </CardContent>
          </Card>
        ) : (
          consultasConcluidas.map((consulta) => {
            const prescricoesConsulta = getPrescricoesForConsulta(consulta.id);
            const triagemConsulta = getTriagemForConsulta(consulta.id);

            return (
              <Card key={consulta.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{consulta.titulo}</h3>
                        <Badge variant="outline">{statusLabels[consulta.status]}</Badge>
                        <Badge variant="secondary">{tipoLabels[consulta.tipo]}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Paciente: {consulta.patient_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Dentista: {consulta.dentist_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(consulta.data_agendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{consulta.duracao_minutos || 0} minutos</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        {consulta.link_sala && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Video className="h-4 w-4" />
                            <span>Vídeo disponível</span>
                          </div>
                        )}
                        {prescricoesConsulta.length > 0 && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <FileText className="h-4 w-4" />
                            <span>{prescricoesConsulta.length} prescrições</span>
                          </div>
                        )}
                        {triagemConsulta && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <ClipboardList className="h-4 w-4" />
                            <span>Triagem preenchida</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button onClick={() => handleViewDetails(consulta)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedConsulta?.titulo}</DialogTitle>
          </DialogHeader>

          {selectedConsulta && (
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="video">
                  <Video className="h-4 w-4 mr-2" />
                  Vídeo
                </TabsTrigger>
                <TabsTrigger value="diagnostico">
                  <FileText className="h-4 w-4 mr-2" />
                  Diagnóstico
                </TabsTrigger>
                <TabsTrigger value="prescricoes">
                  <FileText className="h-4 w-4 mr-2" />
                  Prescrições
                </TabsTrigger>
                <TabsTrigger value="triagem">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Triagem
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gravação da Consulta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedConsulta.link_sala ? (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Reprodutor de vídeo será integrado com Agora.io Cloud Recording
                          </p>
                          <p className="text-xs text-muted-foreground">
                            URL da gravação: {selectedConsulta.link_sala}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma gravação disponível para esta consulta.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnostico" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnóstico e Conduta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Motivo da Consulta</h4>
                      <p className="text-sm text-muted-foreground">{selectedConsulta.motivo}</p>
                    </div>
                    {selectedConsulta.diagnostico && (
                      <div>
                        <h4 className="font-semibold mb-2">Diagnóstico</h4>
                        <p className="text-sm text-muted-foreground">{selectedConsulta.diagnostico}</p>
                      </div>
                    )}
                    {selectedConsulta.conduta && (
                      <div>
                        <h4 className="font-semibold mb-2">Conduta</h4>
                        <p className="text-sm text-muted-foreground">{selectedConsulta.conduta}</p>
                      </div>
                    )}
                    {selectedConsulta.observacoes && (
                      <div>
                        <h4 className="font-semibold mb-2">Observações</h4>
                        <p className="text-sm text-muted-foreground">{selectedConsulta.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescricoes" className="space-y-4">
                {getPrescricoesForConsulta(selectedConsulta.id).length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhuma prescrição emitida nesta consulta.
                    </CardContent>
                  </Card>
                ) : (
                  getPrescricoesForConsulta(selectedConsulta.id).map((prescricao, index) => (
                    <Card key={prescricao.id}>
                      <CardHeader>
                        <CardTitle className="text-base">Prescrição {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-semibold">Tipo:</span>{' '}
                          <Badge variant="outline">{prescricao.tipo}</Badge>
                        </div>
                        <div>
                          <span className="font-semibold">Descrição:</span>{' '}
                          <p className="text-sm text-muted-foreground mt-1">{prescricao.descricao}</p>
                        </div>
                        {prescricao.medicamento_nome && (
                          <>
                            <div>
                              <span className="font-semibold">Medicamento:</span>{' '}
                              <span className="text-sm">{prescricao.medicamento_nome}</span>
                            </div>
                            {prescricao.medicamento_dosagem && (
                              <div>
                                <span className="font-semibold">Dosagem:</span>{' '}
                                <span className="text-sm">{prescricao.medicamento_dosagem}</span>
                              </div>
                            )}
                            {prescricao.medicamento_frequencia && (
                              <div>
                                <span className="font-semibold">Frequência:</span>{' '}
                                <span className="text-sm">{prescricao.medicamento_frequencia}</span>
                              </div>
                            )}
                            {prescricao.medicamento_duracao && (
                              <div>
                                <span className="font-semibold">Duração:</span>{' '}
                                <span className="text-sm">{prescricao.medicamento_duracao}</span>
                              </div>
                            )}
                          </>
                        )}
                        {prescricao.instrucoes && (
                          <div>
                            <span className="font-semibold">Instruções:</span>{' '}
                            <p className="text-sm text-muted-foreground mt-1">{prescricao.instrucoes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="triagem" className="space-y-4">
                {getTriagemForConsulta(selectedConsulta.id) ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Triagem Pré-Consulta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Sintomas</h4>
                        <div className="flex flex-wrap gap-2">
                          {getTriagemForConsulta(selectedConsulta.id).sintomas.map((sintoma, idx) => (
                            <Badge key={idx} variant="secondary">{sintoma}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Intensidade da Dor</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{ width: `${getTriagemForConsulta(selectedConsulta.id).intensidade_dor * 10}%` }}
                            />
                          </div>
                          <span className="font-semibold">{getTriagemForConsulta(selectedConsulta.id).intensidade_dor}/10</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Tempo de Sintoma</h4>
                        <p className="text-sm text-muted-foreground">
                          {getTriagemForConsulta(selectedConsulta.id).tempo_sintoma}
                        </p>
                      </div>
                      {getTriagemForConsulta(selectedConsulta.id).alergias && (
                        <div>
                          <h4 className="font-semibold mb-2">Alergias</h4>
                          <p className="text-sm text-muted-foreground">
                            {getTriagemForConsulta(selectedConsulta.id).alergias}
                          </p>
                        </div>
                      )}
                      {getTriagemForConsulta(selectedConsulta.id).medicamentos_uso && (
                        <div>
                          <h4 className="font-semibold mb-2">Medicamentos em Uso</h4>
                          <p className="text-sm text-muted-foreground">
                            {getTriagemForConsulta(selectedConsulta.id).medicamentos_uso}
                          </p>
                        </div>
                      )}
                      {getTriagemForConsulta(selectedConsulta.id).fotos_anexas && 
                       getTriagemForConsulta(selectedConsulta.id).fotos_anexas.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Fotos Anexadas</h4>
                          <div className="grid grid-cols-3 gap-4">
                            {getTriagemForConsulta(selectedConsulta.id).fotos_anexas.map((foto, idx) => (
                              <div key={idx} className="space-y-1">
                                <img 
                                  src={foto.url} 
                                  alt={foto.descricao}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <p className="text-xs text-muted-foreground">{foto.descricao}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhuma triagem preenchida para esta consulta.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
