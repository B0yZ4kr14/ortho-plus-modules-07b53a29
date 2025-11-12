import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const historicoSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200, 'Título muito longo'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').max(5000, 'Descrição muito longa'),
  dados_estruturados: z.record(z.any()).optional()
});

type HistoricoFormData = z.infer<typeof historicoSchema>;

interface HistoricoClinicoFormProps {
  prontuarioId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HistoricoClinicoForm({ prontuarioId, onSuccess, onCancel }: HistoricoClinicoFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<HistoricoFormData>({
    resolver: zodResolver(historicoSchema)
  });

  const tipo = watch('tipo');

  const onSubmit = async (data: HistoricoFormData) => {
    try {
      // Aqui você faria a chamada para salvar no Supabase
      console.log('Salvando histórico:', { ...data, prontuarioId });
      toast.success('Histórico clínico salvo com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      toast.error('Erro ao salvar histórico clínico');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Registro *</Label>
        <Select onValueChange={(value) => setValue('tipo', value)}>
          <SelectTrigger id="tipo">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANAMNESE">Anamnese</SelectItem>
            <SelectItem value="QUEIXA_PRINCIPAL">Queixa Principal</SelectItem>
            <SelectItem value="EXAME_CLINICO">Exame Clínico</SelectItem>
            <SelectItem value="DIAGNOSTICO">Diagnóstico</SelectItem>
            <SelectItem value="PLANO_TRATAMENTO">Plano de Tratamento</SelectItem>
            <SelectItem value="OBSERVACOES">Observações Gerais</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          placeholder="Ex: Consulta inicial, Avaliação pós-cirúrgica..."
          {...register('titulo')}
        />
        {errors.titulo && <p className="text-sm text-destructive">{errors.titulo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição Detalhada *</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva detalhadamente o histórico clínico, sintomas, observações..."
          rows={8}
          {...register('descricao')}
        />
        {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
        <p className="text-xs text-muted-foreground">
          Mínimo 10 caracteres. Seja detalhado e preciso nas informações.
        </p>
      </div>

      {tipo === 'ANAMNESE' && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
          <h4 className="font-medium text-sm">Informações Adicionais - Anamnese</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
              <Input id="medicamentos" placeholder="Liste os medicamentos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Input id="alergias" placeholder="Alergias conhecidas" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Histórico
        </Button>
      </div>
    </form>
  );
}
