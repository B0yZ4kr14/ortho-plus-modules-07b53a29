import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Eye, AlertTriangle } from 'lucide-react';

export function StepSimulation() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Simulação What-If
        </h3>
        <p className="text-muted-foreground">
          Visualize o impacto de ativar ou desativar módulos antes de fazer alterações reais.
        </p>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              O Que é a Simulação What-If?
            </h4>
            <p className="text-sm text-muted-foreground">
              É uma ferramenta poderosa que permite visualizar todas as consequências de ativar
              ou desativar um módulo antes de realmente fazer a mudança. Você pode ver em tempo
              real quais outros módulos serão afetados.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Como Usar
        </h4>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                Acesse o Grafo de Dependências
              </p>
              <p className="text-sm text-muted-foreground">
                Na página de Gestão de Módulos, clique no botão "Ver Grafo de Dependências"
                para abrir a visualização interativa.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                Clique em um Módulo
              </p>
              <p className="text-sm text-muted-foreground">
                Selecione qualquer módulo no grafo para simular sua ativação ou desativação.
                O sistema calculará automaticamente todos os impactos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                Analise os Resultados
              </p>
              <p className="text-sm text-muted-foreground">
                Veja quais módulos serão habilitados, desabilitados ou bloqueados pela sua ação.
                O grafo destaca visualmente todos os módulos afetados.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-success/20 bg-success/5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-success" />
            <h5 className="font-semibold text-foreground">Módulos Habilitados</h5>
          </div>
          <p className="text-sm text-muted-foreground">
            Destacados em verde, mostram quais módulos poderão ser ativados após a mudança.
          </p>
        </Card>

        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h5 className="font-semibold text-foreground">Módulos Bloqueados</h5>
          </div>
          <p className="text-sm text-muted-foreground">
            Destacados em vermelho, indicam módulos que serão desabilitados ou bloqueados.
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-blue-500/5 border-blue-500/20">
        <h4 className="font-semibold text-foreground mb-3">
          💡 Dica Pro
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          Use a simulação sempre que planejar mudanças complexas na configuração de módulos.
          Isso evita surpresas e garante que sua clínica mantenha todas as funcionalidades
          necessárias ativas.
        </p>
        <Button variant="outline" size="sm" className="mt-2">
          <Eye className="h-4 w-4 mr-2" />
          Ir para Grafo Agora
        </Button>
      </Card>
    </div>
  );
}
