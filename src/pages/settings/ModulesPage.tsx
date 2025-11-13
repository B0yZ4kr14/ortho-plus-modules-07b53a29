import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModuleCard } from '@/components/settings/ModuleCard';
import { SidebarPreview } from '@/components/modules/SidebarPreview';
import { Loader2 } from 'lucide-react';

interface Module {
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

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('getMyModules');

      if (error) throw error;

      setModules(data.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast({
        title: 'Erro ao carregar módulos',
        description: 'Não foi possível carregar a lista de módulos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleToggle = async (moduleKey: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('toggleModuleState', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Módulo atualizado',
          description: 'O status do módulo foi alterado com sucesso.',
        });
        // Reload modules to update UI
        await loadModules();
      }
    } catch (error: any) {
      console.error('Error toggling module:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o status do módulo.',
        variant: 'destructive',
      });
    }
  };

  const handleRequest = async (moduleKey: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('requestNewModule', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: data.message || 'Nossa equipe entrará em contato em breve.',
      });
    } catch (error: any) {
      console.error('Error requesting module:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = Array.from(new Set(modules.map((m) => m.category)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gestão de Módulos</CardTitle>
              <CardDescription>
                Ative ou desative os módulos contratados pela sua clínica. Solicite novos módulos conforme necessário.
              </CardDescription>
            </CardHeader>
            <CardContent>
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules
                    .filter((m) => m.category === category)
                    .map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onToggle={handleToggle}
                        onRequest={handleRequest}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Prévia da Sidebar</h3>
            <SidebarPreview modules={modules} />
          </div>
        </div>
      </div>
    </div>
  );
}
