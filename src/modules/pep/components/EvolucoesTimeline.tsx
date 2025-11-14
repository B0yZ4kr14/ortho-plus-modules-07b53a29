import { useState, useEffect } from 'react';
import { Calendar, FileText, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEvolucoes } from '@/modules/pep/hooks/useEvolucoes';
import { useAuth } from '@/contexts/AuthContext';

interface Evolucao {
  id: string;
  data_evolucao: string;
  tipo: string;
  descricao: string;
  created_by: string;
  tratamento_id: string;
}

interface EvolucoesTimelineProps {
  prontuarioId: string;
}

export function EvolucoesTimeline({ prontuarioId }: EvolucoesTimelineProps) {
  const { clinicId } = useAuth();
  const { evolucoes: evolucoesData, isLoading } = useEvolucoes(prontuarioId, clinicId || '');
  
  const [filteredEvolucoes, setFilteredEvolucoes] = useState<Evolucao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  // Converter entidades de domínio para o formato do componente
  const evolucoes = evolucoesData.map(e => ({
    id: e.id,
    data_evolucao: e.data.toISOString(),
    tipo: 'PROCEDIMENTO',
    descricao: e.descricao,
    created_by: e.createdBy,
    tratamento_id: e.tratamentoId,
  }));

  useEffect(() => {
    filterEvolucoes();
  }, [evolucoes, searchTerm, filterTipo]);

  const filterEvolucoes = () => {
    let filtered = [...evolucoes];

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterTipo !== 'TODOS') {
      filtered = filtered.filter(e => e.tipo === filterTipo);
    }

    setFilteredEvolucoes(filtered);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CONSULTA: 'Consulta',
      PROCEDIMENTO: 'Procedimento',
      RETORNO: 'Retorno',
      EMERGENCIA: 'Emergência',
      OBSERVACAO: 'Observação'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      CONSULTA: 'bg-blue-500',
      PROCEDIMENTO: 'bg-green-500',
      RETORNO: 'bg-yellow-500',
      EMERGENCIA: 'bg-red-500',
      OBSERVACAO: 'bg-gray-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline de Evoluções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nas evoluções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                <SelectItem value="CONSULTA">Consultas</SelectItem>
                <SelectItem value="PROCEDIMENTO">Procedimentos</SelectItem>
                <SelectItem value="RETORNO">Retornos</SelectItem>
                <SelectItem value="EMERGENCIA">Emergências</SelectItem>
                <SelectItem value="OBSERVACAO">Observações</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filteredEvolucoes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma evolução encontrada</p>
              {searchTerm || filterTipo !== 'TODOS' ? (
                <p className="text-sm mt-1">Tente ajustar os filtros</p>
              ) : (
                <p className="text-sm mt-1">Registre a primeira evolução do tratamento</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-border" />

          <div className="space-y-4">
            {filteredEvolucoes.map((evolucao, index) => (
              <div key={evolucao.id} className="relative pl-12">
                {/* Marcador da timeline */}
                <div className={`absolute left-3 top-3 w-5 h-5 rounded-full ${getTipoColor(evolucao.tipo)} border-4 border-background`} />

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getTipoLabel(evolucao.tipo)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(evolucao.data_evolucao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{evolucao.descricao}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
