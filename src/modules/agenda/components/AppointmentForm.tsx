import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Appointment, appointmentSchema, Dentista } from '../types/agenda.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  appointment?: Appointment;
  dentistas: Dentista[];
  pacientes: Array<{ id: string; nome: string }>;
  onSubmit: (data: Appointment) => void;
  onCancel: () => void;
  initialDate?: string;
  initialTime?: string;
}

export function AppointmentForm({
  appointment,
  dentistas,
  pacientes,
  onSubmit,
  onCancel,
  initialDate,
  initialTime,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Appointment>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment || {
      data: initialDate || '',
      horaInicio: initialTime || '',
      horaFim: '',
      status: 'Agendada',
      lembreteEnviado: false,
    },
  });

  const selectedDate = watch('data');
  const selectedPacienteId = watch('pacienteId');
  const selectedDentistaId = watch('dentistaId');

  // Update paciente name when pacienteId changes
  useEffect(() => {
    if (selectedPacienteId) {
      const paciente = pacientes.find(p => p.id === selectedPacienteId);
      if (paciente) {
        setValue('pacienteNome', paciente.nome);
      }
    }
  }, [selectedPacienteId, pacientes, setValue]);

  // Update dentista name when dentistaId changes
  useEffect(() => {
    if (selectedDentistaId) {
      const dentista = dentistas.find(d => d.id === selectedDentistaId);
      if (dentista) {
        setValue('dentistaNome', dentista.nome);
      }
    }
  }, [selectedDentistaId, dentistas, setValue]);

  const horarios = Array.from({ length: 26 }, (_, i) => {
    const hora = Math.floor(i / 2) + 8;
    const minuto = i % 2 === 0 ? '00' : '30';
    return `${hora.toString().padStart(2, '0')}:${minuto}`;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paciente */}
        <div className="space-y-2">
          <Label htmlFor="pacienteId">Paciente *</Label>
          <Select
            value={watch('pacienteId')}
            onValueChange={(value) => setValue('pacienteId', value)}
          >
            <SelectTrigger className={errors.pacienteId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {pacientes.map((paciente) => (
                <SelectItem key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.pacienteId && (
            <p className="text-sm text-destructive">{errors.pacienteId.message}</p>
          )}
        </div>

        {/* Dentista */}
        <div className="space-y-2">
          <Label htmlFor="dentistaId">Dentista *</Label>
          <Select
            value={watch('dentistaId')}
            onValueChange={(value) => setValue('dentistaId', value)}
          >
            <SelectTrigger className={errors.dentistaId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione o dentista" />
            </SelectTrigger>
            <SelectContent>
              {dentistas.map((dentista) => (
                <SelectItem key={dentista.id} value={dentista.id}>
                  {dentista.nome} {dentista.especialidade && `- ${dentista.especialidade}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dentistaId && (
            <p className="text-sm text-destructive">{errors.dentistaId.message}</p>
          )}
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label>Data *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground',
                  errors.data && 'border-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(new Date(selectedDate), 'PPP', { locale: ptBR }) : 'Selecione a data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) => date && setValue('data', format(date, 'yyyy-MM-dd'))}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.data && (
            <p className="text-sm text-destructive">{errors.data.message}</p>
          )}
        </div>

        {/* Hora Início */}
        <div className="space-y-2">
          <Label htmlFor="horaInicio">Hora Início *</Label>
          <Select
            value={watch('horaInicio')}
            onValueChange={(value) => setValue('horaInicio', value)}
          >
            <SelectTrigger className={errors.horaInicio ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione o horário" />
            </SelectTrigger>
            <SelectContent>
              {horarios.map((hora) => (
                <SelectItem key={hora} value={hora}>
                  {hora}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.horaInicio && (
            <p className="text-sm text-destructive">{errors.horaInicio.message}</p>
          )}
        </div>

        {/* Hora Fim */}
        <div className="space-y-2">
          <Label htmlFor="horaFim">Hora Fim *</Label>
          <Select
            value={watch('horaFim')}
            onValueChange={(value) => setValue('horaFim', value)}
          >
            <SelectTrigger className={errors.horaFim ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione o horário" />
            </SelectTrigger>
            <SelectContent>
              {horarios.map((hora) => (
                <SelectItem key={hora} value={hora}>
                  {hora}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.horaFim && (
            <p className="text-sm text-destructive">{errors.horaFim.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as Appointment['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Agendada">Agendada</SelectItem>
              <SelectItem value="Confirmada">Confirmada</SelectItem>
              <SelectItem value="Realizada">Realizada</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
              <SelectItem value="Faltou">Faltou</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Procedimento */}
      <div className="space-y-2">
        <Label htmlFor="procedimento">Procedimento *</Label>
        <Input
          id="procedimento"
          {...register('procedimento')}
          placeholder="Ex: Limpeza, Restauração, Canal..."
          className={errors.procedimento ? 'border-destructive' : ''}
        />
        {errors.procedimento && (
          <p className="text-sm text-destructive">{errors.procedimento.message}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Observações adicionais sobre a consulta..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {appointment ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
}
