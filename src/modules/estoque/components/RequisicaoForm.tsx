import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { requisicaoSchema, type Requisicao, prioridadesRequisicao } from '../types/estoque.types';
import type { Produto } from '../types/estoque.types';

interface RequisicaoFormProps {
  produtos: Produto[];
  onSubmit: (data: Requisicao) => void;
  onCancel: () => void;
  currentUser: string;
}

export function RequisicaoForm({ produtos, onSubmit, onCancel, currentUser }: RequisicaoFormProps) {
  const form = useForm<Requisicao>({
    resolver: zodResolver(requisicaoSchema),
    defaultValues: {
      produtoId: '',
      quantidade: 1,
      motivo: '',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      solicitadoPor: currentUser,
      observacoes: '',
    },
  });

  const produtoSelecionado = form.watch('produtoId');
  const produto = produtos.find(p => p.id === produtoSelecionado);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="produtoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {produtos.filter(p => p.ativo).map((prod) => (
                    <SelectItem key={prod.id} value={prod.id!}>
                      {prod.nome} - Disponível: {prod.quantidadeAtual} {prod.unidadeMedida}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {produto && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estoque atual:</span>
                <span className="font-medium">{produto.quantidadeAtual} {produto.unidadeMedida}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estoque mínimo:</span>
                <span className="font-medium">{produto.quantidadeMinima} {produto.unidadeMedida}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {prioridadesRequisicao.map((prioridade) => (
                      <SelectItem key={prioridade.value} value={prioridade.value}>
                        {prioridade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Requisição *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o motivo da requisição"
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
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
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
            Solicitar
          </Button>
        </div>
      </form>
    </Form>
  );
}
