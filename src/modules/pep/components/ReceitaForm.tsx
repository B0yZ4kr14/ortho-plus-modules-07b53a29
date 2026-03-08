import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const receitaSchema = z.object({
  pacienteNome: z.string().min(1, 'Nome do paciente obrigatório'),
  medicamento: z.string().min(1, 'Medicamento obrigatório'),
  composicao: z.string().min(1, 'Composição obrigatória'),
  quantidade: z.string().min(1, 'Quantidade obrigatória'),
  uso: z.string().min(1, 'Modo de uso obrigatório'),
  validade: z.enum(['30', '60', '90', '120']),
  observacoes: z.string().optional(),
});

type ReceitaFormData = z.infer<typeof receitaSchema>;

interface ReceitaFormProps {
  prontuarioId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReceitaForm({ prontuarioId, onSuccess, onCancel }: ReceitaFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      validade: '30',
    },
  });

  const onSubmit = (data: ReceitaFormData) => {
    const receita = {
      ...data,
      prontuarioId,
      dataEmissao: new Date().toISOString(),
      dataValidade: new Date(Date.now() + parseInt(data.validade) * 24 * 60 * 60 * 1000).toISOString(),
    };

    toast.success('Receita criada com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pacienteNome">Nome do Paciente</Label>
        <Input id="pacienteNome" {...register('pacienteNome')} />
        {errors.pacienteNome && (
          <p className="text-sm text-destructive">{errors.pacienteNome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicamento">Medicamento</Label>
        <Input
          id="medicamento"
          {...register('medicamento')}
          placeholder="Ex: Gel de Clorexidina 0,12%"
        />
        {errors.medicamento && (
          <p className="text-sm text-destructive">{errors.medicamento.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="composicao">Composição</Label>
        <Textarea
          id="composicao"
          {...register('composicao')}
          rows={3}
          placeholder="Ex: Clorexidina 0,12%, excipiente q.s.p."
        />
        {errors.composicao && (
          <p className="text-sm text-destructive">{errors.composicao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            id="quantidade"
            {...register('quantidade')}
            placeholder="Ex: 1 frasco de 250ml"
          />
          {errors.quantidade && (
            <p className="text-sm text-destructive">{errors.quantidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="validade">Validade (dias)</Label>
          <Select
            defaultValue="30"
            onValueChange={(value) => setValue('validade', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="120">120 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="uso">Modo de Uso</Label>
        <Textarea
          id="uso"
          {...register('uso')}
          rows={3}
          placeholder="Ex: Fazer bochecho com 15ml por 30 segundos, 2 vezes ao dia"
        />
        {errors.uso && (
          <p className="text-sm text-destructive">{errors.uso.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações (Opcional)</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          rows={2}
          placeholder="Ex: Não ingerir alimentos por 30 minutos após uso"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Receita</Button>
      </div>
    </form>
  );
}
