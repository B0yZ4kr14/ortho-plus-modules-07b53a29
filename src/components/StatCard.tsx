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
    <Card variant="metric" depth="normal" className={cn("p-6", borderColor)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-foreground mb-1.5 truncate">
            {value}
          </h3>
          {trend && (
            <p className={cn(
              "text-xs font-medium flex items-center gap-1",
              trendPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
            )}>
              <span>{trendPositive ? '↑' : '↓'}</span>
              {trend}
            </p>
          )}
          {alert && (
            <p className="text-xs text-orange-600 dark:text-orange-500 font-medium flex items-center gap-1 mt-2">
              <span>⚠️</span> {alert}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
          iconColor
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
