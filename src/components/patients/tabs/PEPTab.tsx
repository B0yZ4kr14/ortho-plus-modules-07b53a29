import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PEPTabProps {
  patientId: string;
}

export function PEPTab({ patientId }: PEPTabProps) {
  const { data: prontuarios, isLoading } = useQuery({
    queryKey: ['prontuarios', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Carregando prontuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prontuário Eletrônico do Paciente</h2>
          <p className="text-muted-foreground">Histórico clínico e evolução</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Evolução
        </Button>
      </div>

      {prontuarios && prontuarios.length > 0 ? (
        <div className="space-y-4">
          {prontuarios.map((prontuario) => (
            <Card key={prontuario.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {format(new Date(prontuario.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  Prontuário do Paciente: {prontuario.patient_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registro de evolução clínica e observações do prontuário.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum prontuário registrado ainda.
              <br />
              Clique em "Nova Evolução" para criar o primeiro registro.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
