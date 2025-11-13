import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

const agendamentoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  periodicidade: z.enum(['SEMANAL', 'MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL']),
  diaExecucao: z.number().min(1).max(31).optional(),
  diaSemana: z.number().min(0).max(6).optional(),
  tipoInventario: z.enum(['GERAL', 'CICLICO', 'PARCIAL', 'ROTATIVO']),
  responsavel: z.string().min(3, 'Nome do responsável é obrigatório'),
  notificarResponsavel: z.boolean().default(true),
  notificarDiasAntes: z.number().min(0).max(30).default(1),
  observacoes: z.string().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface InventarioAgendamentoFormProps {
  onSubmit: (data: AgendamentoFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AgendamentoFormData>;
}

export function InventarioAgendamentoForm({
  onSubmit,
  onCancel,
  initialData,
}: InventarioAgendamentoFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      notificarResponsavel: true,
      notificarDiasAntes: 1,
      ...initialData,
    },
  });

  const periodicidade = watch('periodicidade');
  const notificarResponsavel = watch('notificarResponsavel');

  const handleFormSubmit = async (data: AgendamentoFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informações do Agendamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Agendamento *</Label>
            <Input
              id="nome"
              placeholder="Ex: Inventário Mensal - Instrumentos"
              {...register('nome')}
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              placeholder="Nome do responsável"
              {...register('responsavel')}
            />
            {errors.responsavel && (
              <p className="text-sm text-red-600">{errors.responsavel.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Configuração de Periodicidade */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Periodicidade
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="periodicidade">Frequência *</Label>
            <Select
              value={watch('periodicidade')}
              onValueChange={(value) => setValue('periodicidade', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMANAL">Semanal</SelectItem>
                <SelectItem value="MENSAL">Mensal</SelectItem>
                <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                <SelectItem value="ANUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodicidade === 'SEMANAL' && (
            <div className="space-y-2">
              <Label htmlFor="diaSemana">Dia da Semana *</Label>
              <Select
                value={watch('diaSemana')?.toString()}
                onValueChange={(value) => setValue('diaSemana', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda-feira</SelectItem>
                  <SelectItem value="2">Terça-feira</SelectItem>
                  <SelectItem value="3">Quarta-feira</SelectItem>
                  <SelectItem value="4">Quinta-feira</SelectItem>
                  <SelectItem value="5">Sexta-feira</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {periodicidade && periodicidade !== 'SEMANAL' && (
            <div className="space-y-2">
              <Label htmlFor="diaExecucao">Dia de Execução (1-31) *</Label>
              <Input
                id="diaExecucao"
                type="number"
                min="1"
                max="31"
                placeholder="Dia do mês"
                {...register('diaExecucao', { valueAsNumber: true })}
              />
              {errors.diaExecucao && (
                <p className="text-sm text-red-600">{errors.diaExecucao.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipoInventario">Tipo de Inventário *</Label>
            <Select
              value={watch('tipoInventario')}
              onValueChange={(value) => setValue('tipoInventario', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GERAL">Geral (Todos os produtos)</SelectItem>
                <SelectItem value="CICLICO">Cíclico (Rotativo)</SelectItem>
                <SelectItem value="PARCIAL">Parcial (Categorias)</SelectItem>
                <SelectItem value="ROTATIVO">Rotativo (Amostral)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Configurações de Notificação
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificarResponsavel">Notificar Responsável</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificação quando o inventário for criado
              </p>
            </div>
            <Switch
              id="notificarResponsavel"
              checked={notificarResponsavel}
              onCheckedChange={(checked) => setValue('notificarResponsavel', checked)}
            />
          </div>

          {notificarResponsavel && (
            <div className="space-y-2">
              <Label htmlFor="notificarDiasAntes">Notificar (dias antes)</Label>
              <Input
                id="notificarDiasAntes"
                type="number"
                min="0"
                max="30"
                placeholder="Quantos dias antes"
                {...register('notificarDiasAntes', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Enviar notificação X dias antes da execução do inventário
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Informações adicionais sobre o agendamento..."
          rows={3}
          {...register('observacoes')}
        />
      </div>

      {/* Preview */}
      {periodicidade && (
        <Card className="p-4 bg-primary/5">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Resumo do Agendamento</p>
              <p className="text-sm text-muted-foreground mt-1">
                {getResumoAgendamento(periodicidade, watch('diaExecucao'), watch('diaSemana'))}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Agendamento'}
        </Button>
      </div>
    </form>
  );
}

function getResumoAgendamento(
  periodicidade: string,
  diaExecucao?: number,
  diaSemana?: number
): string {
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  switch (periodicidade) {
    case 'SEMANAL':
      return `Inventário será executado toda ${diaSemana !== undefined ? diasSemana[diaSemana] : 'semana'} às 8h da manhã`;
    case 'MENSAL':
      return `Inventário será executado todo dia ${diaExecucao || 1} de cada mês às 8h da manhã`;
    case 'TRIMESTRAL':
      return `Inventário será executado a cada 3 meses, no dia ${diaExecucao || 1} às 8h da manhã`;
    case 'SEMESTRAL':
      return `Inventário será executado a cada 6 meses, no dia ${diaExecucao || 1} às 8h da manhã`;
    case 'ANUAL':
      return `Inventário será executado anualmente, no dia ${diaExecucao || 1} às 8h da manhã`;
    default:
      return '';
  }
}
