import {
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  Stethoscope,
  FileText,
  DollarSign,
  Settings,
  TrendingUp,
  ClipboardList,
  Shield,
  Activity,
  Package,
  CreditCard,
  BarChart3,
  FileBarChart,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Module {
  id: number;
  module_key: string;
  name: string;
  category: string;
  is_active: boolean;
}

interface SidebarPreviewProps {
  modules: Module[];
}

const moduleIcons: Record<string, any> = {
  'DASHBOARD': LayoutDashboard,
  'PACIENTES': Users,
  'DENTISTAS': UserPlus,
  'FUNCIONARIOS': Briefcase,
  'AGENDA': Calendar,
  'PROCEDIMENTOS': ClipboardList,
  'PEP': FileText,
  'ODONTOGRAMA': Stethoscope,
  'ESTOQUE': Package,
  'FINANCEIRO': DollarSign,
  'SPLIT_PAGAMENTO': CreditCard,
  'INADIMPLENCIA': TrendingUp,
  'COBRANCA': CreditCard,
  'CRM': Activity,
  'MARKETING_AUTO': TrendingUp,
  'BI': FileBarChart,
  'LGPD': Shield,
  'ASSINATURA_ICP': FileText,
  'TISS': FileText,
  'TELEODONTO': Activity,
  'FLUXO_DIGITAL': Activity,
  'IA': Activity,
  'RELATORIOS': FileBarChart,
  'ORCAMENTOS': DollarSign,
};

const categoryLabels: Record<string, string> = {
  'Atendimento Clínico': 'Clínico',
  'Gestão Financeira': 'Financeiro',
  'Relacionamento & Vendas': 'Vendas',
  'Conformidade & Legal': 'Legal',
  'Tecnologias Avançadas': 'Tech',
};

export function SidebarPreview({ modules }: SidebarPreviewProps) {
  const activeModules = modules.filter(m => m.is_active);

  // Agrupar por categoria
  const groupedModules = activeModules.reduce((acc, module) => {
    const category = module.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <Card className="p-4 bg-sidebar border-border shadow-2xl">
      <div className="space-y-1">
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-border">
          <div className="flex items-center justify-center">
            <div className="text-xs font-bold text-sidebar-foreground">
              ORTHO+
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {Object.entries(groupedModules).map(([category, categoryModules], index) => (
            <div key={category} className={index > 0 ? 'pt-4 mt-4 border-t border-border/20' : ''}>
              
              <div className="space-y-1">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </span>
                </div>

                {categoryModules.map((module) => {
                  const Icon = moduleIcons[module.module_key] || Settings;
                  return (
                    <div
                      key={module.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-sidebar-accent-foreground hover:bg-sidebar-accent hover:shadow-sm transition-all duration-200"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-medium truncate flex-1">
                        {module.name.replace('Módulo de ', '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-border/20">
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-sidebar-accent-foreground">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium truncate">Configurações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {activeModules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-xs">Nenhum módulo ativo</p>
            <p className="text-[10px] mt-1">Ative módulos para visualizar</p>
          </div>
        )}

        {activeModules.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border text-center">
            <Badge variant="secondary" className="text-[10px]">
              {activeModules.length} módulo{activeModules.length !== 1 ? 's' : ''} ativo{activeModules.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}