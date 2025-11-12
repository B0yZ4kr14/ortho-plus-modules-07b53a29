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
import { movimentacaoSchema, type Movimentacao, tiposMovimentacao } from '../types/estoque.types';
import type { Produto, Fornecedor } from '../types/estoque.types';

interface MovimentacaoFormProps {
  produtos: Produto[];
  fornecedores: Fornecedor[];
  onSubmit: (data: Movimentacao) => void;
  onCancel: () => void;
  currentUser: string;
}

export function MovimentacaoForm({ produtos, fornecedores, onSubmit, onCancel, currentUser }: MovimentacaoFormProps) {
  const form = useForm<Movimentacao>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      produtoId: '',
      tipo: 'ENTRADA',
      quantidade: 1,
      lote: '',
      dataValidade: '',
      motivo: '',
      valorUnitario: 0,
      valorTotal: 0,
      fornecedorId: '',
      notaFiscal: '',
      realizadoPor: currentUser,
      observacoes: '',
    },
  });

  const tipoMovimentacao = form.watch('tipo');
  const quantidade = form.watch('quantidade');
  const valorUnitario = form.watch('valorUnitario');

  // Calcular valor total automaticamente
  if (quantidade && valorUnitario) {
    const total = quantidade * valorUnitario;
    if (form.getValues('valorTotal') !== total) {
      form.setValue('valorTotal', total);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Movimentação *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposMovimentacao.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                        {prod.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="lote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <FormControl>
                  <Input placeholder="Número do lote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(tipoMovimentacao === 'ENTRADA' || tipoMovimentacao === 'DEVOLUCAO') && (
            <>
              <FormField
                control={form.control}
                name="dataValidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Validade</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fornecedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fornecedores.filter(f => f.ativo).map((forn) => (
                          <SelectItem key={forn.id} value={forn.id!}>
                            {forn.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notaFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="Número da NF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valorUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
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
                name="valorTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o motivo da movimentação"
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
            Registrar Movimentação
          </Button>
        </div>
      </form>
    </Form>
  );
}
