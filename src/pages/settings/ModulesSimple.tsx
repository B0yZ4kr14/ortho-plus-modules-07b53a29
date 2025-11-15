import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Settings, 
  Loader2, 
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
  Briefcase,
  AlertCircle,
  Eye,
  Sparkles,
  MapIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ModuleDependencyGraph } from '@/components/modules/ModuleDependencyGraph';
import { SidebarPreview } from '@/components/modules/SidebarPreview';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ModuleAdoptionRoadmap } from '@/components/modules/ModuleAdoptionRoadmap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  unmet_dependencies?: string[];
  blocking_dependents?: string[];
}

export default function ModulesSimple() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

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
      const { data, error } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;
      
      // Mostrar mensagem customizada sobre ativação em cascata
      if (data?.cascade_activated > 0) {
        toast.success(data.message);
      } else {
        toast.success('Módulo atualizado com sucesso!');
      }
      
      await fetchModules();
    } catch (error: any) {
      console.error('Erro ao alterar módulo:', error);
      toast.error(error.message || 'Erro ao alterar módulo');
    } finally {
      setToggling(null);
    }
  };

  const handleLoadRoadmap = async () => {
    setLoadingRoadmap(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('recommend-module-sequence');
      
      if (error) throw error;
      
      setRoadmapData(data);
      setShowRoadmap(true);
      toast.success('Roadmap de adoção gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar roadmap:', error);
      toast.error(error.message || 'Erro ao gerar roadmap de adoção');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleActivatePhase = async (moduleNames: string[]) => {
    // Mapear nomes de módulos para module_keys
    const modulesToActivate = modules.filter(m => 
      moduleNames.some(name => m.name.includes(name) || name.includes(m.name))
    );

    for (const module of modulesToActivate) {
      if (!module.is_active) {
        await handleToggle(module.module_key);
      }
    }
    
    toast.success(`${modulesToActivate.length} módulo(s) ativado(s) com sucesso!`);
    setShowRoadmap(false);
  };

  const handleWizardActivate = async (moduleKeys: string[]) => {
    for (const key of moduleKeys) {
      const module = modules.find(m => m.module_key === key);
      if (module && !module.is_active) {
        await handleToggle(key);
      }
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

  const categoryOrder = ['Atendimento Clínico', 'Gestão Financeira', 'Relacionamento & Vendas', 'Conformidade & Legal', 'Tecnologias Avançadas', 'Outros'];
  const sortedCategories = Object.keys(groupedModules).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Settings}
          title="Gestão de Módulos"
          description="Ative ou desative módulos do sistema"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLoadRoadmap}
            disabled={loadingRoadmap}
            className="gap-2"
          >
            {loadingRoadmap ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapIcon className="h-4 w-4" />
            )}
            Roadmap de Adoção
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowWizard(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Assistente de Configuração
          </Button>
          
          <Button
            variant={showPreview ? "default" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Ocultar' : 'Visualizar'} Menu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules List */}
        <div className={cn("space-y-8", showPreview ? "lg:col-span-2" : "lg:col-span-3")}>
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
                  const hasWarnings = module.unmet_dependencies?.length || module.blocking_dependents?.length;
                  const isExpanded = expandedModule === module.module_key;

                  return (
                    <Card
                      key={module.module_key}
                      className={cn(
                        "p-4 transition-all hover:shadow-md",
                        module.is_active && "border-primary/50 bg-primary/5",
                        isToggling && "opacity-60",
                        hasWarnings && !canToggle && "border-warning/30"
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 shadow-md",
                              module.is_active 
                                ? "bg-gradient-to-br from-success/30 to-success/15 shadow-success/30 border-2 border-success/40" 
                                : "bg-gradient-to-br from-muted to-muted/50 border-2 border-border"
                            )}>
                              {(() => {
                                const Icon = moduleIcons[module.module_key] || Settings;
                                return (
                                  <Icon className={cn(
                                    "h-6 w-6 transition-all duration-300",
                                    module.is_active ? "text-success drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" : "text-muted-foreground"
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
                                {hasWarnings && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => setExpandedModule(isExpanded ? null : module.module_key)}
                                        >
                                          <AlertCircle className="h-4 w-4 text-warning" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Ver dependências</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Switch
                                    checked={module.is_active}
                                    disabled={!canToggle || isToggling}
                                    onCheckedChange={() => handleToggle(module.module_key)}
                                  />
                                </div>
                              </TooltipTrigger>
                              {!canToggle && (
                                <TooltipContent>
                                  <p className="text-xs">
                                    {module.unmet_dependencies?.length 
                                      ? 'Ative as dependências primeiro' 
                                      : 'Desative os módulos dependentes primeiro'}
                                  </p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Dependency Graph */}
                        {isExpanded && (
                          <ModuleDependencyGraph modules={module} allModules={modules} />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Preview */}
        {showPreview && (
          <div className="lg:col-span-1 sticky top-8 h-fit">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Preview do Menu
              </h3>
              <SidebarPreview modules={modules} />
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Wizard */}
      {showWizard && (
        <OnboardingWizard 
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={() => setShowWizard(false)} 
        />
      )}

      {/* Adoption Roadmap Dialog */}
      <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Roadmap Inteligente de Adoção de Módulos
            </DialogTitle>
            <DialogDescription>
              Sequência recomendada baseada em análise IA do perfil e padrões de clínicas bem-sucedidas
            </DialogDescription>
          </DialogHeader>
          
          {roadmapData && (
            <ModuleAdoptionRoadmap 
              recommendation={roadmapData.recommendation}
              clinicProfile={roadmapData.clinic_profile}
              onActivatePhase={handleActivatePhase}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
