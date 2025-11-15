// Central module types and utilities

export interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  active_dependents: string[];
}

export interface ModuleCategory {
  name: string;
  label: string;
  modules: Module[];
}

export const MODULE_CATEGORIES = {
  'Atendimento Clínico': 'Clínico',
  'Gestão Financeira': 'Financeiro',
  'Relacionamento & Vendas': 'Vendas',
  'Conformidade & Legal': 'Legal',
  'Tecnologias Avançadas': 'Tech',
} as const;

export function groupModulesByCategory(modules: Module[]): ModuleCategory[] {
  const categoryMap = new Map<string, Module[]>();

  modules.forEach((module) => {
    const category = module.category || 'Outros';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(module);
  });

  return Array.from(categoryMap.entries()).map(([name, modules]) => ({
    name,
    label: MODULE_CATEGORIES[name as keyof typeof MODULE_CATEGORIES] || name,
    modules,
  }));
}

export function getModuleStats(modules: Module[]) {
  return {
    total: modules.length,
    subscribed: modules.filter((m) => m.subscribed).length,
    active: modules.filter((m) => m.is_active).length,
    available: modules.filter((m) => !m.subscribed).length,
  };
}
