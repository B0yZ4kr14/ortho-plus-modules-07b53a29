import { Card } from '@/components/ui/card';
import { ArrowRight, GitBranch, Lock, Unlock } from 'lucide-react';

export function StepDependencies() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Entendendo Dependências
        </h3>
        <p className="text-muted-foreground">
          Alguns módulos dependem de outros para funcionar corretamente. Veja como isso funciona.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Como Funcionam as Dependências
        </h4>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <p className="text-sm text-foreground mb-3 font-medium">
              Exemplo: Split de Pagamento depende do Financeiro
            </p>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium text-primary">Financeiro</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
                <span className="text-sm font-medium text-foreground">Split de Pagamento</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              O módulo Split de Pagamento precisa das funcionalidades do módulo Financeiro
              para processar transações divididas.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Unlock className="h-5 w-5 text-success" />
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-1">
                Pode Ativar
              </h5>
              <p className="text-xs text-muted-foreground">
                Todas as dependências estão ativas
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-foreground">Toggle habilitado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-foreground">Sem avisos</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-1">
                Não Pode Ativar
              </h5>
              <p className="text-xs text-muted-foreground">
                Dependências não atendidas
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-foreground">Toggle desabilitado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-foreground">Tooltip com aviso</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-warning/5 border-warning/20">
        <h4 className="font-semibold text-foreground mb-3">
          ⚠️ Desativação de Módulos
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          Ao tentar desativar um módulo, o sistema verifica se outros módulos dependem dele:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>
              Se houver módulos dependentes ativos, você precisará desativá-los primeiro
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>
              O sistema mostra quais módulos estão bloqueando a desativação
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>
              Isso garante que o sistema sempre esteja em um estado consistente
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
