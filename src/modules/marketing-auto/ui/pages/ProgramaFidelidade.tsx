import { Award, Gift, Star, TrendingUp, Users, Zap, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useFidelidadeSupabase } from '@/modules/fidelidade/hooks/useFidelidadeSupabase';
import { RecompensaForm } from '@/components/fidelidade/RecompensaForm';
import { BadgeForm } from '@/components/fidelidade/BadgeForm';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function ProgramaFidelidade() {
  const { pontos, recompensas, badges, indicacoes, loading } = useFidelidadeSupabase();
  const [recompensaFormOpen, setRecompensaFormOpen] = useState(false);
  const [badgeFormOpen, setBadgeFormOpen] = useState(false);
  const [editingRecompensa, setEditingRecompensa] = useState<any>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    });
  };

  const handleShareBadge = async (badgeName: string) => {
    const shareText = `🏆 Acabei de conquistar o badge "${badgeName}" no meu programa de fidelidade odontológico! #Ortho+ #Saúde`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        toast.success('Badge compartilhado com sucesso!');
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Texto copiado para a área de transferência!');
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'DIAMANTE': return 'text-cyan-500';
      case 'PLATINA': return 'text-slate-400';
      case 'OURO': return 'text-yellow-500';
      case 'PRATA': return 'text-gray-400';
      case 'BRONZE': return 'text-amber-700';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIndicacaoVariant = (status: string) => {
    switch (status) {
      case 'COMPARECEU': return 'default';
      case 'AGENDADO': return 'info';
      case 'PENDENTE': return 'warning';
      case 'NAO_COMPARECEU': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={Award}
        title="Programa de Fidelidade"
        description="Sistema de pontos, recompensas e gamificação para engajamento de pacientes"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Ativos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.8K</div>
            <p className="text-xs text-muted-foreground">Em circulação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resgates</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Novos pacientes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pacientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pacientes">Pacientes & Pontos</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pontos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum paciente cadastrado no programa ainda
                  </p>
                ) : (
                  pontos.map((paciente, index) => (
                    <Card key={paciente.id} className="p-4 transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-muted-foreground">#{index + 1}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{paciente.patient_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getNivelColor(paciente.nivel)}>
                              {paciente.nivel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {paciente.pontos_totais} pontos totais
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {paciente.pontos_disponiveis}
                        </div>
                        <p className="text-sm text-muted-foreground">pontos disponíveis</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso para próximo nível</span>
                        <span className="font-medium">
                          {Math.round((paciente.pontos_totais % 1000) / 10)}%
                        </span>
                      </div>
                      <Progress 
                        value={(paciente.pontos_totais % 1000) / 10} 
                        className="h-3 transition-all duration-500"
                      />
                    </div>

                    {paciente.badges && paciente.badges.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {paciente.badges.map((badge, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="gap-1 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => {
                              triggerConfetti();
                              handleShareBadge(badge.nome);
                            }}
                          >
                            <Zap className="h-3 w-3" />
                            {badge.nome}
                            <Share2 className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recompensas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catálogo de Recompensas</CardTitle>
              <Button onClick={() => setRecompensaFormOpen(true)}>Adicionar Recompensa</Button>
            </CardHeader>
            <CardContent>
              {recompensas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma recompensa cadastrada ainda
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recompensas.map((recompensa) => (
                  <Card key={recompensa.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <Badge variant={recompensa.ativo ? 'default' : 'secondary'}>
                        {recompensa.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{recompensa.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{recompensa.descricao}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{recompensa.pontos_necessarios}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingRecompensa(recompensa);
                          setRecompensaFormOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Indicação Premiada</CardTitle>
            </CardHeader>
            <CardContent>
              {indicacoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma indicação registrada ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {indicacoes.map((indicacao) => (
                  <div key={indicacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{indicacao.indicador_nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Indicou: {indicacao.indicado_nome} • {indicacao.indicado_telefone}
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(indicacao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {indicacao.pontos_concedidos && (
                        <div className="font-medium text-green-600">
                          +{indicacao.pontos_concedidos} pontos
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusIndicacaoVariant(indicacao.status)}>
                      {indicacao.status}
                    </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Badges Compartilháveis</CardTitle>
              <Button onClick={() => setBadgeFormOpen(true)}>Criar Badge</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure badges que pacientes podem conquistar e compartilhar nas redes sociais
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Programa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pontos por Consulta</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={10} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pontos por R$ Gasto</label>
                  <input type="number" step="0.1" className="w-full mt-1 p-2 border rounded" defaultValue={1} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pontos por Indicação</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={50} />
                </div>
                <div>
                  <label className="text-sm font-medium">Validade dos Pontos (dias)</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={365} />
                </div>
              </div>
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RecompensaForm
        open={recompensaFormOpen}
        onOpenChange={(open) => {
          setRecompensaFormOpen(open);
          if (!open) setEditingRecompensa(null);
        }}
        procedimentos={[]}
        editingRecompensa={editingRecompensa}
      />

      <BadgeForm
        open={badgeFormOpen}
        onOpenChange={setBadgeFormOpen}
      />
    </div>
  );
}
