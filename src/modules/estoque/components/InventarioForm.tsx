import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Inventario, inventarioSchema, tiposInventario } from '../types/estoque.types';
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
import { format } from 'date-fns';

interface InventarioFormProps {
  inventario?: Inventario;
  onSubmit: (data: Inventario) => void;
  onCancel: () => void;
}

export function InventarioForm({ inventario, onSubmit, onCancel }: InventarioFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inventario>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: inventario || {
      numero: `INV-${format(new Date(), 'yyyy')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      data: format(new Date(), 'yyyy-MM-dd'),
      status: 'PLANEJADO',
      tipo: 'GERAL',
      responsavel: '',
      observacoes: '',
    },
  });

  const tipo = watch('tipo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número */}
        <div className="space-y-2">
          <Label htmlFor="numero">Número do Inventário *</Label>
          <Input
            id="numero"
            {...register('numero')}
            className={errors.numero ? 'border-destructive' : ''}
          />
          {errors.numero && (
            <p className="text-sm text-destructive">{errors.numero.message}</p>
          )}
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            type="date"
            {...register('data')}
            className={errors.data ? 'border-destructive' : ''}
          />
          {errors.data && (
            <p className="text-sm text-destructive">{errors.data.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Inventário *</Label>
          <Select value={watch('tipo')} onValueChange={(value) => setValue('tipo', value as any)}>
            <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposInventario.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  <div>
                    <div className="font-medium">{tipo.label}</div>
                    <div className="text-xs text-muted-foreground">{tipo.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </div>

        {/* Responsável */}
        <div className="space-y-2">
          <Label htmlFor="responsavel">Responsável *</Label>
          <Input
            id="responsavel"
            {...register('responsavel')}
            placeholder="Nome do responsável pela contagem"
            className={errors.responsavel ? 'border-destructive' : ''}
          />
          {errors.responsavel && (
            <p className="text-sm text-destructive">{errors.responsavel.message}</p>
          )}
        </div>
      </div>

      {/* Informações sobre o tipo selecionado */}
      {tipo && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>{tiposInventario.find(t => t.value === tipo)?.label}:</strong>{' '}
            {tiposInventario.find(t => t.value === tipo)?.description}
          </p>
        </div>
      )}

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Informações adicionais sobre o inventário..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {inventario ? 'Atualizar' : 'Criar'} Inventário
        </Button>
      </div>
    </form>
  );
}
