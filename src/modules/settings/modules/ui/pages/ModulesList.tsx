import { ModuleCard } from './ModuleCard';
import { groupModulesByCategory } from '@/core/config/modules.config';

interface ModulesListProps {
  modules: any[];
  toggling: string | null;
  onToggle: (moduleKey: string) => Promise<void>;
}

export function ModulesList({ modules, toggling, onToggle }: ModulesListProps) {
  const categorizedModules = groupModulesByCategory(modules);

  return (
    <div className="space-y-8">
      {categorizedModules.map((category) => (
        <div key={category.name} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <span className="text-sm text-muted-foreground">
              ({category.modules.filter(m => m.is_active).length}/{category.modules.length} ativos)
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {category.modules.map((module) => (
              <ModuleCard
                key={module.module_key}
                module={module}
                toggling={toggling === module.module_key}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
