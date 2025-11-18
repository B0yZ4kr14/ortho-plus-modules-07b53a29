import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, ClipboardList, Stethoscope, Smile, FileText, DollarSign, FileImage, History } from 'lucide-react';
import { RiskScoreBadge } from '@/components/patients/RiskScoreBadge';
import { IdentificacaoTab } from '@/components/patients/tabs/IdentificacaoTab';
import { AnamneseTab } from '@/components/patients/tabs/AnamneseTab';
import { ExameClinicoTab } from '@/components/patients/tabs/ExameClinicoTab';
import { OdontogramaTab } from '@/components/patients/tabs/OdontogramaTab';
import { TratamentosTab } from '@/components/patients/tabs/TratamentosTab';
import { FinanceiroTab } from '@/components/patients/tabs/FinanceiroTab';
import { DocumentosTab } from '@/components/patients/tabs/DocumentosTab';
import { HistoricoTab } from '@/components/patients/tabs/HistoricoTab';
import type { Patient } from '@/types/patient';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Patient;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Paciente não encontrado</h2>
        <Button onClick={() => navigate('/pacientes')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pacientes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{patient.full_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <RiskScoreBadge
              riskLevel={patient.risk_level}
              overallScore={patient.risk_score_overall}
              medicalScore={patient.risk_score_medical}
              surgicalScore={patient.risk_score_surgical}
              anestheticScore={patient.risk_score_anesthetic}
              showDetailed
            />
            {patient.patient_code && (
              <span className="text-sm text-muted-foreground">
                Código: {patient.patient_code}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="identificacao" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="identificacao" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Identificação</span>
          </TabsTrigger>
          <TabsTrigger value="anamnese" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Anamnese</span>
          </TabsTrigger>
          <TabsTrigger value="exame" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Exame</span>
          </TabsTrigger>
          <TabsTrigger value="odontograma" className="gap-2">
            <Smile className="h-4 w-4" />
            <span className="hidden sm:inline">Odontograma</span>
          </TabsTrigger>
          <TabsTrigger value="tratamentos" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Tratamentos</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <FileImage className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identificacao">
          <IdentificacaoTab patient={patient} />
        </TabsContent>

        <TabsContent value="anamnese">
          <AnamneseTab patient={patient} />
        </TabsContent>

        <TabsContent value="exame">
          <ExameClinicoTab patient={patient} />
        </TabsContent>

        <TabsContent value="odontograma">
          <OdontogramaTab patient={patient} />
        </TabsContent>

        <TabsContent value="tratamentos">
          <TratamentosTab patient={patient} />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroTab patient={patient} />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosTab patient={patient} />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoTab patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
