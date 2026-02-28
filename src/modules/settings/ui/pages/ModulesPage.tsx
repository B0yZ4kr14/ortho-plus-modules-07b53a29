import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ModuleCard } from '@/components/settings/ModuleCard';
import { SidebarPreview } from '@/components/modules/SidebarPreview';
import { useModules } from '@/hooks/useModules';
import { groupModulesByCategory, getModuleStats } from '@/core/config/modules.config';
import { Loader2, Package, CheckCircle2, Circle, Lock } from 'lucide-react';

export default function ModulesPage() {
  const { modules, loading, toggleModule } = useModules();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando módulos...</p>
      </div>
    );
  }

  const categoryGroups = groupModulesByCategory(modules);
  const stats = getModuleStats(modules);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Módulos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Contratados</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
              {stats.subscribed}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ativos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Circle className="h-6 w-6 text-green-500 fill-green-500" />
              {stats.active}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Disponíveis</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Lock className="h-6 w-6 text-amber-500" />
              {stats.available}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
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
              <Tabs defaultValue={categoryGroups[0]?.name} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categoryGroups.length}, 1fr)` }}>
                  {categoryGroups.map((category) => (
                    <TabsTrigger key={category.name} value={category.name}>
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categoryGroups.map((category) => (
                  <TabsContent key={category.name} value={category.name} className="space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{category.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.modules.filter(m => m.subscribed).length} de {category.modules.length} módulos contratados
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {category.modules.filter(m => m.is_active).length} ativos
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.modules.map((module) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          onToggle={toggleModule}
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
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prévia da Sidebar</CardTitle>
                <CardDescription>
                  Visualize como os módulos ativos aparecerão na navegação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SidebarPreview modules={modules} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
