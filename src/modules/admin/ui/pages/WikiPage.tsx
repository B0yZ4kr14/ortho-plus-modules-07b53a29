import { useState, useEffect } from 'react';
import { BookText, Plus, Search, Edit, Trash2, Eye, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export default function WikiPage() {
  const { clinicId } = useAuth();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<WikiPage | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    is_published: false
  });

  const categories = [
    { value: 'general', label: 'Geral' },
    { value: 'processes', label: 'Processos' },
    { value: 'apis', label: 'APIs' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'guides', label: 'Guias' }
  ];

  const fetchPages = async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setPages(data || []);
    } catch (error) {
      toast.error('Erro ao carregar páginas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [clinicId]);

  const handleSave = async () => {
    if (!clinicId || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      if (editingPage) {
        // Update
        const { error } = await supabase
          .from('wiki_pages')
          .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            is_published: formData.is_published
          })
          .eq('id', editingPage.id);

        if (error) throw error;

        toast.success('Página atualizada');
      } else {
        // Create
        const { error } = await supabase
          .from('wiki_pages')
          .insert({
            clinic_id: clinicId,
            title: formData.title,
            slug,
            content: formData.content,
            category: formData.category,
            is_published: formData.is_published,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        toast.success('Página criada');
      }

      setDialogOpen(false);
      setEditingPage(null);
      setFormData({ title: '', content: '', category: 'general', is_published: false });
      fetchPages();
    } catch (error) {
      toast.error('Erro ao salvar página');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta página?')) return;

    try {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Página deletada');
      fetchPages();
    } catch (error) {
      toast.error('Erro ao deletar página');
      console.error(error);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Wiki Interna"
          description="Documentação e base de conhecimento da clínica"
          icon={BookText}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPage(null);
              setFormData({ title: '', content: '', category: 'general', is_published: false });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Página
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? 'Editar' : 'Nova'} Página Wiki</DialogTitle>
                <DialogDescription>
                  Crie ou edite páginas de documentação usando Markdown
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Como realizar um backup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Publicado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Conteúdo (Markdown)</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="# Título&#10;&#10;Conteúdo da página..."
                    rows={15}
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => (
          <Card key={page.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{page.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="mr-2">
                      {categories.find(c => c.value === page.category)?.label}
                    </Badge>
                    {page.is_published ? (
                      <Badge variant="default">Publicado</Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {page.content.substring(0, 150)}...
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Atualizado: {new Date(page.updated_at).toLocaleDateString()}</span>
                <span>• v{page.version}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingPage(page);
                    setFormData({
                      title: page.title,
                      content: page.content,
                      category: page.category,
                      is_published: page.is_published
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(page.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Nenhuma página encontrada</p>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira página de documentação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
