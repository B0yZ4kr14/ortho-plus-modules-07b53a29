import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TreatmentSuggestion {
  tooth_number: number;
  tooth_status?: string;
  procedure: string;
  priority: 'alta' | 'media' | 'baixa';
  estimated_cost: number;
  estimated_duration?: string;
  clinical_notes?: string;
}

interface OdontogramaAIAnalysisProps {
  prontuarioId: string;
  patientId?: string;
  onTreatmentCreate?: (suggestions: TreatmentSuggestion[]) => void;
}

const priorityConfig = {
  alta: { label: 'Alta', color: 'destructive', icon: AlertTriangle },
  media: { label: 'Média', color: 'default', icon: TrendingUp },
  baixa: { label: 'Baixa', color: 'secondary', icon: CheckCircle2 },
} as const;

export const OdontogramaAIAnalysis = ({ prontuarioId, patientId, onTreatmentCreate }: OdontogramaAIAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [suggestions, setSuggestions] = useState<TreatmentSuggestion[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('analyze-odontogram', {
        body: { prontuarioId }
      });

      if (error) throw error;

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setPatientName(data.patient_name);
        toast.success(`Análise concluída! ${data.suggestions.length} sugestões de tratamento geradas.`);
      } else {
        toast.info(data.message || 'Nenhuma sugestão de tratamento necessária.');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao analisar odontograma');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCreateTreatments = () => {
    const selectedItems = suggestions.filter((_, index) => selectedSuggestions.has(index));
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos uma sugestão para criar tratamentos');
      return;
    }
    onTreatmentCreate?.(selectedItems);
    toast.success(`${selectedItems.length} tratamento(s) criado(s) com sucesso!`);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
  };

  const handleScheduleAppointments = async () => {
    const selectedItems = suggestions.filter((_, index) => selectedSuggestions.has(index));
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos uma sugestão para agendar consultas');
      return;
    }

    if (!patientId) {
      toast.error('ID do paciente não disponível');
      return;
    }

    setIsScheduling(true);

    try {
      // Primeiro criar os tratamentos
      onTreatmentCreate?.(selectedItems);

      // Depois agendar as consultas automaticamente
      const { data, error } = await supabase.functions.invoke('schedule-appointments', {
        body: { 
          treatments: selectedItems,
          patientId: patientId,
          dentistId: 'mock-dentist-id' // Em produção, seria selecionado pelo usuário
        }
      });

      if (error) throw error;

      toast.success(data.message || 'Consultas agendadas automaticamente!');
      setSuggestions([]);
      setSelectedSuggestions(new Set());
    } catch (error) {
      console.error('Erro ao agendar consultas:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao agendar consultas');
    } finally {
      setIsScheduling(false);
    }
  };

  const totalCost = suggestions
    .filter((_, index) => selectedSuggestions.has(index))
    .reduce((sum, s) => sum + s.estimated_cost, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise Inteligente com IA
            </CardTitle>
            <CardDescription>
              Analise automaticamente dentes problemáticos e receba sugestões de tratamentos com orçamentos
            </CardDescription>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analisar Odontograma
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {suggestions.length > 0 && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Paciente: {patientName}</p>
              <p className="text-sm text-muted-foreground">
                {suggestions.length} sugestão(ões) de tratamento • {selectedSuggestions.size} selecionada(s)
              </p>
            </div>
            {selectedSuggestions.size > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Orçamento Total</p>
                <p className="text-2xl font-bold text-primary">
                  {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Dente</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion, index) => {
                  const config = priorityConfig[suggestion.priority];
                  const Icon = config.icon;
                  return (
                    <TableRow 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSuggestion(index)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(index)}
                          onChange={() => toggleSuggestion(index)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline">#{suggestion.tooth_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{suggestion.procedure}</p>
                          {suggestion.clinical_notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {suggestion.clinical_notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.color as any} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {suggestion.estimated_cost.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {suggestion.estimated_duration || 'A definir'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuggestions([]);
                setSelectedSuggestions(new Set());
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={handleCreateTreatments}
              disabled={selectedSuggestions.size === 0}
            >
              Criar {selectedSuggestions.size} Tratamento(s)
            </Button>
            <Button
              onClick={handleScheduleAppointments}
              disabled={selectedSuggestions.size === 0 || isScheduling}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar {selectedSuggestions.size} Consulta(s)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
