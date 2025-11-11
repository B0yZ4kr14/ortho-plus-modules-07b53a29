import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProcedimentosStore } from '../hooks/useProcedimentosStore';
import { formatDate } from '@/lib/utils/date.utils';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ProcedimentoDetailsProps {
  procedimentoId: string;
}

export function ProcedimentoDetails({ procedimentoId }: ProcedimentoDetailsProps) {
  const { buscarPorId } = useProcedimentosStore();
  const procedimento = buscarPorId(procedimentoId);

  if (!procedimento) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Procedimento não encontrado.</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">{procedimento.nome}</h2>
          <StatusBadge status={procedimento.status} />
        </div>
        <p className="text-muted-foreground">Código: {procedimento.codigo}</p>
      </div>

      <Separator />

      {/* Informações Básicas */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Categoria</p>
            <Badge variant="outline" className="mt-1">
              {procedimento.categoria}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="font-medium text-lg text-primary mt-1">
              {formatarValor(procedimento.valor)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duração Estimada</p>
            <p className="font-medium mt-1">
              {formatarDuracao(procedimento.duracaoEstimada, procedimento.unidadeTempo)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium mt-1">{procedimento.status}</p>
          </div>
        </div>
      </Card>

      {/* Descrição */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3 text-lg">Descrição</h3>
        <p className="text-muted-foreground leading-relaxed">
          {procedimento.descricao}
        </p>
      </Card>

      {/* Materiais Necessários */}
      {procedimento.materiaisNecessarios && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 text-lg">Materiais Necessários</h3>
          <p className="text-muted-foreground leading-relaxed">
            {procedimento.materiaisNecessarios}
          </p>
        </Card>
      )}

      {/* Observações */}
      {procedimento.observacoes && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 text-lg">Observações</h3>
          <p className="text-muted-foreground leading-relaxed">
            {procedimento.observacoes}
          </p>
        </Card>
      )}

      {/* Informações de Sistema */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3 text-lg">Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Data de Criação</p>
            <p className="font-medium mt-1">{formatDate(procedimento.dataCriacao)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Última Atualização</p>
            <p className="font-medium mt-1">
              {formatDate(procedimento.dataAtualizacao)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
