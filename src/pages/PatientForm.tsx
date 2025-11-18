import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { PatientFormTabs } from '@/components/patients/PatientFormTabs';
import { PersonalDataTab } from '@/components/patients/form-tabs/PersonalDataTab';
import { ContactAddressTab } from '@/components/patients/form-tabs/ContactAddressTab';
import { MedicalHistoryTab } from '@/components/patients/form-tabs/MedicalHistoryTab';
import { HabitsMeasuresTab } from '@/components/patients/form-tabs/HabitsMeasuresTab';
import { DentalTab } from '@/components/patients/form-tabs/DentalTab';
import { OtherTab } from '@/components/patients/form-tabs/OtherTab';
import { MarketingTrackingTab } from '@/components/patients/form-tabs/MarketingTrackingTab';
import { patientFormSchema, type PatientFormValues, calculateBMI } from '@/lib/patient-validation';
import type { Patient } from '@/types/patient';

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clinicId, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      full_name: '',
      phone_primary: '',
      status: 'PROSPECT',
    },
  });

  // Carregar dados do paciente se estiver editando
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const { data, error } = await supabase
          .from('patients' as any)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          // Converter data do banco para o formato do formulário
          form.reset(data as any);
        }
      } catch (error: any) {
        toast.error('Erro ao carregar paciente', {
          description: error.message,
        });
        navigate('/pacientes');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatient();
  }, [id, form, navigate]);

  // Calcular IMC automaticamente quando peso ou altura mudar
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'weight_kg' || name === 'height_cm') {
        const bmi = calculateBMI(value.weight_kg ?? null, value.height_cm ?? null);
        if (bmi !== null && bmi !== value.bmi) {
          form.setValue('bmi', bmi);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: PatientFormValues) => {
    if (!clinicId || !user) {
      toast.error('Erro', { description: 'Usuário não autenticado' });
      return;
    }

    setIsLoading(true);

    try {
      const dataToSave = {
        ...values,
        clinic_id: clinicId,
        [id ? 'updated_by' : 'created_by']: user.id,
      };

      if (id) {
        // Atualizar paciente existente
        const { error } = await supabase
          .from('patients' as any)
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;

        toast.success('Paciente atualizado com sucesso!');
      } else {
        // Criar novo paciente
        const { error } = await supabase
          .from('patients' as any)
          .insert([dataToSave]);

        if (error) throw error;

        toast.success('Paciente cadastrado com sucesso!');
      }

      navigate('/pacientes');
    } catch (error: any) {
      toast.error('Erro ao salvar paciente', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pacientes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {id ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {id ? 'Atualize as informações do paciente' : 'Preencha os dados do novo paciente'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PatientFormTabs>
            <PersonalDataTab form={form} />
            <ContactAddressTab form={form} />
            <MedicalHistoryTab form={form} />
            <HabitsMeasuresTab form={form} />
            <DentalTab form={form} />
            <OtherTab form={form} />
            <MarketingTrackingTab form={form} />
          </PatientFormTabs>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/pacientes')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Paciente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
