import { Card } from '@/components/ui/card';
import { Package, Zap, Shield, TrendingUp } from 'lucide-react';

export function StepOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Visão Geral do Sistema Modular
        </h3>
        <p className="text-muted-foreground">
          O Ortho+ é um sistema totalmente modular que permite à sua clínica ativar apenas
          os módulos que realmente necessita, otimizando custos e simplificando a operação.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Módulos Independentes
              </h4>
              <p className="text-sm text-muted-foreground">
                Cada módulo funciona de forma independente, permitindo ativação/desativação
                sem afetar outros módulos.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Ativação Instantânea
              </h4>
              <p className="text-sm text-muted-foreground">
                Módulos podem ser ativados ou desativados instantaneamente através de um
                simples toggle.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Controle Granular
              </h4>
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem gerenciar módulos, garantindo controle total
                sobre o sistema.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Escalabilidade
              </h4>
              <p className="text-sm text-muted-foreground">
                Comece com módulos essenciais e expanda conforme sua clínica cresce.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold text-foreground mb-3">
          💡 Dica Importante
        </h4>
        <p className="text-sm text-muted-foreground">
          O sistema possui dependências inteligentes entre módulos. Por exemplo, o módulo
          "Split de Pagamento" requer que o módulo "Financeiro" esteja ativo. Isso garante
          que você tenha todas as funcionalidades necessárias para usar cada recurso.
        </p>
      </Card>
    </div>
  );
}
