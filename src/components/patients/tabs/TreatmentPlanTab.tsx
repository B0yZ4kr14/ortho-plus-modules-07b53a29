import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardPlus, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TreatmentPlanTabProps {
  patientId: string;
}

export function TreatmentPlanTab({ patientId }: TreatmentPlanTabProps) {
  const { data: treatments, isLoading } = useQuery<any[]>({
    queryKey: ['patient-treatments', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pep_tratamentos')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planejado: 'Planejado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return <div>Carregando planos de tratamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Plano de Tratamento</h2>
          <p className="text-muted-foreground">Procedimentos planejados e realizados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tratamento
        </Button>
      </div>

      {treatments && treatments.length > 0 ? (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <Card key={treatment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardPlus className="h-5 w-5" />
                      {treatment.titulo}
                    </CardTitle>
                    <CardDescription>
                      Dente: {treatment.dente_codigo || 'Não especificado'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getStatusIcon(treatment.status)}
                    {getStatusLabel(treatment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Data Início:</span>{' '}
                    {treatment.data_inicio 
                      ? format(new Date(treatment.data_inicio), "dd/MM/yyyy", { locale: ptBR })
                      : 'Não iniciado'}
                  </div>
                  <div>
                    <span className="font-semibold">Data Conclusão:</span>{' '}
                    {treatment.data_conclusao 
                      ? format(new Date(treatment.data_conclusao), "dd/MM/yyyy", { locale: ptBR })
                      : 'Em andamento'}
                  </div>
                  {treatment.valor_estimado && (
                    <div>
                      <span className="font-semibold">Valor Estimado:</span>{' '}
                      R$ {treatment.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                  {treatment.descricao && (
                    <div>
                      <span className="font-semibold">Descrição:</span>{' '}
                      {treatment.descricao}
                    </div>
                  )}
                </div>
                {treatment.observacoes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{treatment.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum plano de tratamento registrado ainda.
              <br />
              Clique em "Novo Tratamento" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
