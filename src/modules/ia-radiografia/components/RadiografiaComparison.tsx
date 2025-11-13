import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calendar, GitCompare, TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import type { AnaliseComplete } from '../types/radiografia.types';
import { tipoRadiografiaLabels } from '../types/radiografia.types';
import { ComparativoPDFExport } from './ComparativoPDFExport';

interface RadiografiaComparisonProps {
  analises: AnaliseComplete[];
}

export function RadiografiaComparison({ analises }: RadiografiaComparisonProps) {
  const [analise1Id, setAnalise1Id] = useState<string>('');
  const [analise2Id, setAnalise2Id] = useState<string>('');

  // Agrupar análises por paciente
  const analisesPorPaciente = useMemo(() => {
    const pacientes = new Map<string, AnaliseComplete[]>();
    
    analises.forEach((analise) => {
      const patientId = analise.patient_id;
      if (!pacientes.has(patientId)) {
        pacientes.set(patientId, []);
      }
      pacientes.get(patientId)!.push(analise);
    });
    
    // Filtrar apenas pacientes com 2+ análises
    return Array.from(pacientes.entries())
      .filter(([_, analisesArr]) => analisesArr.length >= 2)
      .map(([patientId, analisesArr]) => ({
        patientId,
        patientName: analisesArr[0].patient_name,
        analises: analisesArr.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }));
  }, [analises]);

  const analise1 = useMemo(() => 
    analises.find(a => a.id === analise1Id), 
    [analises, analise1Id]
  );
  
  const analise2 = useMemo(() => 
    analises.find(a => a.id === analise2Id), 
    [analises, analise2Id]
  );

  // Calcular diferenças
  const comparacao = useMemo(() => {
    if (!analise1 || !analise2) return null;

    const problemas1 = analise1.problemas_detectados || 0;
    const problemas2 = analise2.problemas_detectados || 0;
    const diferencaProblemas = problemas2 - problemas1;
    
    const precisao1 = analise1.confidence_score || 0;
    const precisao2 = analise2.confidence_score || 0;
    const diferencaPrecisao = precisao2 - precisao1;

    const diasEntre = Math.abs(
      Math.floor((new Date(analise2.created_at).getTime() - new Date(analise1.created_at).getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      problemas: {
        valor: diferencaProblemas,
        percentual: problemas1 > 0 ? ((diferencaProblemas / problemas1) * 100).toFixed(1) : '0',
        tendencia: diferencaProblemas > 0 ? 'aumentou' : diferencaProblemas < 0 ? 'diminuiu' : 'manteve'
      },
      precisao: {
        valor: diferencaPrecisao.toFixed(1),
        tendencia: diferencaPrecisao > 0 ? 'melhorou' : diferencaPrecisao < 0 ? 'piorou' : 'manteve'
      },
      diasEntre
    };
  }, [analise1, analise2]);

  const getTendenciaIcon = (tendencia: string) => {
    if (tendencia === 'aumentou' || tendencia === 'piorou') return TrendingUp;
    if (tendencia === 'diminuiu' || tendencia === 'melhorou') return TrendingDown;
    return Minus;
  };

  const getTendenciaColor = (tendencia: string, invertido = false) => {
    const positivo = invertido ? (tendencia === 'diminuiu' || tendencia === 'melhorou') : (tendencia === 'aumentou' || tendencia === 'melhorou');
    const negativo = invertido ? (tendencia === 'aumentou' || tendencia === 'piorou') : (tendencia === 'diminuiu' || tendencia === 'piorou');
    
    if (positivo) return 'text-success';
    if (negativo) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Card className="p-6" depth="intense">
      <div className="flex items-center gap-2 mb-6">
        <GitCompare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Comparação de Radiografias</h2>
      </div>

      {analisesPorPaciente.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum paciente com múltiplas análises disponível</p>
          <p className="text-sm mt-2">É necessário pelo menos 2 análises do mesmo paciente</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Seleção de Paciente */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selecione um Paciente</label>
            <Select 
              value={analise1?.patient_id || ''} 
              onValueChange={(patientId) => {
                const paciente = analisesPorPaciente.find(p => p.patientId === patientId);
                if (paciente && paciente.analises.length >= 2) {
                  setAnalise1Id(paciente.analises[0].id);
                  setAnalise2Id(paciente.analises[1].id);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {analisesPorPaciente.map((paciente) => (
                  <SelectItem key={paciente.patientId} value={paciente.patientId}>
                    {paciente.patientName} ({paciente.analises.length} análises)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {analise1 && analise2 && (
            <>
              {/* Grid de Comparação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Análise 1 */}
                <Card className="p-4 border-2 border-primary/20" depth="normal">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Primeira Análise</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(analise1.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden bg-black/5 aspect-video">
                      <img 
                        src={analise1.imagem_url} 
                        alt="Radiografia 1" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Tipo:</span>
                        <p className="text-sm font-medium">
                          {tipoRadiografiaLabels[analise1.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Problemas Detectados:</span>
                        <p className="text-2xl font-bold text-warning">
                          {analise1.problemas_detectados || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Precisão da IA:</span>
                        <p className="text-2xl font-bold text-primary">
                          {analise1.confidence_score ? Math.round(analise1.confidence_score) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Análise 2 */}
                <Card className="p-4 border-2 border-success/20" depth="normal">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Segunda Análise</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(analise2.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden bg-black/5 aspect-video">
                      <img 
                        src={analise2.imagem_url} 
                        alt="Radiografia 2" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Tipo:</span>
                        <p className="text-sm font-medium">
                          {tipoRadiografiaLabels[analise2.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Problemas Detectados:</span>
                        <p className="text-2xl font-bold text-warning">
                          {analise2.problemas_detectados || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Precisão da IA:</span>
                        <p className="text-2xl font-bold text-primary">
                          {analise2.confidence_score ? Math.round(analise2.confidence_score) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Análise Comparativa */}
              {comparacao && (
                <Card className="p-6 bg-primary/5 border-primary/20" depth="normal">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      Análise Comparativa
                    </h3>
                    <ComparativoPDFExport 
                      analise1={analise1} 
                      analise2={analise2} 
                      comparacao={comparacao}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Período entre análises</p>
                      <p className="text-3xl font-bold">{comparacao.diasEntre} dias</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Problemas Detectados</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getTendenciaIcon(comparacao.problemas.tendencia);
                          return (
                            <>
                              <Icon className={`h-5 w-5 ${getTendenciaColor(comparacao.problemas.tendencia, true)}`} />
                              <span className={`text-3xl font-bold ${getTendenciaColor(comparacao.problemas.tendencia, true)}`}>
                                {comparacao.problemas.valor > 0 ? '+' : ''}{comparacao.problemas.valor}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {comparacao.problemas.percentual}% {comparacao.problemas.tendencia}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Precisão da IA</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getTendenciaIcon(comparacao.precisao.tendencia);
                          return (
                            <>
                              <Icon className={`h-5 w-5 ${getTendenciaColor(comparacao.precisao.tendencia)}`} />
                              <span className={`text-3xl font-bold ${getTendenciaColor(comparacao.precisao.tendencia)}`}>
                                {Number(comparacao.precisao.valor) > 0 ? '+' : ''}{comparacao.precisao.valor}%
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {comparacao.precisao.tendencia}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        {comparacao.problemas.valor < 0 && (
                          <p className="text-success font-medium">
                            Evolução positiva: Redução de {Math.abs(comparacao.problemas.valor)} problema(s) detectado(s).
                          </p>
                        )}
                        {comparacao.problemas.valor > 0 && (
                          <p className="text-destructive font-medium">
                            Atenção necessária: Aumento de {comparacao.problemas.valor} problema(s) detectado(s).
                          </p>
                        )}
                        {comparacao.problemas.valor === 0 && (
                          <p className="text-muted-foreground font-medium">
                            Situação estável: Número de problemas manteve-se constante.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Seleção Manual de Análises */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Primeira Análise</label>
                  <Select value={analise1Id} onValueChange={setAnalise1Id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {analisesPorPaciente
                        .find(p => p.patientId === analise1.patient_id)
                        ?.analises.map((analise) => (
                          <SelectItem key={analise.id} value={analise.id}>
                            {new Date(analise.created_at).toLocaleDateString('pt-BR')} - {tipoRadiografiaLabels[analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Segunda Análise</label>
                  <Select value={analise2Id} onValueChange={setAnalise2Id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {analisesPorPaciente
                        .find(p => p.patientId === analise2.patient_id)
                        ?.analises.map((analise) => (
                          <SelectItem key={analise.id} value={analise.id}>
                            {new Date(analise.created_at).toLocaleDateString('pt-BR')} - {tipoRadiografiaLabels[analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
