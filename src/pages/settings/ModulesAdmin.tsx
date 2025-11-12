import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Info, AlertCircle, CheckCircle2, XCircle, Link2, Lock, Unlock, Loader2, Network } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ModuleDependencyGraph } from '@/components/modules/ModuleDependencyGraph';

interface ModuleData {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  blocking_dependencies: string[];
}

export default function ModulesAdmin() {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-my-modules');
      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggle = async (moduleKey: string, currentState: boolean) => {
    setToggling(moduleKey);
    try {
      const { data, error } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;

      const newState = !currentState;
      toast.success(
        newState ? 'Módulo ativado com sucesso!' : 'Módulo desativado com sucesso!',
        {
          description: `O módulo ${moduleKey} foi ${newState ? 'ativado' : 'desativado'}.`,
        }
      );
      await fetchModules();
    } catch (error: any) {
      console.error('Toggle error:', error);
      
      // Parse error message to show dependency info
      const errorMsg = error.message || 'Erro ao alterar estado do módulo';
      toast.error('Não foi possível alterar o módulo', {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setToggling(null);
    }
  };

  const handleRequest = async (moduleKey: string, moduleName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('request-new-module', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;
      toast.success('Solicitação enviada!', {
        description: `Sua solicitação para o módulo ${moduleName} foi enviada ao time comercial.`,
      });
    } catch (error: any) {
      console.error('Request error:', error);
      toast.error('Erro ao solicitar módulo', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    }
  };

  const getModuleStatusIcon = (module: ModuleData) => {
    if (!module.is_subscribed) return null;
    
    if (module.is_active) {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    return <XCircle className="h-5 w-5 text-muted-foreground" />;
  };

  const getModuleStatusColor = (module: ModuleData) => {
    if (!module.is_subscribed) return 'border-muted';
    if (module.is_active) return 'border-success/50 bg-success/5';
    return 'border-muted';
  };

  const canToggle = (module: ModuleData) => {
    if (!module.is_subscribed) return false;
    if (module.is_active) return module.can_deactivate;
    return module.can_activate;
  };

  const getToggleTooltip = (module: ModuleData) => {
    if (!module.is_subscribed) return null;

    const hasUnmetDeps = module.unmet_dependencies.length > 0;
    const hasBlockingDeps = module.blocking_dependencies.length > 0;

    if (!module.is_active && hasUnmetDeps) {
      return {
        icon: Lock,
        title: 'Não pode ser ativado',
        description: `Requer os módulos: ${module.unmet_dependencies.join(', ')}`,
        variant: 'destructive' as const,
      };
    }

    if (module.is_active && hasBlockingDeps) {
      return {
        icon: Lock,
        title: 'Não pode ser desativado',
        description: `É necessário para: ${module.blocking_dependencies.join(', ')}`,
        variant: 'destructive' as const,
      };
    }

    return {
      icon: Unlock,
      title: module.is_active ? 'Pode ser desativado' : 'Pode ser ativado',
      description: 'Clique no switch para alterar o estado',
      variant: 'default' as const,
    };
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleData[]>);

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

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Settings}
          title="Administração de Módulos"
          description="Gerencie quais módulos estão ativos na sua clínica"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2">
              <Network className="h-5 w-5" />
              Visualizar Grafo de Dependências
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] h-[90vh] p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Grafo de Dependências dos Módulos
              </DialogTitle>
              <DialogDescription>
                Visualização interativa das dependências entre os módulos. Use os controles para zoom e navegação.
              </DialogDescription>
            </DialogHeader>
            <div className="h-[calc(90vh-120px)]">
              <ModuleDependencyGraph modules={modules} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Gestão de Módulos</AlertTitle>
        <AlertDescription>
          Alguns módulos dependem de outros para funcionar. O sistema indica automaticamente 
          quando há dependências que impedem ativação ou desativação.
        </AlertDescription>
      </Alert>

      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            <Badge variant="outline" className="text-xs">
              {categoryModules.filter(m => m.is_active).length} / {categoryModules.length} ativos
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryModules.map((module) => {
              const tooltipInfo = getToggleTooltip(module);
              const isTogglingThis = toggling === module.module_key;
              const toggleEnabled = canToggle(module) && !isTogglingThis;

              return (
                <Card 
                  key={module.module_key} 
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    getModuleStatusColor(module),
                    isTogglingThis && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        {getModuleStatusIcon(module)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base leading-tight">
                            {module.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      {module.is_subscribed ? (
                        <>
                          <Badge 
                            variant={module.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {module.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {module.unmet_dependencies.length > 0 && !module.is_active && (
                            <Badge variant="outline" className="text-xs text-destructive border-destructive/50">
                              <Lock className="h-3 w-3 mr-1" />
                              Bloqueado
                            </Badge>
                          )}
                          {module.blocking_dependencies.length > 0 && module.is_active && (
                            <Badge variant="outline" className="text-xs text-primary border-primary/50">
                              <Link2 className="h-3 w-3 mr-1" />
                              Em uso
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Não contratado
                        </Badge>
                      )}
                    </div>

                    {/* Dependencies Info */}
                    {module.is_subscribed && (module.unmet_dependencies.length > 0 || module.blocking_dependencies.length > 0) && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-md text-xs">
                        {module.unmet_dependencies.length > 0 && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 mt-0.5 text-destructive flex-shrink-0" />
                            <div>
                              <p className="font-medium text-destructive">Dependências não atendidas:</p>
                              <p className="text-muted-foreground mt-0.5">
                                {module.unmet_dependencies.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                        {module.blocking_dependencies.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Link2 className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium text-primary">Requerido por:</p>
                              <p className="text-muted-foreground mt-0.5">
                                {module.blocking_dependencies.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Controls */}
                    {module.is_subscribed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                              <div className="flex items-center gap-2">
                                {tooltipInfo && <tooltipInfo.icon className="h-4 w-4 text-muted-foreground" />}
                                <span className="text-sm font-medium text-foreground">
                                  {module.is_active ? 'Desativar módulo' : 'Ativar módulo'}
                                </span>
                              </div>
                              <Switch
                                checked={module.is_active}
                                disabled={!toggleEnabled}
                                onCheckedChange={() => handleToggle(module.module_key, module.is_active)}
                              />
                            </div>
                          </TooltipTrigger>
                          {tooltipInfo && (
                            <TooltipContent side="bottom" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">{tooltipInfo.title}</p>
                                <p className="text-xs text-muted-foreground">{tooltipInfo.description}</p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleRequest(module.module_key, module.name)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Solicitar Contratação
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}