import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  ToggleLeft, 
  GitBranch, 
  Zap, 
  Download,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { StepOverview } from './steps/StepOverview';
import { StepActivation } from './steps/StepActivation';
import { StepDependencies } from './steps/StepDependencies';
import { StepSimulation } from './steps/StepSimulation';
import { StepExport } from './steps/StepExport';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Visão Geral',
    description: 'Conheça o sistema modular',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Ativação de Módulos',
    description: 'Aprenda a ativar módulos',
    icon: ToggleLeft,
  },
  {
    id: 3,
    title: 'Dependências',
    description: 'Entenda as dependências',
    icon: GitBranch,
  },
  {
    id: 4,
    title: 'Simulação What-If',
    description: 'Simule cenários',
    icon: Zap,
  },
  {
    id: 5,
    title: 'Exportação',
    description: 'Exporte configurações',
    icon: Download,
  },
];

export function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    localStorage.setItem('ortho-onboarding-completed', 'true');
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepOverview />;
      case 2:
        return <StepActivation />;
      case 3:
        return <StepDependencies />;
      case 4:
        return <StepSimulation />;
      case 5:
        return <StepExport />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao Ortho+
          </h2>
          <p className="text-muted-foreground">
            Guia interativo de onboarding para administradores
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-border p-4 overflow-y-auto">
            <nav className="space-y-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        className={`h-5 w-5 ${
                          isActive
                            ? 'text-primary'
                            : isCompleted
                            ? 'text-success'
                            : 'text-muted-foreground'
                        }`}
                      />
                      {isCompleted && (
                        <CheckCircle2 className="h-3 w-3 text-success absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            Passo {currentStep} de {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Concluir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
