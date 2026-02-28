import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Scan, Image, ClipboardPlus, DollarSign, Activity, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { STATUS_LABELS, STATUS_COLORS, PatientStatus } from '@/types/patient-status';

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!patientId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Paciente não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Patient Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pacientes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className={STATUS_COLORS[patient.status as PatientStatus]}>
                {STATUS_LABELS[patient.status as PatientStatus]}
              </Badge>
              <span className="text-sm text-muted-foreground">{patient.phone_primary}</span>
              {patient.email && (
                <span className="text-sm text-muted-foreground">{patient.email}</span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/pacientes/editar/${patientId}`)}>
          Editar Dados
        </Button>
      </div>
      
      {/* Unified Tabs */}
      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="cadastro" className="gap-2">
            <User className="h-4 w-4" />
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger value="prontuario" className="gap-2">
            <FileText className="h-4 w-4" />
            Prontuário
          </TabsTrigger>
          <TabsTrigger value="odontograma" className="gap-2">
            <Scan className="h-4 w-4" />
            Odontograma
          </TabsTrigger>
          <TabsTrigger value="imagens" className="gap-2">
            <Image className="h-4 w-4" />
            Imagens/RX
          </TabsTrigger>
          <TabsTrigger value="tratamento" className="gap-2">
            <ClipboardPlus className="h-4 w-4" />
            Plano Tratamento
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Activity className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cadastro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                <p className="text-base">{patient.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p className="text-base">{patient.cpf || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone Principal</p>
                <p className="text-base">{patient.phone_primary || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{patient.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                <p className="text-base">{patient.birth_date || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="outline" className={STATUS_COLORS[patient.status as PatientStatus]}>
                  {STATUS_LABELS[patient.status as PatientStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Tracking Info */}
          {(patient.marketing_campaign || patient.marketing_source) && (
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento Comercial</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {patient.marketing_campaign && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campanha</p>
                    <p className="text-base">{patient.marketing_campaign}</p>
                  </div>
                )}
                {patient.marketing_source && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Origem</p>
                    <p className="text-base">{patient.marketing_source}</p>
                  </div>
                )}
                {patient.marketing_event && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evento</p>
                    <p className="text-base">{patient.marketing_event}</p>
                  </div>
                )}
                {patient.marketing_promoter && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Promotor</p>
                    <p className="text-base">{patient.marketing_promoter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="prontuario">
          <Card>
            <CardHeader>
              <CardTitle>Prontuário Eletrônico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Conteúdo do prontuário será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="odontograma">
          <Card>
            <CardHeader>
              <CardTitle>Odontograma</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Odontograma será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="imagens">
          <Card>
            <CardHeader>
              <CardTitle>Imagens e Radiografias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Galeria de imagens será exibida aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tratamento">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Plano de tratamento será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Financeiro do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Informações financeiras serão exibidas aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Histórico completo será exibido aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
