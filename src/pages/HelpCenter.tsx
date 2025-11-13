import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, AlertTriangle, CheckCircle, Shield, Info } from 'lucide-react';
import { odontoTooltipsData, type OdontoTooltip } from '@/core/tooltips/odonto-tooltips-data';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<OdontoTooltip | null>(null);

  const allModules = Object.values(odontoTooltipsData);

  const filteredModules = allModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    const labels = {
      gestao: 'Gestão',
      clinico: 'Clínico',
      financeiro: 'Financeiro',
      marketing: 'Marketing',
      compliance: 'Compliance',
      inovacao: 'Inovação'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critico': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'alto': return 'bg-warning/10 text-warning border-warning/30';
      case 'moderado': return 'bg-info/10 text-info border-info/30';
      case 'baixo': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-secondary';
    }
  };

  const modulesByCategory = {
    gestao: allModules.filter(m => m.category === 'gestao'),
    clinico: allModules.filter(m => m.category === 'clinico'),
    financeiro: allModules.filter(m => m.category === 'financeiro'),
    marketing: allModules.filter(m => m.category === 'marketing'),
    compliance: allModules.filter(m => m.category === 'compliance'),
    inovacao: allModules.filter(m => m.category === 'inovacao'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Documentação completa dos 85+ módulos do sistema
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar módulo ou funcionalidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module List */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="categorias">Categorias</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredModules.map((module) => (
                    <Card
                      key={module.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedModule?.id === module.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardHeader className="p-4">
                        <div className="space-y-2">
                          <CardTitle className="text-sm">{module.title}</CardTitle>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(module.category)}
                            </Badge>
                            {module.riskLevel && (
                              <Badge className={`text-xs ${getRiskColor(module.riskLevel)}`}>
                                {module.riskLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="categorias" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {Object.entries(modulesByCategory).map(([category, modules]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-2 text-sm">
                        {getCategoryLabel(category)} ({modules.length})
                      </h3>
                      <div className="space-y-2">
                        {modules.map((module) => (
                          <Card
                            key={module.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedModule?.id === module.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedModule(module)}
                          >
                            <CardHeader className="p-3">
                              <CardTitle className="text-xs">{module.title}</CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Module Details */}
        <div className="lg:col-span-2">
          {selectedModule ? (
            <Card>
              <CardHeader>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                    <Badge variant="secondary">
                      {getCategoryLabel(selectedModule.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedModule.riskLevel && (
                      <Badge className={getRiskColor(selectedModule.riskLevel)}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Risco {selectedModule.riskLevel}
                      </Badge>
                    )}
                    {selectedModule.requiredTraining && (
                      <Badge variant="outline">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Requer treinamento
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {selectedModule.definition}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Indicações */}
                {selectedModule.indications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      Indicações
                    </h3>
                    <ul className="space-y-2">
                      {selectedModule.indications.map((indication, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-success before:font-bold">
                          {indication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Contraindicações */}
                {selectedModule.contraindications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Contraindicações
                    </h3>
                    <ul className="space-y-2">
                      {selectedModule.contraindications.map((contraindication, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-6 relative before:content-['⚠'] before:absolute before:left-0 before:text-destructive before:font-bold">
                          {contraindication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Melhores Práticas */}
                {selectedModule.bestPractices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                      <Shield className="h-5 w-5" />
                      Melhores Práticas
                    </h3>
                    <ul className="space-y-2">
                      {selectedModule.bestPractices.map((practice, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-primary before:font-bold">
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Info className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Selecione um módulo</h3>
                <p className="text-muted-foreground">
                  Escolha um módulo na lista ao lado para ver a documentação completa
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
