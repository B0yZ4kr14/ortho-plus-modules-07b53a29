// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnaliseComplete {
  id: string;
  patient_id: string;
  tipo_radiografia: string;
  status_analise: string;
  problemas_detectados: number;
  confidence_score: number;
  created_at: string;
  imagem_url: string;
  resultado_ia?: any;
}

interface TimelineData {
  data: string;
  problemas: number;
  confianca: number;
  tipo: string;
  status: string;
}

export const PatientRadiographyTimeline = () => {
  const { selectedClinic } = useAuth();
  const [analises, setAnalises] = useState<AnaliseComplete[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedClinic?.id) return;

      try {
        setLoading(true);

        // Carregar pacientes
        const { data: patientsData } = await supabase
          .from('patients')
          .select('id, nome')
          .eq('clinic_id', selectedClinic.id)
          .order('nome');

        setPatients(patientsData || []);

        // Carregar todas as análises
        const { data: analisesData } = await supabase
          .from('analises_radiograficas')
          .select('*')
          .eq('clinic_id', selectedClinic.id)
          .order('created_at', { ascending: true });

        setAnalises(analisesData || []);

        // Selecionar primeiro paciente com análises
        if (patientsData && patientsData.length > 0 && analisesData && analisesData.length > 0) {
          const firstPatientWithAnalysis = patientsData.find(p => 
            analisesData.some(a => a.patient_id === p.id)
          );
          if (firstPatientWithAnalysis) {
            setSelectedPatientId(firstPatientWithAnalysis.id);
          }
        }
      } catch (error) {
        console.error('Error loading timeline data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClinic]);

  const patientAnalises = useMemo(() => {
    if (!selectedPatientId) return [];
    return analises.filter(a => a.patient_id === selectedPatientId);
  }, [analises, selectedPatientId]);

  const timelineData: TimelineData[] = useMemo(() => {
    return patientAnalises.map(analise => ({
      data: new Date(analise.created_at).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
      }),
      problemas: analise.problemas_detectados || 0,
      confianca: Math.round((analise.confidence_score || 0) * 100),
      tipo: analise.tipo_radiografia,
      status: analise.status_analise,
    }));
  }, [patientAnalises]);

  const tendenciaProblemas = useMemo(() => {
    if (timelineData.length < 2) return 'estavel';
    const primeiro = timelineData[0].problemas;
    const ultimo = timelineData[timelineData.length - 1].problemas;
    if (ultimo > primeiro) return 'aumentando';
    if (ultimo < primeiro) return 'diminuindo';
    return 'estavel';
  }, [timelineData]);

  const getTendenciaIcon = () => {
    if (tendenciaProblemas === 'aumentando') return <TrendingUp className="h-5 w-5 text-destructive" />;
    if (tendenciaProblemas === 'diminuindo') return <TrendingDown className="h-5 w-5 text-success" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTendenciaText = () => {
    if (tendenciaProblemas === 'aumentando') return 'Problemas aumentando';
    if (tendenciaProblemas === 'diminuindo') return 'Melhoria detectada';
    return 'Estável';
  };

  const getTendenciaVariant = () => {
    if (tendenciaProblemas === 'aumentando') return 'destructive';
    if (tendenciaProblemas === 'diminuindo') return 'success';
    return 'outline';
  };

  if (loading) {
    return (
      <Card className="p-6" depth="normal">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum paciente cadastrado. Cadastre pacientes para visualizar o histórico de radiografias.
        </AlertDescription>
      </Alert>
    );
  }

  if (!selectedPatientId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecione um paciente para visualizar o histórico de radiografias.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6" depth="normal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline de Evolução do Paciente
            </h3>
            <p className="text-sm text-muted-foreground">
              Histórico completo de radiografias e tendências de tratamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getTendenciaVariant()} className="flex items-center gap-2">
              {getTendenciaIcon()}
              {getTendenciaText()}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Selecione o Paciente</label>
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(patient => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {patientAnalises.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma radiografia encontrada para este paciente.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Gráfico de Tendência */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Gráfico de Tendência</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="data" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="problemas" 
                    name="Problemas Detectados"
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confianca" 
                    name="Confiança da IA (%)"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de Análises */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Histórico Detalhado</h4>
              <div className="space-y-4">
                {patientAnalises.map((analise, index) => (
                  <div 
                    key={analise.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-xs text-muted-foreground">#{index + 1}</div>
                      <div className="text-sm font-semibold">
                        {new Date(analise.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={analise.imagem_url} 
                        alt="Radiografia"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {analise.tipo_radiografia}
                        </Badge>
                        <Badge 
                          variant={analise.status_analise === 'REVISADO' ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {analise.status_analise}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong className="text-foreground">{analise.problemas_detectados}</strong> problema(s)
                        </span>
                        <span>
                          Confiança: <strong className="text-foreground">{Math.round((analise.confidence_score || 0) * 100)}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{patientAnalises.length}</div>
                <div className="text-xs text-muted-foreground">Total de Análises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {patientAnalises.reduce((sum, a) => sum + (a.problemas_detectados || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Problemas Detectados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {Math.round(
                    patientAnalises.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / 
                    patientAnalises.length * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Confiança Média</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
