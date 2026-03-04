import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileText, Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  filters: any;
  layout: string;
  is_active: boolean;
  created_at: string;
}

export default function ReportTemplates() {
  const { hasRole, clinicId } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);

  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('financeiro');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [templateLayout, setTemplateLayout] = useState('table');

  const availableMetrics = [
    { id: 'receita_total', label: 'Receita Total', category: 'financeiro' },
    { id: 'despesas_total', label: 'Despesas Total', category: 'financeiro' },
    { id: 'lucro_liquido', label: 'Lucro Líquido', category: 'financeiro' },
    { id: 'ticket_medio', label: 'Ticket Médio', category: 'financeiro' },
    { id: 'total_pacientes', label: 'Total de Pacientes', category: 'pacientes' },
    { id: 'novos_pacientes', label: 'Novos Pacientes', category: 'pacientes' },
    { id: 'taxa_retorno', label: 'Taxa de Retorno', category: 'pacientes' },
    { id: 'consultas_realizadas', label: 'Consultas Realizadas', category: 'agenda' },
    { id: 'taxa_ocupacao', label: 'Taxa de Ocupação', category: 'agenda' },
    { id: 'taxa_cancelamento', label: 'Taxa de Cancelamento', category: 'agenda' },
    { id: 'procedimentos_total', label: 'Total de Procedimentos', category: 'procedimentos' },
    { id: 'tratamentos_pendentes', label: 'Tratamentos Pendentes', category: 'tratamentos' },
    { id: 'tratamentos_concluidos', label: 'Tratamentos Concluídos', category: 'tratamentos' },
  ];

  useEffect(() => {
    if (hasRole('ADMIN')) {
      loadTemplates();
    }
  }, [hasRole, clinicId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Mock data - em produção, buscaria do banco
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Relatório Financeiro Mensal',
          description: 'Análise completa de receitas, despesas e lucratividade',
          category: 'financeiro',
          metrics: ['receita_total', 'despesas_total', 'lucro_liquido', 'ticket_medio'],
          filters: { period: 'monthly' },
          layout: 'chart',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Dashboard de Pacientes',
          description: 'Visão geral da base de pacientes e taxa de retorno',
          category: 'pacientes',
          metrics: ['total_pacientes', 'novos_pacientes', 'taxa_retorno'],
          filters: { period: 'quarterly' },
          layout: 'cards',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ];
      setTemplates(mockTemplates);
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    if (!templateName || selectedMetrics.length === 0) {
      toast.error('Preencha o nome e selecione pelo menos uma métrica');
      return;
    }

    const newTemplate: ReportTemplate = {
      id: Math.random().toString(),
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      metrics: selectedMetrics,
      filters: {},
      layout: templateLayout,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setTemplates([...templates, newTemplate]);
    toast.success('Template criado com sucesso!');
    handleCloseDialog();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    const updatedTemplates = templates.map(t =>
      t.id === editingTemplate.id
        ? {
            ...t,
            name: templateName,
            description: templateDescription,
            category: templateCategory,
            metrics: selectedMetrics,
            layout: templateLayout,
          }
        : t
    );

    setTemplates(updatedTemplates);
    toast.success('Template atualizado com sucesso!');
    handleCloseDialog();
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Template excluído com sucesso!');
  };

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    const duplicated: ReportTemplate = {
      ...template,
      id: Math.random().toString(),
      name: `${template.name} (Cópia)`,
      created_at: new Date().toISOString(),
    };

    setTemplates([...templates, duplicated]);
    toast.success('Template duplicado com sucesso!');
  };

  const handleToggleActive = (id: string) => {
    const updatedTemplates = templates.map(t =>
      t.id === id ? { ...t, is_active: !t.is_active } : t
    );
    setTemplates(updatedTemplates);
  };

  const handleEditClick = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setTemplateCategory(template.category);
    setSelectedMetrics(template.metrics);
    setTemplateLayout(template.layout);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('financeiro');
    setSelectedMetrics([]);
    setTemplateLayout('table');
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    );
  };

  if (!hasRole('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Templates de Relatórios"
        icon={FileText}
        description="Crie e gerencie templates personalizados para relatórios do sistema"
      />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Configure as métricas, filtros e layout do seu relatório personalizado
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Relatório Financeiro Mensal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Descreva o propósito deste relatório..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={templateCategory} onValueChange={setTemplateCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="pacientes">Pacientes</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                      <SelectItem value="procedimentos">Procedimentos</SelectItem>
                      <SelectItem value="tratamentos">Tratamentos</SelectItem>
                      <SelectItem value="geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione as métricas que deseja incluir no relatório
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMetrics
                    .filter(m => m.category === templateCategory)
                    .map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <Label htmlFor={metric.id} className="cursor-pointer">
                          {metric.label}
                        </Label>
                        <Switch
                          id={metric.id}
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetric(metric.id)}
                        />
                      </div>
                    ))}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Métricas selecionadas: {selectedMetrics.length}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Visualização</Label>
                  <Select value={templateLayout} onValueChange={setTemplateLayout}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Tabela</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                      <SelectItem value="chart">Gráfico</SelectItem>
                      <SelectItem value="dashboard">Dashboard Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview do Layout</p>
                  <div className="h-32 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">
                      {templateLayout === 'table' && 'Visualização em Tabela'}
                      {templateLayout === 'cards' && 'Visualização em Cards'}
                      {templateLayout === 'chart' && 'Visualização em Gráfico'}
                      {templateLayout === 'dashboard' && 'Dashboard Completo'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="flex-1"
              >
                {editingTemplate ? 'Atualizar' : 'Criar'} Template
              </Button>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Carregando templates...</p>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum template criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Categoria: {template.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.metrics.length} métrica(s) configurada(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Layout: {template.layout}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor={`active-${template.id}`} className="text-sm cursor-pointer">
                    Ativo
                  </Label>
                  <Switch
                    id={`active-${template.id}`}
                    checked={template.is_active}
                    onCheckedChange={() => handleToggleActive(template.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
