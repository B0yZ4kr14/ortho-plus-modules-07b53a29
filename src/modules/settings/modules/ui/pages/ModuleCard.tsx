import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { MODULES_CONFIG } from '@/core/config/modules.config';

interface ModuleCardProps {
  module: {
    id: number;
    module_key: string;
    name: string;
    description: string;
    category: string;
    is_active: boolean;
    can_activate: boolean;
    can_deactivate: boolean;
    unmet_dependencies?: string[];
    blocking_dependents?: string[];
  };
  toggling: boolean;
  onToggle: (moduleKey: string) => Promise<void>;
}

export function ModuleCard({ module, toggling, onToggle }: ModuleCardProps) {
  const iconName = MODULES_CONFIG[module.module_key]?.icon || 'Package';
  const IconComponent = (Icons as any)[iconName] || Icons.Package;
  
  const isDisabled = module.is_active
    ? !module.can_deactivate
    : !module.can_activate;

  const getTooltipMessage = () => {
    if (module.is_active && !module.can_deactivate) {
      return `Requerido por: ${module.blocking_dependents?.join(', ')}`;
    }
    if (!module.is_active && !module.can_activate) {
      return `Requer: ${module.unmet_dependencies?.join(', ')}`;
    }
    return null;
  };

  const tooltipMessage = getTooltipMessage();

  return (
    <Card className={cn(
      'p-6 transition-all hover:shadow-md',
      module.is_active && 'border-primary/50 bg-primary/5'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={cn(
            'p-3 rounded-lg transition-colors',
            module.is_active
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}>
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{module.name}</h3>
              {module.is_active && (
                <Badge variant="default" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{module.description}</p>
            
            {(module.unmet_dependencies && module.unmet_dependencies.length > 0) && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-xs text-warning">
                  Requer: {module.unmet_dependencies.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {isDisabled && <Lock className="h-4 w-4 text-muted-foreground" />}
                <Switch
                  checked={module.is_active}
                  onCheckedChange={() => onToggle(module.module_key)}
                  disabled={toggling || isDisabled}
                />
              </div>
            </TooltipTrigger>
            {tooltipMessage && (
              <TooltipContent>
                <p className="text-xs">{tooltipMessage}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
