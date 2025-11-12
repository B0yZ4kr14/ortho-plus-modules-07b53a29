import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { categoriaSchema, type Categoria } from '../types/estoque.types';

interface CategoriaFormProps {
  categoria?: Categoria;
  onSubmit: (data: Categoria) => void;
  onCancel: () => void;
}

const CORES_PREDEFINIDAS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export function CategoriaForm({ categoria, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm<Categoria>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: categoria || {
      nome: '',
      descricao: '',
      cor: '#3b82f6',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Materiais de Restauração" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição da categoria"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor da Categoria</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  {CORES_PREDEFINIDAS.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => field.onChange(cor)}
                      className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: cor,
                        borderColor: field.value === cor ? 'hsl(var(--foreground))' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {categoria ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
