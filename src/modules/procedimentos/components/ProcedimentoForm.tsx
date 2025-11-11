import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProcedimentosStore } from '../hooks/useProcedimentosStore';
import {
  CriarProcedimento,
  criarProcedimentoSchema,
  categoriasDisponiveis,
  unidadesTempo,
} from '../types/procedimento.types';

interface ProcedimentoFormProps {
  procedimentoId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProcedimentoForm({
  procedimentoId,
  onSuccess,
  onCancel,
}: ProcedimentoFormProps) {
  const { adicionarProcedimento, atualizarProcedimento, buscarPorId } =
    useProcedimentosStore();

  const form = useForm<CriarProcedimento>({
    resolver: zodResolver(criarProcedimentoSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      categoria: 'Clínica Geral',
      descricao: '',
      valor: 0,
      duracaoEstimada: 30,
      unidadeTempo: 'minutos',
      materiaisNecessarios: '',
      observacoes: '',
      status: 'Ativo',
    },
  });

  useEffect(() => {
    if (procedimentoId) {
      const procedimento = buscarPorId(procedimentoId);
      if (procedimento) {
        form.reset({
          codigo: procedimento.codigo,
          nome: procedimento.nome,
          categoria: procedimento.categoria,
          descricao: procedimento.descricao,
          valor: procedimento.valor,
          duracaoEstimada: procedimento.duracaoEstimada,
          unidadeTempo: procedimento.unidadeTempo,
          materiaisNecessarios: procedimento.materiaisNecessarios || '',
          observacoes: procedimento.observacoes || '',
          status: procedimento.status,
        });
      }
    }
  }, [procedimentoId, buscarPorId, form]);

  const onSubmit = (data: CriarProcedimento) => {
    if (procedimentoId) {
      atualizarProcedimento(procedimentoId, data);
    } else {
      adicionarProcedimento(data);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basicos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="basicos" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="PROC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriasDisponiveis.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Procedimento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Limpeza e Profilaxia" {...field} />
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
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o procedimento detalhadamente..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor do procedimento em reais
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duracaoEstimada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Estimada *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadeTempo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Tempo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidadesTempo.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
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
              name="materiaisNecessarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materiais Necessários</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os materiais necessários para realizar este procedimento..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: informe os materiais necessários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="observacoes" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Gerais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais, contraindicações, cuidados especiais..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: adicione qualquer informação relevante
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {procedimentoId ? 'Atualizar' : 'Cadastrar'} Procedimento
          </Button>
        </div>
      </form>
    </Form>
  );
}
