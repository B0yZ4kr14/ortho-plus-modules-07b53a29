import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, AlertCircle, Download, Eye } from 'lucide-react';

interface Problema {
  tipo: string;
  localizacao: string;
  severidade: 'baixa' | 'moderada' | 'alta' | 'crítica';
  descricao: string;
  recomendacao: string;
}

interface ResultadoIA {
  problemas_detectados: Problema[];
  observacoes_gerais: string;
  dentes_avaliados: number[];
  qualidade_imagem: 'baixa' | 'regular' | 'boa' | 'excelente';
  requer_avaliacao_especialista: boolean;
}

interface RadiografiaViewerProps {
  imagemUrl: string;
  resultadoIA: ResultadoIA;
  confidence: number;
  tipo: string;
  onDownload?: () => void;
}

const getSeveridadeColor = (severidade: string) => {
  const colors: Record<string, string> = {
    baixa: 'default',
    moderada: 'secondary',
    alta: 'default',
    crítica: 'destructive',
  };
  return colors[severidade] || 'default';
};

const getSeveridadeIcon = (severidade: string) => {
  const icons: Record<string, any> = {
    baixa: CheckCircle2,
    moderada: AlertCircle,
    alta: AlertTriangle,
    crítica: AlertTriangle,
  };
  return icons[severidade] || AlertCircle;
};

const getQualidadeColor = (qualidade: string) => {
  const colors: Record<string, string> = {
    baixa: 'destructive',
    regular: 'secondary',
    boa: 'default',
    excelente: 'default',
  };
  return colors[qualidade] || 'default';
};

export const RadiografiaViewer = ({
  imagemUrl,
  resultadoIA,
  confidence,
  tipo,
  onDownload,
}: RadiografiaViewerProps) => {
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna Esquerda - Imagem */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Imagem da Radiografia</CardTitle>
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border bg-black/5">
              <img
                src={imagemUrl}
                alt="Radiografia"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{tipo}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Qualidade da Imagem:</span>
                <Badge variant={getQualidadeColor(resultadoIA.qualidade_imagem) as any}>
                  {resultadoIA.qualidade_imagem}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confiança da IA:</span>
                <span className="font-medium text-foreground">{confidencePercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dentes Avaliados:</span>
                <span className="font-medium text-foreground">
                  {resultadoIA.dentes_avaliados.length} dentes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Resultado da Análise */}
      <div className="space-y-4">
        {resultadoIA.requer_avaliacao_especialista && (
          <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Avaliação Especializada Recomendada
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Esta análise requer revisão de um profissional qualificado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Problemas Detectados ({resultadoIA.problemas_detectados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultadoIA.problemas_detectados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum problema detectado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resultadoIA.problemas_detectados.map((problema, index) => {
                  const Icon = getSeveridadeIcon(problema.severidade);
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {problema.tipo}
                              </p>
                              <Badge variant={getSeveridadeColor(problema.severidade) as any}>
                                {problema.severidade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Dente(s): {problema.localizacao}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-foreground">
                        {problema.descricao}
                      </p>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          Recomendação:
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {problema.recomendacao}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {resultadoIA.observacoes_gerais && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-line">
                {resultadoIA.observacoes_gerais}
              </p>
            </CardContent>
          </Card>
        )}

        {resultadoIA.dentes_avaliados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dentes Visualizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resultadoIA.dentes_avaliados.map((dente) => (
                  <Badge key={dente} variant="outline">
                    {dente}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
