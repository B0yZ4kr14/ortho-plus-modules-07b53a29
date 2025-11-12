// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescricaoRemotaSchema } from '../types/teleodontologia.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { z } from 'zod';

type PrescricaoFormData = z.infer<typeof prescricaoRemotaSchema>;

interface PrescricaoRemotaFormProps {
  teleconsultaId: string;
  onSubmit: (data: PrescricaoFormData) => void;
  onCancel: () => void;
}

export const PrescricaoRemotaForm = ({ teleconsultaId, onSubmit, onCancel }: PrescricaoRemotaFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrescricaoFormData>({
    resolver: zodResolver(prescricaoRemotaSchema),
    defaultValues: {
      teleconsulta_id: teleconsultaId,
      tipo: 'MEDICAMENTO',
    },
  });

  const tipo = watch('tipo');

  const handleFormSubmit = (data: PrescricaoFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="tipo">Tipo de Prescrição *</Label>
        <Select
          onValueChange={(value) => setValue('tipo', value as any)}
          value={tipo}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEDICAMENTO">Medicamento</SelectItem>
            <SelectItem value="PROCEDIMENTO">Procedimento</SelectItem>
            <SelectItem value="RECOMENDACAO">Recomendação</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipo && (
          <p className="text-sm text-destructive mt-1">{errors.tipo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          placeholder="Descrição geral da prescrição"
          rows={2}
          {...register('descricao')}
        />
        {errors.descricao && (
          <p className="text-sm text-destructive mt-1">{errors.descricao.message}</p>
        )}
      </div>

      {tipo === 'MEDICAMENTO' && (
        <Card className="p-4 space-y-3 bg-muted/50">
          <h4 className="font-semibold text-sm">Detalhes do Medicamento</h4>
          
          <div>
            <Label htmlFor="medicamento_nome">Nome do Medicamento</Label>
            <Input
              id="medicamento_nome"
              placeholder="Ex: Amoxicilina"
              {...register('medicamento_nome')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="medicamento_dosagem">Dosagem</Label>
              <Input
                id="medicamento_dosagem"
                placeholder="Ex: 500mg"
                {...register('medicamento_dosagem')}
              />
            </div>

            <div>
              <Label htmlFor="medicamento_frequencia">Frequência</Label>
              <Input
                id="medicamento_frequencia"
                placeholder="Ex: 8/8h"
                {...register('medicamento_frequencia')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medicamento_duracao">Duração do Tratamento</Label>
            <Input
              id="medicamento_duracao"
              placeholder="Ex: 7 dias"
              {...register('medicamento_duracao')}
            />
          </div>
        </Card>
      )}

      <div>
        <Label htmlFor="instrucoes">Instruções de Uso</Label>
        <Textarea
          id="instrucoes"
          placeholder="Instruções detalhadas para o paciente"
          rows={3}
          {...register('instrucoes')}
        />
        {errors.instrucoes && (
          <p className="text-sm text-destructive mt-1">{errors.instrucoes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="elevated" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Prescrição'}
        </Button>
      </div>
    </form>
  );
};
