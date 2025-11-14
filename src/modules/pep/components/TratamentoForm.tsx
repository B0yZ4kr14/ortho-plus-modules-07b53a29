import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTratamentos } from '@/modules/pep/hooks/useTratamentos';
import { useAuth } from '@/contexts/AuthContext';

const tratamentoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200, 'Título muito longo'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').max(5000, 'Descrição muito longa'),
  dente_codigo: z.string().optional(),
  status: z.enum(['EM_ANDAMENTO', 'CONCLUIDO', 'PAUSADO', 'CANCELADO']),
  data_inicio: z.date(),
  data_conclusao: z.date().optional(),
  valor_estimado: z.string().optional(),
  observacoes: z.string().optional()
});

type TratamentoFormData = z.infer<typeof tratamentoSchema>;

interface TratamentoFormProps {
  prontuarioId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TratamentoForm({ prontuarioId, onSuccess, onCancel }: TratamentoFormProps) {
  const { user, clinicId } = useAuth();
  const { createTratamento } = useTratamentos(prontuarioId, clinicId || '');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TratamentoFormData>({
    resolver: zodResolver(tratamentoSchema),
    defaultValues: {
      status: 'EM_ANDAMENTO',
      data_inicio: new Date()
    }
  });

  const dataInicio = watch('data_inicio');
  const dataConclusao = watch('data_conclusao');

  const onSubmit = async (data: TratamentoFormData) => {
    if (!user) return;

    try {
      await createTratamento({
        titulo: data.titulo,
        descricao: data.descricao,
        denteCodigo: data.dente_codigo,
        valorEstimado: data.valor_estimado ? parseFloat(data.valor_estimado) : undefined,
        dataInicio: data.data_inicio,
        createdBy: user.id,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar tratamento:', error);
      // Toast já exibido pelo hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="titulo">Título do Tratamento *</Label>
          <Input
            id="titulo"
            placeholder="Ex: Implante dentário, Canal do dente 18..."
            {...register('titulo')}
          />
          {errors.titulo && <p className="text-sm text-destructive">{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dente_codigo">Dente</Label>
          <Input
            id="dente_codigo"
            placeholder="Ex: 18, 21, 36..."
            {...register('dente_codigo')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select defaultValue="EM_ANDAMENTO" onValueChange={(value) => setValue('status', value as any)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              <SelectItem value="PAUSADO">Pausado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data de Início *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataInicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataInicio}
                onSelect={(date) => date && setValue('data_inicio', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Data de Conclusão</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataConclusao && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataConclusao ? format(dataConclusao, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataConclusao}
                onSelect={(date) => date && setValue('data_conclusao', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="descricao">Descrição do Tratamento *</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva o tratamento, procedimentos, materiais utilizados..."
            rows={5}
            {...register('descricao')}
          />
          {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
          <Input
            id="valor_estimado"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register('valor_estimado')}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="observacoes">Observações Adicionais</Label>
          <Textarea
            id="observacoes"
            placeholder="Observações, recomendações, cuidados pós-tratamento..."
            rows={3}
            {...register('observacoes')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Tratamento
        </Button>
      </div>
    </form>
  );
}
