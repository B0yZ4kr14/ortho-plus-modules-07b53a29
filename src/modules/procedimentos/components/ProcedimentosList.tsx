import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { useProcedimentosStore } from '../hooks/useProcedimentosStore';
import { categoriasDisponiveis } from '../types/procedimento.types';

interface ProcedimentosListProps {
  onNovo: () => void;
  onEditar: (id: string) => void;
  onVisualizar: (id: string) => void;
  onExcluir: (id: string) => void;
}

export function ProcedimentosList({
  onNovo,
  onEditar,
  onVisualizar,
  onExcluir,
}: ProcedimentosListProps) {
  const { procedimentos } = useProcedimentosStore();
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const procedimentosFiltrados = useMemo(() => {
    return procedimentos.filter((proc) => {
      const matchBusca =
        proc.nome.toLowerCase().includes(busca.toLowerCase()) ||
        proc.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        proc.descricao.toLowerCase().includes(busca.toLowerCase());

      const matchCategoria =
        categoriaFiltro === 'todos' || proc.categoria === categoriaFiltro;

      const matchStatus = statusFiltro === 'todos' || proc.status === statusFiltro;

      return matchBusca && matchCategoria && matchStatus;
    });
  }, [procedimentos, busca, categoriaFiltro, statusFiltro]);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarDuracao = (duracao: number, unidade: string) => {
    return `${duracao} ${unidade}`;
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome, código ou descrição..."
          className="w-full sm:w-96"
        />

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              {categoriasDisponiveis.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onNovo}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Procedimento
          </Button>
        </div>
      </div>

      {/* Lista de procedimentos */}
      <div className="grid gap-4">
        {procedimentosFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum procedimento encontrado com os filtros selecionados.
            </p>
          </Card>
        ) : (
          procedimentosFiltrados.map((proc) => (
            <Card key={proc.id} className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{proc.nome}</h3>
                        <StatusBadge status={proc.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Código: {proc.codigo}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {proc.descricao}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Categoria: </span>
                      <span className="font-medium">{proc.categoria}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duração: </span>
                      <span className="font-medium">
                        {formatarDuracao(proc.duracaoEstimada, proc.unidadeTempo)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-medium text-primary">
                        {formatarValor(proc.valor)}
                      </span>
                    </div>
                  </div>
                </div>

                <ActionButtons
                  onView={() => onVisualizar(proc.id!)}
                  onEdit={() => onEditar(proc.id!)}
                  onDelete={() => onExcluir(proc.id!)}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Contador */}
      <div className="text-sm text-muted-foreground text-center">
        Exibindo {procedimentosFiltrados.length} de {procedimentos.length}{' '}
        procedimento(s)
      </div>
    </div>
  );
}
