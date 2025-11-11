export interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  color: string;
  enabled: boolean;
  category?: 'action' | 'navigation';
}

export interface ModuleCategory {
  id: string;
  name: string;
  modules: Module[];
}
