import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Activity } from 'lucide-react';
import type { AnaliseComplete } from '../types/radiografia.types';
import { tipoRadiografiaLabels } from '../types/radiografia.types';

interface IAInsightsDashboardProps {
  analises: AnaliseComplete[];
}

export function IAInsightsDashboard({ analises }: IAInsightsDashboardProps) {
  // Análise de padrões mais comuns
  const padroesMaisComuns = useMemo(() => {
    const problemas = new Map<string, number>();
    
    analises.forEach((analise) => {
      const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
      problemasDetectados.forEach((problema: any) => {
        const tipo = problema.tipo || 'Problema Dentário';
        problemas.set(tipo, (problemas.get(tipo) || 0) + 1);
      });
    });
    
    return Array.from(problemas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipo, ocorrencias]) => ({ tipo, ocorrencias }));
  }, [analises]);

  // Áreas problemáticas mais frequentes
  const areasProblematicas = useMemo(() => {
    const areas = new Map<string, number>();
    
    analises.forEach((analise) => {
      const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
      problemasDetectados.forEach((problema: any) => {
        const localizacao = problema.localizacao || 'Não especificada';
        areas.set(localizacao, (areas.get(localizacao) || 0) + 1);
      });
    });
    
    return Array.from(areas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, ocorrencias]) => ({ area, ocorrencias }));
  }, [analises]);

  // Severidades mais comuns
  const severidades = useMemo(() => {
    const sevs = new Map<string, number>();
    
    analises.forEach((analise) => {
      const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
      problemasDetectados.forEach((problema: any) => {
        const sev = problema.severidade || 'MÉDIA';
        sevs.set(sev, (sevs.get(sev) || 0) + 1);
      });
    });
    
    return Array.from(sevs.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([severidade, quantidade]) => ({ severidade, quantidade }));
  }, [analises]);

  // Tipos de radiografia mais analisados
  const tiposMaisAnalisados = useMemo(() => {
    const tipos = new Map<string, number>();
    
    analises.forEach((analise) => {
      const tipo = tipoRadiografiaLabels[analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels] || analise.tipo_radiografia;
      tipos.set(tipo, (tipos.get(tipo) || 0) + 1);
    });
    
    return Array.from(tipos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }));
  }, [analises]);

  // Taxa média de problemas por análise
  const taxaMediaProblemas = useMemo(() => {
    if (analises.length === 0) return 0;
    const totalProblemas = analises.reduce((sum, a) => sum + (a.problemas_detectados || 0), 0);
    return (totalProblemas / analises.length).toFixed(1);
  }, [analises]);

  // Precisão média geral
  const precisaoMediaGeral = useMemo(() => {
    const analisesComPrecisao = analises.filter(a => a.confidence_score && a.confidence_score > 0);
    if (analisesComPrecisao.length === 0) return 0;
    const totalPrecisao = analisesComPrecisao.reduce((sum, a) => sum + (a.confidence_score || 0), 0);
    return Math.round(totalPrecisao / analisesComPrecisao.length);
  }, [analises]);

  // Recomendações preventivas
  const recomendacoesPreventivas = useMemo(() => {
    const recomendacoes: { titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa' }[] = [];
    
    // Baseado nos padrões mais comuns
    if (padroesMaisComuns.length > 0 && padroesMaisComuns[0].ocorrencias > analises.length * 0.3) {
      recomendacoes.push({
        titulo: `Foco em ${padroesMaisComuns[0].tipo}`,
        descricao: `Este tipo de problema representa ${Math.round((padroesMaisComuns[0].ocorrencias / analises.length) * 100)}% das análises. Considere implementar protocolos preventivos específicos.`,
        prioridade: 'alta'
      });
    }
    
    // Baseado em áreas problemáticas
    if (areasProblematicas.length > 0 && areasProblematicas[0].ocorrencias > analises.length * 0.25) {
      recomendacoes.push({
        titulo: `Atenção à área: ${areasProblematicas[0].area}`,
        descricao: `Esta área apresenta problemas recorrentes. Recomenda-se exames mais frequentes e acompanhamento preventivo.`,
        prioridade: 'alta'
      });
    }
    
    // Baseado na taxa média de problemas
    if (Number(taxaMediaProblemas) > 2) {
      recomendacoes.push({
        titulo: 'Taxa elevada de problemas detectados',
        descricao: `Média de ${taxaMediaProblemas} problemas por análise. Considere revisar protocolos de higiene oral e frequência de check-ups.`,
        prioridade: 'media'
      });
    }
    
    // Baseado em severidades
    const problemasAltos = severidades.find(s => s.severidade === 'ALTA');
    if (problemasAltos && problemasAltos.quantidade > analises.length * 0.15) {
      recomendacoes.push({
        titulo: 'Casos de alta severidade frequentes',
        descricao: `${problemasAltos.quantidade} casos de alta severidade detectados. Priorize intervenções rápidas e acompanhamento intensivo.`,
        prioridade: 'alta'
      });
    }
    
    // Recomendação geral se tudo estiver bem
    if (recomendacoes.length === 0 && analises.length > 5) {
      recomendacoes.push({
        titulo: 'Manutenção do padrão atual',
        descricao: 'Os dados indicam boa saúde dental geral. Continue com os protocolos preventivos atuais e check-ups regulares.',
        prioridade: 'baixa'
      });
    }
    
    return recomendacoes;
  }, [padroesMaisComuns, areasProblematicas, taxaMediaProblemas, severidades, analises.length]);

  const getPrioridadeColor = (prioridade: string) => {
    const colors: Record<string, any> = {
      alta: 'destructive',
      media: 'warning',
      baixa: 'success'
    };
    return colors[prioridade] || 'default';
  };

  const getSeveridadeColor = (severidade: string) => {
    const colors: Record<string, any> = {
      ALTA: 'destructive',
      MEDIA: 'warning',
      BAIXA: 'success'
    };
    return colors[severidade] || 'default';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6" depth="intense">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Dashboard de Insights da IA</h2>
        </div>

        {analises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma análise disponível para gerar insights</p>
            <p className="text-sm mt-2">Realize algumas análises para visualizar padrões e recomendações</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Métricas Resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-primary/5 border-primary/20" depth="subtle">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total de Análises</span>
                </div>
                <p className="text-2xl font-bold">{analises.length}</p>
              </Card>
              
              <Card className="p-4 bg-warning/5 border-warning/20" depth="subtle">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Média Problemas/Análise</span>
                </div>
                <p className="text-2xl font-bold text-warning">{taxaMediaProblemas}</p>
              </Card>
              
              <Card className="p-4 bg-success/5 border-success/20" depth="subtle">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Precisão Média IA</span>
                </div>
                <p className="text-2xl font-bold text-success">{precisaoMediaGeral}%</p>
              </Card>
              
              <Card className="p-4 bg-primary/5 border-primary/20" depth="subtle">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Padrões Identificados</span>
                </div>
                <p className="text-2xl font-bold">{padroesMaisComuns.length}</p>
              </Card>
            </div>

            {/* Padrões Mais Comuns */}
            <Card className="p-6" depth="normal">
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Padrões Mais Comuns Detectados
              </h3>
              <div className="space-y-3">
                {padroesMaisComuns.map((padrao, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
                      <span className="font-medium">{padrao.tipo}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{padrao.ocorrencias}</p>
                      <p className="text-xs text-muted-foreground">ocorrências</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Áreas Problemáticas */}
            <Card className="p-6" depth="normal">
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Áreas Problemáticas Mais Frequentes
              </h3>
              <div className="space-y-3">
                {areasProblematicas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
                      <span className="font-medium">{area.area}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-warning">{area.ocorrencias}</p>
                      <p className="text-xs text-muted-foreground">casos</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Distribuição de Severidades */}
            <Card className="p-6" depth="normal">
              <h3 className="text-md font-semibold mb-4">Distribuição por Severidade</h3>
              <div className="grid grid-cols-3 gap-4">
                {severidades.map((sev, index) => (
                  <div key={index} className="text-center p-4 bg-accent/50 rounded-lg">
                    <Badge variant={getSeveridadeColor(sev.severidade) as any} className="mb-2">
                      {sev.severidade}
                    </Badge>
                    <p className="text-2xl font-bold">{sev.quantidade}</p>
                    <p className="text-xs text-muted-foreground">casos</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tipos Mais Analisados */}
            <Card className="p-6" depth="normal">
              <h3 className="text-md font-semibold mb-4">Tipos de Radiografia Mais Analisados</h3>
              <div className="space-y-2">
                {tiposMaisAnalisados.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm">{tipo.tipo}</span>
                    <Badge variant="outline">{tipo.quantidade} análises</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recomendações Preventivas */}
            <Card className="p-6 bg-success/5 border-success/20" depth="normal">
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-success" />
                Recomendações Preventivas
              </h3>
              <div className="space-y-4">
                {recomendacoesPreventivas.map((rec, index) => (
                  <Alert key={index} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${getPrioridadeColor(rec.prioridade)}))` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {rec.titulo}
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          {rec.descricao}
                        </AlertDescription>
                      </div>
                      <Badge variant={getPrioridadeColor(rec.prioridade) as any}>
                        {rec.prioridade.toUpperCase()}
                      </Badge>
                    </div>
                  </Alert>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
