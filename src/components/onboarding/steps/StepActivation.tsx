import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function StepActivation() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Ativação de Módulos
        </h3>
        <p className="text-muted-foreground">
          Aprenda como ativar e desativar módulos de forma segura e eficiente.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Como Funciona o Toggle
        </h4>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Módulo Ativo</p>
                <Switch checked disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Quando um módulo está ativo, ele aparece no menu lateral e todas as suas
                funcionalidades estão disponíveis para os usuários.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted border border-border">
            <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Módulo Inativo</p>
                <Switch checked={false} disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Quando desativado, o módulo é removido do menu e suas funcionalidades ficam
                inacessíveis. Os dados são preservados.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-warning/5 border border-warning/20">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Toggle Desabilitado</p>
                <Switch checked={false} disabled className="opacity-50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Quando o toggle está desabilitado (acinzentado), significa que há dependências
                não atendidas ou módulos dependentes ativos.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Estados de Módulos
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Badge variant="default">Contratado & Ativo</Badge>
              <span className="text-sm text-foreground">Pronto para uso</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Contratado & Inativo</Badge>
              <span className="text-sm text-foreground">Pode ser ativado</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Não Contratado</Badge>
              <span className="text-sm text-foreground">Solicite contratação</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-500/5 border-blue-500/20">
        <h4 className="font-semibold text-foreground mb-3">
          🎯 Próximo Passo
        </h4>
        <p className="text-sm text-muted-foreground">
          Agora que você entende como ativar módulos, vamos aprender sobre as dependências
          entre eles e como elas funcionam.
        </p>
      </Card>
    </div>
  );
}
