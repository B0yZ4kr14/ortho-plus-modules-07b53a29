import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiskScoreBadgeProps {
  riskLevel: string | null;
  overallScore: number | null;
  medicalScore?: number | null;
  surgicalScore?: number | null;
  anestheticScore?: number | null;
  showDetailed?: boolean;
}

export function RiskScoreBadge({
  riskLevel,
  overallScore,
  medicalScore,
  surgicalScore,
  anestheticScore,
  showDetailed = false
}: RiskScoreBadgeProps) {
  const getRiskConfig = (level: string | null) => {
    switch (level) {
      case 'critico':
        return {
          icon: AlertTriangle,
          label: 'Risco Crítico',
          className: 'bg-destructive/10 text-destructive border-destructive/30',
          color: 'text-destructive'
        };
      case 'alto':
        return {
          icon: ShieldAlert,
          label: 'Risco Alto',
          className: 'bg-warning/10 text-warning border-warning/30',
          color: 'text-warning'
        };
      case 'moderado':
        return {
          icon: Shield,
          label: 'Risco Moderado',
          className: 'bg-info/10 text-info border-info/30',
          color: 'text-info'
        };
      case 'baixo':
      default:
        return {
          icon: ShieldCheck,
          label: 'Risco Baixo',
          className: 'bg-success/10 text-success border-success/30',
          color: 'text-success'
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  const tooltipContent = (
    <div className="space-y-2">
      <div className="font-semibold border-b pb-2">
        Score de Risco: {overallScore || 0}/100
      </div>
      {showDetailed && (
        <>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Risco Médico:</span>
              <span className="font-semibold">{medicalScore || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Risco Cirúrgico:</span>
              <span className="font-semibold">{surgicalScore || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Risco Anestésico:</span>
              <span className="font-semibold">{anestheticScore || 0}/100</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Calculado automaticamente com base no histórico médico
          </div>
        </>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.className} gap-1.5 cursor-help`}>
            <Icon className="h-3 w-3" />
            {config.label}
            {overallScore !== null && (
              <span className="font-mono">{overallScore}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
