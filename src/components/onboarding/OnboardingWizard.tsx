import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Zap, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  modules: Module[];
  onActivateModules: (moduleKeys: string[]) => Promise<void>;
}

type ClinicProfile = 'small' | 'medium' | 'large' | null;

const profileRecommendations: Record<Exclude<ClinicProfile, null>, string[]> = {
  small: ['DASHBOARD', 'PACIENTES', 'AGENDA', 'PEP', 'FINANCEIRO'],
  medium: ['DASHBOARD', 'PACIENTES', 'DENTISTAS', 'FUNCIONARIOS', 'AGENDA', 'PEP', 'PROCEDIMENTOS', 'FINANCEIRO', 'ESTOQUE'],
  large: ['DASHBOARD', 'PACIENTES', 'DENTISTAS', 'FUNCIONARIOS', 'AGENDA', 'PEP', 'PROCEDIMENTOS', 'FINANCEIRO', 'ESTOQUE', 'BI', 'CRM', 'MARKETING_AUTO', 'LGPD', 'RELATORIOS']
};

export function OnboardingWizard({ isOpen, onClose, modules, onActivateModules }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<ClinicProfile>(null);
  const [activating, setActivating] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleProfileSelect = (profile: Exclude<ClinicProfile, null>) => {
    setSelectedProfile(profile);
    setStep(2);
  };

  const handleActivate = async () => {
    if (!selectedProfile) return;

    setActivating(true);
    try {
      const recommendedKeys = profileRecommendations[selectedProfile];
      await onActivateModules(recommendedKeys);
      setStep(3);
    } catch (error) {
      console.error('Erro ao ativar módulos:', error);
    } finally {
      setActivating(false);
    }
  };

  const handleFinish = () => {
    onClose(false);
    setStep(1);
    setSelectedProfile(null);
  };

  const getRecommendedModules = () => {
    if (!selectedProfile) return [];
    const keys = profileRecommendations[selectedProfile];
    return modules.filter(m => keys.includes(m.module_key));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            Assistente de Configuração
          </DialogTitle>
          <DialogDescription>
            Configure seu sistema automaticamente baseado no perfil da sua clínica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Profile Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Qual o tamanho da sua clínica?</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione o perfil que melhor representa sua operação
                </p>
              </div>

              <div className="grid gap-4">
                <Card
                  onClick={() => handleProfileSelect('small')}
                  className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">Clínica Pequena</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        1-2 dentistas, operação básica com foco em atendimento
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">5 módulos</Badge>
                        <Badge variant="outline">Rápido</Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  onClick={() => handleProfileSelect('medium')}
                  className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">Clínica Média</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        3-5 dentistas, gestão intermediária com controle de estoque
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">9 módulos</Badge>
                        <Badge variant="outline">Recomendado</Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  onClick={() => handleProfileSelect('large')}
                  className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Zap className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">Clínica Grande</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        6+ dentistas, gestão completa com BI, marketing e compliance
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">14+ módulos</Badge>
                        <Badge variant="outline">Completo</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Módulos Recomendados</h3>
                <p className="text-sm text-muted-foreground">
                  Baseado no perfil selecionado, vamos ativar estes módulos
                </p>
              </div>

              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                {getRecommendedModules().map((module) => (
                  <Card key={module.id} className="p-4 bg-accent/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm mb-1">{module.name}</h5>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {module.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={activating}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleActivate}
                  className="flex-1"
                  disabled={activating}
                >
                  {activating ? (
                    'Ativando...'
                  ) : (
                    <>
                      Ativar Módulos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-6 text-center animate-fade-in py-8">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-success/10 text-success">
                  <CheckCircle className="h-16 w-16" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Configuração Concluída!</h3>
                <p className="text-muted-foreground">
                  Seus módulos foram ativados com sucesso. <br />
                  Você já pode começar a usar o sistema.
                </p>
              </div>

              <Button onClick={handleFinish} size="lg" className="px-8">
                Começar a Usar
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}