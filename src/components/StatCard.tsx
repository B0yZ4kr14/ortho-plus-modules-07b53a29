import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon: LucideIcon;
  iconColor: string;
  borderColor: string;
  alert?: string;
}

export function StatCard({ 
  label, 
  value, 
  trend, 
  trendPositive, 
  icon: Icon, 
  iconColor,
  borderColor,
  alert
}: StatCardProps) {
  return (
    <Card variant="elevated" className={cn("p-6 border-l-4", borderColor)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          {trend && (
            <p className={cn("text-sm font-medium", trendPositive ? "text-green-600" : "text-red-600")}>
              {trend}
            </p>
          )}
          {alert && (
            <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-2">
              <span>⚠️</span> {alert}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", iconColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
