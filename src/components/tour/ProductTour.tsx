import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "@/contexts/AuthContext";

const TOUR_COMPLETED_KEY = "ortho_plus_tour_completed";

export function ProductTour() {
  const [run, setRun] = useState(false);
  const { user } = useAuth();

  // Disable tour for automated E2E tests (Playwright) completely
  if (typeof window !== "undefined" && window.navigator.webdriver) {
    return null;
  }

  useEffect(() => {
    // Verificar se o tour já foi completado
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);

    // Iniciar tour automaticamente para novos usuários após 2 segundos
    if (!tourCompleted && user) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Bem-vindo ao Ortho+ 🦷
          </h2>
          <p className="text-sm text-muted-foreground">
            Tour rápido pelas principais funcionalidades!
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido por <strong>TSI Telecom</strong>
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            Menu de Navegação
          </h3>
          <p className="text-xs text-muted-foreground">
            Acesse todos os módulos organizados por categoria.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            KPIs em Tempo Real
          </h3>
          <p className="text-xs text-muted-foreground">
            Principais indicadores: pacientes, consultas e receita.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="action-cards"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            Ações Rápidas
          </h3>
          <p className="text-xs text-muted-foreground">
            Acesse funcionalidades mais usadas rapidamente.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[data-tour="search-bar"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            Busca Global
          </h3>
          <p className="text-xs text-muted-foreground">
            Encontre pacientes e procedimentos instantaneamente.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="theme-toggle"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            Temas e Acessibilidade
          </h3>
          <p className="text-xs text-muted-foreground">
            Personalize aparência, fonte e contraste.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="user-menu"]',
      content: (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            Menu do Usuário
          </h3>
          <p className="text-xs text-muted-foreground">
            Configurações de perfil e logout.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "body",
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Tour Completo! ✨
          </h2>
          <p className="text-sm text-muted-foreground">
            Você está pronto para usar o Ortho+! Explore todas as
            funcionalidades.
          </p>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              💙 <strong>TSI Telecom</strong>
            </p>
          </div>
        </div>
      ),
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    }
  };

  // Função para reiniciar o tour (pode ser chamada externamente)
  const restartTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setRun(true);
  };

  // Expor função globalmente para reiniciar tour
  useEffect(() => {
    (window as any).startOrthoTour = restartTour;
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--card-foreground))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
          arrowColor: "hsl(var(--card))",
          width: 320,
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "0.375rem",
          padding: "0.375rem 1rem",
          fontSize: "0.8125rem",
          fontWeight: "500",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: "0.5rem",
          fontSize: "0.8125rem",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "0.8125rem",
        },
        buttonClose: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "1.25rem",
          padding: "0.25rem",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        tooltip: {
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.8125rem",
          maxWidth: "320px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        tooltipContent: {
          padding: "0.25rem 0",
        },
        tooltipTitle: {
          fontSize: "0.9375rem",
          marginBottom: "0.5rem",
        },
        spotlight: {
          borderRadius: "0.5rem",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}
