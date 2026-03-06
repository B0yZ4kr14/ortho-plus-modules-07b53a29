import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Shield,
  Zap,
  Bot,
  Video,
  Bitcoin,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Demo() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: "Prontuário Eletrônico",
      description: "PEP completo com Odontograma 2D/3D e IA",
      badge: "IA",
    },
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description: "Cadastro completo e histórico longitudinal",
      badge: "Core",
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Automação WhatsApp e confirmações",
      badge: "Automação",
    },
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      description: "DRE, Fluxo de Caixa, Split, PIX",
      badge: "Premium",
    },
    {
      icon: Bot,
      title: "IA Radiografia",
      description: "Análise automática com Gemini Vision",
      badge: "IA",
    },
    {
      icon: Video,
      title: "Teleodontologia",
      description: "Videochamadas e prescrição remota",
      badge: "Telemedicina",
    },
    {
      icon: Bitcoin,
      title: "Pagamentos Crypto",
      description: "Bitcoin, integração exchanges",
      badge: "Inovação",
    },
    {
      icon: Shield,
      title: "LGPD Nativo",
      description: "Compliance total desde o design",
      badge: "Compliance",
    },
  ];

  const stats = [
    { value: "22", label: "Módulos Plug-and-Play" },
    { value: "100%", label: "Arquitetura Modular" },
    { value: "3", label: "Temas Premium" },
    { value: "∞", label: "Escalabilidade" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="text-lg px-6 py-2">
            SaaS B2B Multitenant
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Ortho<span className="text-primary">+</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Sistema de Gestão Odontológica Completo
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plataforma 100% modular com IA integrada, automação inteligente e
            compliance LGPD nativo. Transforme sua clínica odontológica com
            tecnologia de ponta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() =>
                window.open(
                  "https://github.com/tsitelecom/ortho-plus",
                  "_blank",
                )
              }
            >
              Ver no GitHub
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recursos Principais
          </h2>
          <p className="text-lg text-muted-foreground">
            22 módulos descentralizados prontos para ativar
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que Ortho+?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            "Arquitetura 100% Modular Plug-and-Play",
            "IA Integrada (Gemini Vision + ML)",
            "Automação Completa (Estoque → Cobranças)",
            "Multi-tenancy Robusto com RLS",
            "Design Premium (3 Temas + Animações)",
            "LGPD Native (Compliance desde o design)",
            "Tour Guiado (Onboarding interativo)",
            "Crypto Ready (Bitcoin nativo)",
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span className="text-lg">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stack Tecnológica
          </h2>
          <p className="text-lg text-muted-foreground">
            Construído com as melhores tecnologias
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {[
            "React 18",
            "TypeScript 5",
            "Vite",
            "Tailwind CSS",
            "Node.js",
            "PostgreSQL",
            "Express.js",
            "React Query",
            "Shadcn/ui",
            "Zod",
            "React Joyride",
            "Recharts",
          ].map((tech, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-4 py-2 text-base"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <Zap className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Transformar sua Clínica?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo, modular e escalável. Comece agora e ative apenas
            os módulos que você precisa.
          </p>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => navigate("/auth")}
          >
            Começar Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">
              Ortho<span className="text-primary">+</span>
            </h3>
            <p className="text-muted-foreground">
              Desenvolvido com 💙 e excelência pela <strong>TSI Telecom</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 TSI Telecom - Todos os direitos reservados
            </p>
            <div className="flex justify-center gap-6 pt-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Documentação
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
