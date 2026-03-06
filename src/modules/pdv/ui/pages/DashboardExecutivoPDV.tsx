import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  Trophy,
  TrendingUp,
  Users,
  CreditCard,
  Target,
  Award,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export default function DashboardExecutivoPDV() {
  const { clinicId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalVendas: 0,
    ticketMedio: 0,
    metasAtingidas: 0,
    transacoesTEF: 0,
    vendedores: 0,
  });
  const [vendasPorVendedor, setVendasPorVendedor] = useState([]);
  const [metasPorPeriodo, setMetasPorPeriodo] = useState([]);
  const [transacoesPorMetodo, setTransacoesPorMetodo] = useState([]);
  const [rankingTop5, setRankingTop5] = useState([]);

  useEffect(() => {
    if (clinicId) {
      loadDashboardData();
    }
  }, [clinicId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Call the unified backend endpoint for the executive dashboard data
      // Carregar todas as informações do endpoint consolidado
      const data = await apiClient.get<any>("/pdv/dashboard-executivo", {
        params: { clinicId },
      });

      setKpis(
        data.kpis || {
          totalVendas: data.kpis?.totalVendas || 0,
          ticketMedio: data.kpis?.ticketMedio || 0,
          metasAtingidas: data.kpis?.metasAtingidas || 0,
          transacoesTEF: data.kpis?.transacoesTEF || 0,
          vendedores: data.vendasPorVendedor?.length || 0,
        },
      );

      setVendasPorVendedor(data.vendasPorVendedor || []);
      setMetasPorPeriodo(data.metasPorPeriodo || []);
      setTransacoesPorMetodo(data.transacoesPorMetodo || []);
      setRankingTop5(data.rankingTop5 || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard executivo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingState size="lg" message="Carregando dashboard executivo..." />
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <PageHeader
        title="Dashboard Executivo PDV"
        description="Visão consolidada de vendas, metas, rankings e transações TEF"
        icon={<TrendingUp className="h-6 w-6" />}
      />

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4" depth="subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Vendas</p>
              <p className="text-2xl font-bold">
                {kpis.totalVendas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4" depth="subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {kpis.ticketMedio.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-4" depth="subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Metas Atingidas</p>
              <p className="text-2xl font-bold">{kpis.metasAtingidas}</p>
            </div>
            <Target className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-4" depth="subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transações TEF</p>
              <p className="text-2xl font-bold">{kpis.transacoesTEF}</p>
            </div>
            <CreditCard className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-4" depth="subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
              <p className="text-2xl font-bold">{kpis.vendedores}</p>
            </div>
            <Users className="h-8 w-8 text-warning" />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Vendedor */}
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Vendas por Vendedor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendasPorVendedor}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="vendas"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Metas vs Atingido */}
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Evolução Metas (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metasPorPeriodo}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Meta"
              />
              <Line
                type="monotone"
                dataKey="atingido"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Atingido"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações por Método */}
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            Transações TEF por Método
          </h3>
          {transacoesPorMetodo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transacoesPorMetodo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ${((entry.value / transacoesPorMetodo.reduce((sum, m) => sum + m.value, 0)) * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transacoesPorMetodo.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhuma transação TEF registrada
            </div>
          )}
        </Card>

        {/* Ranking Top 5 */}
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Top 5 Vendedores do Mês
          </h3>
          <div className="space-y-3">
            {rankingTop5.length > 0 ? (
              rankingTop5.map((vendedor, index) => (
                <div
                  key={vendedor.vendedor_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-warning" />
                      )}
                      {index === 1 && (
                        <Award className="h-5 w-5 text-muted-foreground" />
                      )}
                      {index === 2 && (
                        <Award className="h-5 w-5 text-amber-600" />
                      )}
                      {index > 2 && (
                        <span className="font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {vendedor.profiles?.full_name || "Vendedor"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(vendedor.total_vendas || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Nenhum vendedor ranqueado este mês
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
