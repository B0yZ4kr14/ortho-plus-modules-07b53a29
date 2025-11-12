import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { pedidoConfigSchema, type PedidoConfig, type Produto } from '../types/estoque.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PedidoConfigFormProps {
  produtos: Produto[];
  config?: PedidoConfig;
  onSubmit: (data: PedidoConfig) => void;
  onCancel: () => void;
}

export function PedidoConfigForm({ produtos, config, onSubmit, onCancel }: PedidoConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PedidoConfig>({
    resolver: zodResolver(pedidoConfigSchema),
    defaultValues: config || {
      gerarAutomaticamente: true,
      diasEntregaEstimados: 7,
    },
  });

  const selectedProdutoId = watch('produtoId');
  const selectedProduto = produtos.find(p => p.id === selectedProdutoId);

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="produtoId">Produto *</Label>
            <Select
              value={watch('produtoId')}
              onValueChange={(value) => setValue('produtoId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id!}>
                    {produto.nome} - Estoque: {produto.quantidadeAtual} (Mín: {produto.quantidadeMinima})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.produtoId && (
              <p className="text-sm text-destructive mt-1">{errors.produtoId.message}</p>
            )}
          </div>

          {selectedProduto && (
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Estoque Atual</p>
                  <p className="font-semibold">{selectedProduto.quantidadeAtual}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estoque Mínimo</p>
                  <p className="font-semibold">{selectedProduto.quantidadeMinima}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pontoPedido">Ponto de Pedido *</Label>
              <Input
                id="pontoPedido"
                type="number"
                step="0.01"
                {...register('pontoPedido', { valueAsNumber: true })}
                placeholder="Ex: 10"
              />
              {errors.pontoPedido && (
                <p className="text-sm text-destructive mt-1">{errors.pontoPedido.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Gerar pedido quando estoque atingir este valor
              </p>
            </div>

            <div>
              <Label htmlFor="quantidadeReposicao">Quantidade de Reposição *</Label>
              <Input
                id="quantidadeReposicao"
                type="number"
                step="0.01"
                {...register('quantidadeReposicao', { valueAsNumber: true })}
                placeholder="Ex: 50"
              />
              {errors.quantidadeReposicao && (
                <p className="text-sm text-destructive mt-1">{errors.quantidadeReposicao.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Quantidade a ser pedida automaticamente
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="diasEntregaEstimados">Prazo de Entrega (dias) *</Label>
            <Input
              id="diasEntregaEstimados"
              type="number"
              {...register('diasEntregaEstimados', { valueAsNumber: true })}
              placeholder="Ex: 7"
            />
            {errors.diasEntregaEstimados && (
              <p className="text-sm text-destructive mt-1">{errors.diasEntregaEstimados.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="gerarAutomaticamente"
              checked={watch('gerarAutomaticamente')}
              onCheckedChange={(checked) => setValue('gerarAutomaticamente', checked)}
            />
            <Label htmlFor="gerarAutomaticamente" className="cursor-pointer">
              Gerar pedidos automaticamente
            </Label>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </form>
    </Card>
  );
}