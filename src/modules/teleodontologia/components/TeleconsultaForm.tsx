// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teleconsultaSchema } from '../types/teleodontologia.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { z } from 'zod';

type TeleconsultaFormData = z.infer<typeof teleconsultaSchema>;

interface TeleconsultaFormProps {
  onSubmit: (data: TeleconsultaFormData) => void;
  onCancel: () => void;
}

export const TeleconsultaForm = ({ onSubmit, onCancel }: TeleconsultaFormProps) => {
  const { selectedClinic } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeleconsultaFormData>({
    resolver: zodResolver(teleconsultaSchema),
    defaultValues: {
      clinic_id: selectedClinic?.id,
      tipo: 'VIDEO',
      status: 'AGENDADA',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, nome')
          .eq('clinic_id', selectedClinic?.id)
          .order('nome');

        if (patientsError) throw patientsError;

        // Load dentists (users with ADMIN or MEMBER role)
        const { data: dentistsData, error: dentistsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('clinic_id', selectedClinic?.id)
          .order('full_name');

        if (dentistsError) throw dentistsError;

        setPatients(patientsData || []);
        setDentists(dentistsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedClinic?.id) {
      loadData();
    }
  }, [selectedClinic]);

  const handleFormSubmit = (data: TeleconsultaFormData) => {
    onSubmit(data);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient_id">Paciente *</Label>
          <Select
            onValueChange={(value) => setValue('patient_id', value)}
            value={watch('patient_id')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient_id && (
            <p className="text-sm text-destructive mt-1">{errors.patient_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dentist_id">Dentista *</Label>
          <Select
            onValueChange={(value) => setValue('dentist_id', value)}
            value={watch('dentist_id')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o dentista" />
            </SelectTrigger>
            <SelectContent>
              {dentists.map((dentist) => (
                <SelectItem key={dentist.id} value={dentist.id}>
                  {dentist.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dentist_id && (
            <p className="text-sm text-destructive mt-1">{errors.dentist_id.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          placeholder="Ex: Avaliação de Tratamento"
          {...register('titulo')}
        />
        {errors.titulo && (
          <p className="text-sm text-destructive mt-1">{errors.titulo.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_agendada">Data e Hora *</Label>
          <Input
            id="data_agendada"
            type="datetime-local"
            {...register('data_agendada')}
          />
          {errors.data_agendada && (
            <p className="text-sm text-destructive mt-1">{errors.data_agendada.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Consulta *</Label>
          <Select
            onValueChange={(value) => setValue('tipo', value as 'VIDEO' | 'AUDIO' | 'CHAT')}
            value={watch('tipo')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDEO">Videochamada</SelectItem>
              <SelectItem value="AUDIO">Áudio</SelectItem>
              <SelectItem value="CHAT">Chat</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-destructive mt-1">{errors.tipo.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="motivo">Motivo da Consulta *</Label>
        <Textarea
          id="motivo"
          placeholder="Descreva o motivo da teleconsulta"
          rows={3}
          {...register('motivo')}
        />
        {errors.motivo && (
          <p className="text-sm text-destructive mt-1">{errors.motivo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="observacoes">Observações (Opcional)</Label>
        <Textarea
          id="observacoes"
          placeholder="Observações adicionais"
          rows={2}
          {...register('observacoes')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="elevated" disabled={isSubmitting}>
          {isSubmitting ? 'Agendando...' : 'Agendar Teleconsulta'}
        </Button>
      </div>
    </form>
  );
};
