import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, X } from 'lucide-react';
import { StepOverview } from './steps/StepOverview';
import { StepActivation } from './steps/StepActivation';
import { StepDependencies } from './steps/StepDependencies';
import { StepSimulation } from './steps/StepSimulation';
import { StepExport } from './steps/StepExport';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'overview',
    title: 'Visão Geral',
    description: 'Conheça o Ortho+ e seus recursos',
    component: StepOverview,
  },
  {
    id: 'activation',
    title: 'Ativação de Módulos',
    description: 'Configure quais módulos estarão ativos',
    component: StepActivation,
  },
  {
    id: 'dependencies',
    title: 'Dependências',
    description: 'Entenda as dependências entre módulos',
    component: StepDependencies,
  },
  {
    id: 'simulation',
    title: 'Simulação',
    description: 'Experimente ativar e desativar módulos',
    component: StepSimulation,
  },
  {
    id: 'export',
    title: 'Configuração Final',
    description: 'Exporte sua configuração personalizada',
    component: StepExport,
  },
];

interface OnboardingWizardProps {
  open?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export function OnboardingWizard({ open = true, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const step = STEPS[currentStep];
  const StepComponent = step.component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleClose = () => {
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      toast.success(`Avançando para: ${STEPS[currentStep + 1].title}`);
    } else {
      setCompleted(true);
      toast.success('🎉 Onboarding concluído com sucesso!');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete?.();
    handleClose();
    navigate('/');
  };

  if (completed) {
    return (
      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/30"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-destructive" />
              </Button>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                
                <div className="text-center space-y-4 pt-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">Parabéns! 🎉</h2>
                  <p className="text-muted-foreground text-lg">
                    Você concluiu o onboarding do Ortho+. Agora você está pronto para começar a usar o sistema completo.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                  <h3 className="font-semibold">O que vem a seguir?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Acesse o Dashboard para visualizar métricas da sua clínica</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Configure usuários e permissões em Configurações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Ative/desative módulos conforme sua necessidade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Explore os 22 módulos descentralizados disponíveis</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={handleFinish} size="lg" className="w-full gap-2">
                  <Sparkles className="h-5 w-5" />
                  Começar a usar o Ortho+
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/30"
              onClick={handleClose}
            >
              <X className="h-5 w-5 text-destructive" />
            </Button>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
        <div className="relative p-6 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2 pr-12">
            <h1 className="text-3xl font-bold">
              Bem-vindo ao Ortho<span className="text-primary">+</span>
            </h1>
            <p className="text-muted-foreground">
              Vamos configurar seu sistema em {STEPS.length} passos simples
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep + 1} de {STEPS.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex justify-center gap-2">
            {STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground scale-110'
                    : index < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>
            ))}
          </div>

          {/* Current Step Content */}
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] max-h-[400px] overflow-y-auto">
              <StepComponent />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {currentStep === STEPS.length - 1 ? 'Concluir' : 'Próximo'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
