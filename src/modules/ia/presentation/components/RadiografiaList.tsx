import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Analise {
  id: string;
  tipo_radiografia: string;
  imagem_url: string;
  confidence_score: number;
  problemas_detectados: number;
  status_analise: string;
  requer_avaliacao_especialista?: boolean;
  created_at: string;
}

interface RadiografiaListProps {
  analises: Analise[];
  onView?: (analise: Analise) => void;
}

export const RadiografiaList = ({ analises, onView }: RadiografiaListProps) => {
  if (analises.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma análise encontrada</p>
        <p className="text-sm mt-2">Faça upload de uma radiografia para começar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {analises.map((analise) => {
        const confidencePercent = ((analise.confidence_score || 0) * 100).toFixed(0);
        const hasProblems = (analise.problemas_detectados || 0) > 0;

        return (
          <Card key={analise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-black/5">
              <img
                src={analise.imagem_url}
                alt="Radiografia"
                className="w-full h-full object-cover"
              />
              {analise.requer_avaliacao_especialista && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  Requer Avaliação
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {analise.tipo_radiografia}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {confidencePercent}% confiança
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {hasProblems ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-foreground">
                      {analise.problemas_detectados} problema(s)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-foreground">Nenhum problema</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(analise.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>

              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onView(analise)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Análise
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
