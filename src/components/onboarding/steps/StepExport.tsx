import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileCode, Share2, CheckCircle2 } from 'lucide-react';

export function StepExport() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Exportação de Configurações
        </h3>
        <p className="text-muted-foreground">
          Exporte o grafo de dependências para documentação e apresentações.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Formatos de Exportação
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileImage className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h5 className="font-semibold text-foreground">PNG</h5>
                <p className="text-xs text-muted-foreground">Imagem de alta qualidade</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ideal para apresentações e documentos. Mantém alta qualidade visual.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-success" />
              </div>
              <div>
                <h5 className="font-semibold text-foreground">SVG</h5>
                <p className="text-xs text-muted-foreground">Vetor escalável</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Perfeito para edição posterior. Pode ser redimensionado sem perda de qualidade.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Como Exportar
        </h4>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Abra o Grafo de Dependências
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em "Ver Grafo de Dependências" na página de Gestão de Módulos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Escolha o Formato
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use os botões "Exportar PNG" ou "Exportar SVG" na toolbar superior
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Arquivo Baixado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                O arquivo será baixado automaticamente para sua pasta de Downloads
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-success/20 bg-success/5">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Parabéns! Você concluiu o onboarding
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Você agora tem todo o conhecimento necessário para gerenciar os módulos do
              Ortho+ com confiança. Aqui está um resumo do que você aprendeu:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Como o sistema modular funciona</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Ativar e desativar módulos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Gerenciar dependências entre módulos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Simular cenários com What-If</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Exportar configurações e documentação</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Share2 className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">
            Próximos Passos
          </h4>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Agora você está pronto para começar a configurar os módulos da sua clínica.
          Acesse a página de Gestão de Módulos para começar!
        </p>
        <Button className="w-full">
          Ir para Gestão de Módulos
        </Button>
      </Card>
    </div>
  );
}
