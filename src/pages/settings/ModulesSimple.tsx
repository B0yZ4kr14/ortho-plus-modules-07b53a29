import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Loader2, 
  Check, 
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  ClipboardList,
  Stethoscope,
  Package,
  CreditCard,
  TrendingUp,
  Shield,
  Video,
  PenTool,
  Bot,
  FileBarChart,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mapeamento de ícones por module_key
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
  'ASSINATURA_ICP': PenTool,
  'TISS': FileText,
  'TELEODONTO': Video,
  'FLUXO_DIGITAL': Activity,
  'IA': Bot,
  'RELATORIOS': FileBarChart,
  'ORCAMENTOS': DollarSign,
};

interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
}

export default function ModulesSimple() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-my-modules');
      if (error) throw error;
      setModules(data?.modules || []);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
      toast.error('Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggle = async (moduleKey: string) => {
    setToggling(moduleKey);
    
    try {
      const { error } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;
      
      toast.success('Módulo atualizado com sucesso!');
      await fetchModules();
    } catch (error: any) {
      console.error('Erro ao alterar módulo:', error);
      toast.error(error.message || 'Erro ao alterar módulo');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando módulos...</span>
        </div>
      </div>
    );
  }

  // Agrupar módulos por categoria
  const groupedModules = modules.reduce((acc, module) => {
    const category = module.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  const categoryOrder = ['Gestão e Operação', 'Financeiro', 'Crescimento e Marketing', 'Compliance', 'Inovação', 'Outros'];
  const sortedCategories = Object.keys(groupedModules).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        icon={Settings}
        title="Gestão de Módulos"
        description="Ative ou desative módulos do sistema"
      />

      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{category}</h2>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            <div className="grid gap-3">
              {groupedModules[category].map((module) => {
                const isToggling = toggling === module.module_key;
                const canToggle = module.is_active ? module.can_deactivate : module.can_activate;

                return (
                  <Card
                    key={module.module_key}
                    className={cn(
                      "p-4 transition-all hover:shadow-md",
                      module.is_active && "border-primary/50 bg-primary/5",
                      isToggling && "opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                        module.is_active 
                          ? "bg-gradient-to-br from-success/20 to-success/10 shadow-lg shadow-success/20" 
                          : "bg-muted/50"
                      )}>
                        {(() => {
                          const Icon = moduleIcons[module.module_key] || Settings;
                          return (
                            <Icon className={cn(
                              "h-6 w-6 transition-all duration-300",
                              module.is_active ? "text-success animate-pulse" : "text-muted-foreground"
                            )} />
                          );
                        })()}
                      </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{module.name}</h3>
                            <Badge variant={module.is_active ? 'success' : 'secondary'} className="text-xs">
                              {module.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>

                      <Switch
                        checked={module.is_active}
                        disabled={!canToggle || isToggling}
                        onCheckedChange={() => handleToggle(module.module_key)}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
