import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Clock, DollarSign, Tag, Globe, Lock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TableFilter } from '@/components/shared/TableFilter';

interface ProcedimentoTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  steps: any;
  tempo_estimado_minutos: number;
  valor_sugerido: number;
  is_public: boolean;
  tags: string[];
  created_by: string;
}

export default function TemplatesProcedimentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['procedimento-templates', categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('procedimento_templates')
        .select('*')
        .order('nome');

      if (categoryFilter !== 'all') {
        query = query.eq('categoria', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProcedimentoTemplate[];
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('procedimento_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimento-templates'] });
      toast({
        title: 'Template excluído',
        description: 'O template foi removido com sucesso.',
      });
    },
  });

  const filteredTemplates = templates.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (categoria: string) => {
    const colors: Record<string, string> = {
      RESTAURACAO: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      ENDODONTIA: 'bg-red-500/10 text-red-700 dark:text-red-400',
      PROTESE: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      ORTODONTIA: 'bg-green-500/10 text-green-700 dark:text-green-400',
      CIRURGIA: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      PERIODONTIA: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
      ESTETICA: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      PREVENTIVA: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    };

    return (
      <Badge className={colors[categoria] || ''}>
        {categoria}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates de Procedimentos</h1>
          <p className="text-muted-foreground mt-2">
            Crie e gerencie templates reutilizáveis para procedimentos comuns
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Template de Procedimento</DialogTitle>
              <DialogDescription>
                Defina um template reutilizável com procedimentos, tempo e valor
              </DialogDescription>
            </DialogHeader>
            <TemplateForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <TableFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar templates..."
        filters={[
          {
            label: 'Categoria',
            value: categoryFilter,
            options: [
              { label: 'Todas as categorias', value: 'all' },
              { label: 'Restauração', value: 'RESTAURACAO' },
              { label: 'Endodontia', value: 'ENDODONTIA' },
              { label: 'Prótese', value: 'PROTESE' },
              { label: 'Ortodontia', value: 'ORTODONTIA' },
              { label: 'Cirurgia', value: 'CIRURGIA' },
              { label: 'Periodontia', value: 'PERIODONTIA' },
              { label: 'Estética', value: 'ESTETICA' },
              { label: 'Preventiva', value: 'PREVENTIVA' },
            ],
            onChange: setCategoryFilter,
          },
        ]}
        onClear={() => {
          setSearchTerm('');
          setCategoryFilter('all');
        }}
      />

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum template encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.nome}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.descricao}
                    </CardDescription>
                  </div>
                  {template.is_public ? (
                    <Globe className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(template.categoria)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{template.tempo_estimado_minutos} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>R$ {template.valor_sugerido.toFixed(2)}</span>
                  </div>
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {template.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Usar Template
                  </Button>
                  {template.created_by === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Template Form Component
function TemplateForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'RESTAURACAO',
    tempo_estimado_minutos: 30,
    valor_sugerido: 0,
    is_public: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('procedimento_templates')
        .insert([{
          nome: data.nome,
          descricao: data.descricao,
          categoria: data.categoria,
          steps: [] as any,
          tempo_estimado_minutos: data.tempo_estimado_minutos,
          valor_sugerido: data.valor_sugerido,
          is_public: data.is_public,
          tags: [],
          created_by: user.id,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimento-templates'] });
      toast({
        title: 'Template criado',
        description: 'O template foi salvo com sucesso.',
      });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Template</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RESTAURACAO">Restauração</SelectItem>
              <SelectItem value="ENDODONTIA">Endodontia</SelectItem>
              <SelectItem value="PROTESE">Prótese</SelectItem>
              <SelectItem value="ORTODONTIA">Ortodontia</SelectItem>
              <SelectItem value="CIRURGIA">Cirurgia</SelectItem>
              <SelectItem value="PERIODONTIA">Periodontia</SelectItem>
              <SelectItem value="ESTETICA">Estética</SelectItem>
              <SelectItem value="PREVENTIVA">Preventiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempo">Tempo (minutos)</Label>
          <Input
            id="tempo"
            type="number"
            min="1"
            value={formData.tempo_estimado_minutos}
            onChange={(e) => setFormData({ ...formData, tempo_estimado_minutos: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor Sugerido (R$)</Label>
        <Input
          id="valor"
          type="number"
          min="0"
          step="0.01"
          value={formData.valor_sugerido}
          onChange={(e) => setFormData({ ...formData, valor_sugerido: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_public"
          checked={formData.is_public}
          onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="is_public" className="font-normal">
          Template público (disponível para todas as clínicas)
        </Label>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending} className="flex-1">
          {createMutation.isPending ? 'Salvando...' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
}
