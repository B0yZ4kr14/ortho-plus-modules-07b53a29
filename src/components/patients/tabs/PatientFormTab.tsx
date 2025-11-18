import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PatientFormTabs } from '../PatientFormTabs';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientFormTabProps {
  patientId: string;
}

export function PatientFormTab({ patientId }: PatientFormTabProps) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-form', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return <div>Paciente não encontrado</div>;
  }

  // Renderiza formulário de edição simplificado
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dados Cadastrais</h3>
      <p className="text-muted-foreground">Visualização dos dados cadastrais do paciente.</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-semibold">Nome Completo:</span> {patient.full_name}
        </div>
        <div>
          <span className="font-semibold">CPF:</span> {patient.cpf || 'Não informado'}
        </div>
        <div>
          <span className="font-semibold">Telefone:</span> {patient.phone_primary}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {patient.email || 'Não informado'}
        </div>
      </div>
    </div>
  );
}
