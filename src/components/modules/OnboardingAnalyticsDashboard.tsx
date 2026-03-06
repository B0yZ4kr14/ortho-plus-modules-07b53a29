import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalStarts: number;
  totalCompletions: number;
  totalAbandoned: number;
  completionRate: number;
  averageTimeSeconds: number;
  stepStats: Array<{
    step_name: string;
    step_number: number;
    completions: number;
    average_time: number;
  }>;
  dropOffByStep: Array<{
    step_name: string;
    abandoned: number;
  }>;
}

const COLORS = ["#2dd4bf", "#14b8a6", "#0d9488", "#fbbf24", "#f59e0b"];

export function OnboardingAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Buscar todos os eventos de onboarding da clínica
      const events = await apiClient.get<any[]>(
        "/onboarding_analytics?order=created_at.desc",
      );

      // Processar dados
      const starts =
        events?.filter((e) => e.event_type === "started").length || 0;
      const completions =
        events?.filter((e) => e.event_type === "completed").length || 0;
      const abandoned =
        events?.filter((e) => e.event_type === "abandoned").length || 0;

      // Calcular taxa de conclusão
      const completionRate = starts > 0 ? (completions / starts) * 100 : 0;

      // Calcular tempo médio
      const completedSessions =
        events?.filter((e) => e.event_type === "completed") || [];
      const totalTime = completedSessions.reduce(
        (sum, e) => sum + (e.time_spent_seconds || 0),
        0,
      );
      const averageTime =
        completedSessions.length > 0 ? totalTime / completedSessions.length : 0;

      // Estatísticas por passo
      const stepEvents =
        events?.filter((e) => e.event_type === "step_completed") || [];
      const stepStatsMap = new Map<
        string,
        { count: number; totalTime: number }
      >();

      stepEvents.forEach((event) => {
        const key = `${event.step_number}-${event.step_name}`;
        const existing = stepStatsMap.get(key) || { count: 0, totalTime: 0 };
        stepStatsMap.set(key, {
          count: existing.count + 1,
          totalTime: existing.totalTime + (event.time_spent_seconds || 0),
        });
      });

      const stepStats = Array.from(stepStatsMap.entries())
        .map(([key, value]) => {
          const [stepNumber, stepName] = key.split("-");
          return {
            step_name: stepName,
            step_number: parseInt(stepNumber),
            completions: value.count,
            average_time: value.totalTime / value.count,
          };
        })
        .sort((a, b) => a.step_number - b.step_number);

      // Drop-off por passo
      const abandonedEvents =
        events?.filter((e) => e.event_type === "abandoned") || [];
      const dropOffMap = new Map<string, number>();

      abandonedEvents.forEach((event) => {
        if (event.step_name) {
          dropOffMap.set(
            event.step_name,
            (dropOffMap.get(event.step_name) || 0) + 1,
          );
        }
      });

      const dropOffByStep = Array.from(dropOffMap.entries()).map(
        ([step_name, abandoned]) => ({
          step_name,
          abandoned,
        }),
      );

      setAnalytics({
        totalStarts: starts,
        totalCompletions: completions,
        totalAbandoned: abandoned,
        completionRate,
        averageTimeSeconds: averageTime,
        stepStats,
        dropOffByStep,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum dado de analytics disponível
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Onboardings Iniciados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalStarts}</div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Concluídos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {analytics.totalCompletions}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Taxa de Conclusão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {analytics.completionRate.toFixed(1)}%
              </span>
              {analytics.completionRate >= 70 ? (
                <Badge variant="success">Excelente</Badge>
              ) : analytics.completionRate >= 50 ? (
                <Badge variant="info">Bom</Badge>
              ) : (
                <Badge variant="error">Necessita Atenção</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatTime(analytics.averageTimeSeconds)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Completion Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Conclusão por Passo</CardTitle>
            <CardDescription>
              Quantos usuários concluíram cada etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.stepStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="step_name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completions" fill="#2dd4bf" name="Conclusões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Time per Step */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Tempo Médio por Passo</CardTitle>
            <CardDescription>
              Tempo gasto em cada etapa do onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.stepStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="step_name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip formatter={(value: number) => formatTime(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average_time"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  name="Tempo Médio"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Drop-off Analysis */}
        {analytics.dropOffByStep.length > 0 && (
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Análise de Abandono por Passo
              </CardTitle>
              <CardDescription>
                Identifique onde os usuários mais desistem do onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.dropOffByStep}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="abandoned" fill="#ef4444" name="Abandonos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
