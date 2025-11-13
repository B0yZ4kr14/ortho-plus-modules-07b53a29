import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, Send } from 'lucide-react';

export default function TestNotifications() {
  const { selectedClinic } = useAuth();
  const [tipo, setTipo] = useState('SYSTEM');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [linkAcao, setLinkAcao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateNotification = async () => {
    if (!selectedClinic || !titulo || !mensagem) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        clinic_id: selectedClinic.id,
        tipo,
        titulo,
        mensagem,
        link_acao: linkAcao || null,
      });

      if (error) throw error;

      toast.success('Notificação criada com sucesso!');
      
      // Reset form
      setTitulo('');
      setMensagem('');
      setLinkAcao('');
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Erro ao criar notificação');
    } finally {
      setLoading(false);
    }
  };

  const createTestNotifications = async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const testNotifications = [
        {
          tipo: 'CONSULTA',
          titulo: 'Consulta Agendada',
          mensagem: 'Nova consulta agendada para amanhã às 14:00',
          link_acao: '/agenda',
        },
        {
          tipo: 'PAGAMENTO',
          titulo: 'Pagamento Recebido',
          mensagem: 'Pagamento de R$ 350,00 foi confirmado',
          link_acao: '/financeiro/transacoes',
        },
        {
          tipo: 'ALERTA',
          titulo: 'Estoque Baixo',
          mensagem: 'Produto "Luvas P" está com estoque baixo',
          link_acao: '/estoque',
        },
        {
          tipo: 'LEMBRETE',
          titulo: 'Lembrete de Consulta',
          mensagem: 'Consulta com João Silva em 1 hora',
          link_acao: '/agenda',
        },
        {
          tipo: 'SYSTEM',
          titulo: 'Atualização do Sistema',
          mensagem: 'Nova versão do Ortho+ disponível com melhorias',
          link_acao: '/dashboard',
        },
      ];

      for (const notification of testNotifications) {
        await supabase.from('notifications').insert({
          clinic_id: selectedClinic.id,
          ...notification,
        });
      }

      toast.success('5 notificações de teste criadas!');
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast.error('Erro ao criar notificações de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Teste de Notificações</h1>
          <p className="text-muted-foreground">Crie notificações de teste para validar o sistema</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar Notificação Personalizada</CardTitle>
            <CardDescription>
              Preencha os campos para criar uma notificação customizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Notificação</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYSTEM">Sistema</SelectItem>
                  <SelectItem value="CONSULTA">Consulta</SelectItem>
                  <SelectItem value="PAGAMENTO">Pagamento</SelectItem>
                  <SelectItem value="ALERTA">Alerta</SelectItem>
                  <SelectItem value="LEMBRETE">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Nova Consulta Agendada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem *</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva a notificação..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link de Ação (opcional)</Label>
              <Input
                id="link"
                value={linkAcao}
                onChange={(e) => setLinkAcao(e.target.value)}
                placeholder="/agenda"
              />
            </div>

            <Button 
              onClick={handleCreateNotification} 
              disabled={loading}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Criar Notificação
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações de Teste Rápido</CardTitle>
            <CardDescription>
              Crie 5 notificações de diferentes tipos para testar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium">Notificações que serão criadas:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>📅 Consulta Agendada</li>
                <li>💰 Pagamento Recebido</li>
                <li>⚠️ Estoque Baixo</li>
                <li>🔔 Lembrete de Consulta</li>
                <li>⚙️ Atualização do Sistema</li>
              </ul>
            </div>

            <Button 
              onClick={createTestNotifications} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              Criar 5 Notificações de Teste
            </Button>

            <div className="text-xs text-muted-foreground">
              As notificações aparecerão no sino do header em tempo real
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
