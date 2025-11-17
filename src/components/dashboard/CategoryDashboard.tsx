import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

interface KPI {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

interface CategoryDashboardProps {
  title: string;
  description?: string;
  kpis: KPI[];
  children?: React.ReactNode;
}

export function CategoryDashboard({ title, description, kpis, children }: CategoryDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <StatsCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Custom Content */}
      {children}
    </div>
  );
}
