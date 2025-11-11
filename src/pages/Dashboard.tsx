import { Users, Calendar, DollarSign, Camera, CreditCard, BarChart3 } from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";
import { StatCard } from "@/components/StatCard";

export default function Dashboard() {
  const quickActionModules = [
    {
      title: "Novo Paciente",
      subtitle: "F2 - Cadastrar",
      icon: Users,
      color: "bg-module-blue",
    },
    {
      title: "Agendar Consulta",
      subtitle: "F1 - Agenda",
      icon: Calendar,
      color: "bg-module-purple",
    },
    {
      title: "Novo Orçamento",
      subtitle: "Criar orçamento",
      icon: DollarSign,
      color: "bg-module-yellow",
    },
    {
      title: "Tratamento",
      subtitle: "Iniciar tratamento",
      icon: BarChart3,
      color: "bg-module-orange",
    },
    {
      title: "Registrar Pagamento",
      subtitle: "Financeiro",
      icon: CreditCard,
      color: "bg-module-pink",
    },
    {
      title: "Radiologia",
      subtitle: "Agendar exame",
      icon: Camera,
      color: "bg-module-cyan",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Início / Dashboard</p>
      </div>

      {/* Quick Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActionModules.map((module) => (
          <ModuleCard
            key={module.title}
            title={module.title}
            subtitle={module.subtitle}
            icon={module.icon}
            color={module.color}
          />
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total de Pacientes"
          value="1,247"
          trend="↑ +12% este mês"
          trendPositive={true}
          icon={Users}
          iconColor="bg-module-blue"
          borderColor="border-l-module-blue"
        />
        <StatCard
          label="Agendamentos Hoje"
          value="28"
          trend="8 confirmados"
          trendPositive={true}
          icon={Calendar}
          iconColor="bg-module-purple"
          borderColor="border-l-module-purple"
        />
        <StatCard
          label="Receita do Mês"
          value="R$ 145,680"
          trend="↑ +8% vs mês anterior"
          trendPositive={true}
          icon={DollarSign}
          iconColor="bg-module-green"
          borderColor="border-l-module-green"
        />
        <StatCard
          label="Tratamentos Pendentes"
          value="42"
          alert="Requer atenção"
          icon={BarChart3}
          iconColor="bg-module-orange"
          borderColor="border-l-module-orange"
        />
      </div>

      {/* Upcoming Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              Próximos Agendamentos
            </h2>
            <a href="#" className="text-sm text-primary hover:underline">Ver todos</a>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-10 h-10 rounded-full bg-module-blue/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-module-blue" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Paciente {i}</p>
                  <p className="text-sm text-muted-foreground">Dr. Silva - 14:00</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-module-purple" />
              Estatísticas da Semana
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Consultas realizadas</span>
              <span className="font-semibold text-foreground">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Taxa de comparecimento</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Novos pacientes</span>
              <span className="font-semibold text-foreground">23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
