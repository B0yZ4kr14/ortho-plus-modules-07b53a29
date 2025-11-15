import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardMemoProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}

// ✅ FASE 3: Componente otimizado com React.memo
export const StatCardMemo = memo(function StatCardMemo({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  variant = 'blue'
}: StatCardMemoProps) {
  const variantStyles = {
    blue: 'border-blue-500/30 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent',
    purple: 'border-purple-500/30 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent',
    green: 'border-green-500/30 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent',
    orange: 'border-orange-500/30 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-transparent',
    red: 'border-red-500/30 hover:border-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent',
  };

  const iconBgStyles = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-lg border-2',
      variantStyles[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <span className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                {subtitle && (
                  <span className="text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
          </div>

          <div className={cn(
            'rounded-2xl p-4',
            iconBgStyles[variant]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
