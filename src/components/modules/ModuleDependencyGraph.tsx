import { AlertCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Module {
  id: number;
  module_key: string;
  name: string;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies?: string[];
  blocking_dependents?: string[];
}

interface ModuleDependencyGraphProps {
  modules: Module;
  allModules: Module[];
}

export function ModuleDependencyGraph({ modules: module, allModules }: ModuleDependencyGraphProps) {
  const hasUnmetDependencies = module.unmet_dependencies && module.unmet_dependencies.length > 0;
  const hasBlockingDependents = module.blocking_dependents && module.blocking_dependents.length > 0;

  if (!hasUnmetDependencies && !hasBlockingDependents) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Dependências não atendidas */}
      {hasUnmetDependencies && (
        <Alert className="border-warning/50 bg-warning/5">
          <Lock className="h-4 w-4 text-warning" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium text-warning">
                Este módulo requer os seguintes módulos ativos:
              </p>
              <div className="flex flex-wrap gap-2">
                {module.unmet_dependencies?.map((depKey) => {
                  const depModule = allModules.find(m => m.module_key === depKey);
                  return (
                    <Badge
                      key={depKey}
                      variant="outline"
                      className="border-warning/50 text-warning bg-warning/10"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      {depModule?.name || depKey}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Módulos dependentes (bloqueadores) */}
      {hasBlockingDependents && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                Desative primeiro estes módulos dependentes:
              </p>
              <div className="flex flex-wrap gap-2">
                {module.blocking_dependents?.map((depKey) => {
                  const depModule = allModules.find(m => m.module_key === depKey);
                  return (
                    <Badge
                      key={depKey}
                      variant="outline"
                      className="border-destructive/50 text-destructive bg-destructive/10"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {depModule?.name || depKey}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}