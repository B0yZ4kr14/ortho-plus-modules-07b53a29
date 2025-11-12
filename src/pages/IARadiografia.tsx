import { useState } from 'react';
import { Plus, Scan, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function IARadiografia() {
  const [uploading, setUploading] = useState(false);

  // Mock data - em produção viria do hook useRadiografiaSupabase
  const analises = [
    {
      id: '1',
      patient_name: 'Maria Santos',
      tipo_radiografia: 'PANORAMICA',
      status_analise: 'CONCLUIDA',
      problemas_detectados: 3,
      confidence_score: 92.5,
      created_at: new Date().toISOString(),
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: 'text-muted-foreground',
      PROCESSANDO: 'text-warning',
      CONCLUIDA: 'text-success',
      ERRO: 'text-destructive',
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDENTE: Clock,
      PROCESSANDO: Clock,
      CONCLUIDA: CheckCircle,
      ERRO: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Scan}
          title="IA Análise de Radiografias"
          description="Detecção automática de problemas dentários via Inteligência Artificial"
        />
        <Button variant="elevated">
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload de Raio-X
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total de Análises</div>
          <div className="text-3xl font-bold mt-2">127</div>
          <Badge variant="success" className="mt-2">+12 este mês</Badge>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Problemas Detectados</div>
          <div className="text-3xl font-bold mt-2 text-warning">45</div>
          <Badge variant="warning" className="mt-2">Requer atenção</Badge>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Precisão Média da IA</div>
          <div className="text-3xl font-bold mt-2 text-success">94.3%</div>
          <Progress value={94.3} className="mt-2" />
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Em Processamento</div>
          <div className="text-3xl font-bold mt-2">3</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 animate-spin" />
            Processando...
          </div>
        </Card>
      </div>

      {/* Informações sobre a IA */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Scan className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Como funciona a Análise por IA?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nossa IA utiliza Google Gemini Vision avançada treinada com milhares de radiografias odontológicas 
              para detectar automaticamente cáries, fraturas, problemas periodontais e outras condições. 
              A precisão média é de 94%, mas sempre recomendamos revisão profissional.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Detecção de Cáries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Fraturas Dentárias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Problemas Periodontais</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Lesões Periapicais</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Análises */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Análises Recentes</h2>
        <div className="space-y-4">
          {analises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma análise realizada ainda</p>
              <p className="text-sm mt-2">Faça upload de um raio-X para começar</p>
            </div>
          ) : (
            analises.map((analise) => (
              <div
                key={analise.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{analise.patient_name}</h3>
                    <Badge variant="outline">Panorâmica</Badge>
                    <div className={`flex items-center gap-1 text-sm ${getStatusColor(analise.status_analise)}`}>
                      {getStatusIcon(analise.status_analise)}
                      <span>Concluída</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Data: {new Date(analise.created_at).toLocaleString('pt-BR')}</p>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-warning" />
                      {analise.problemas_detectados} problema(s) detectado(s)
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-success">{analise.confidence_score}%</div>
                    <div className="text-xs text-muted-foreground">Confiança da IA</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
