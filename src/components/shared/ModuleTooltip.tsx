import { HelpCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

/**
 * FASE 0 - T0.4: MODULE TOOLTIP
 * Tooltip informativo que mostra detalhes de um módulo ao passar o mouse
 * Usado na Sidebar e em cards de módulos
 */

interface ModuleTooltipProps {
  moduleKey: string;
  children?: React.ReactNode;
  variant?: 'icon' | 'inline';
}

interface ModuleInfo {
  name: string;
  category: string;
  description: string;
  dependencies?: string[];
  benefits: string[];
}

const MODULE_DATA: Record<string, ModuleInfo> = {
  PEP: {
    name: 'Prontuário Eletrônico do Paciente',
    category: 'Atendimento Clínico',
    description: 'Sistema completo de gestão de prontuários digitais com histórico clínico, anamnese, evoluções e anexos.',
    dependencies: [],
    benefits: [
      'Acesso rápido ao histórico do paciente',
      'Conformidade com CFO e LGPD',
      'Backup automático na nuvem',
      'Integração com outros módulos'
    ]
  },
  AGENDA: {
    name: 'Agenda Inteligente',
    category: 'Atendimento Clínico',
    description: 'Agenda visual com confirmação automática via WhatsApp, lembretes e otimização de horários.',
    dependencies: [],
    benefits: [
      'Redução de faltas em até 40%',
      'Confirmação automática por WhatsApp',
      'Lembretes personalizados',
      'Otimização de agenda'
    ]
  },
  FINANCEIRO: {
    name: 'Gestão Financeira',
    category: 'Gestão Financeira',
    description: 'Controle completo de fluxo de caixa, contas a pagar e receber, DRE e relatórios financeiros.',
    dependencies: [],
    benefits: [
      'Visão 360° das finanças da clínica',
      'Previsão de fluxo de caixa',
      'Relatórios gerenciais automatizados',
      'Integração com pagamentos (PIX, Cartão, Crypto)'
    ]
  },
  CRYPTO: {
    name: 'Pagamentos em Criptomoedas',
    category: 'Gestão Financeira',
    description: 'Aceite Bitcoin, USDT e outras criptomoedas. Conversão automática para BRL e integração com exchanges.',
    dependencies: ['FINANCEIRO'],
    benefits: [
      'Taxas reduzidas (0.1%-2%)',
      'Pagamentos globais sem fronteiras',
      'Proteção contra inflação',
      'Resistência à censura governamental'
    ]
  },
  SPLIT_PAGAMENTO: {
    name: 'Split de Pagamento',
    category: 'Gestão Financeira',
    description: 'Divisão automática de pagamentos entre dentistas e clínica com otimização tributária.',
    dependencies: ['FINANCEIRO'],
    benefits: [
      'Otimização tributária automática',
      'Divisão transparente de receitas',
      'Redução de carga tributária',
      'Relatórios individuais por profissional'
    ]
  },
  INADIMPLENCIA: {
    name: 'Controle de Inadimplência',
    category: 'Gestão Financeira',
    description: 'Cobrança automatizada via WhatsApp e e-mail com escalonamento inteligente.',
    dependencies: ['FINANCEIRO'],
    benefits: [
      'Redução de inadimplência em até 60%',
      'Cobrança automatizada e humanizada',
      'Escalonamento inteligente',
      'Negociação facilitada'
    ]
  },
  ORCAMENTOS: {
    name: 'Orçamentos e Contratos',
    category: 'Atendimento Clínico',
    description: 'Criação de orçamentos profissionais, contratos digitais e assinatura eletrônica.',
    dependencies: ['ODONTOGRAMA'],
    benefits: [
      'Orçamentos profissionais em minutos',
      'Contratos digitais com validade jurídica',
      'Assinatura eletrônica integrada',
      'Histórico completo de versões'
    ]
  },
  ODONTOGRAMA: {
    name: 'Odontograma 2D e 3D',
    category: 'Atendimento Clínico',
    description: 'Odontograma interativo 2D e visualização 3D com marcação de procedimentos realizados e planejados.',
    dependencies: [],
    benefits: [
      'Visualização clara da situação bucal',
      'Planejamento de tratamentos',
      'Histórico visual de procedimentos',
      'Comunicação facilitada com paciente'
    ]
  },
  ESTOQUE: {
    name: 'Controle de Estoque Avançado',
    category: 'Atendimento Clínico',
    description: 'Gestão completa de estoque com scanner mobile, pedidos automáticos e análise de consumo.',
    dependencies: [],
    benefits: [
      'Zero ruptura de estoque',
      'Pedidos automáticos inteligentes',
      'Scanner mobile para conferência',
      'Redução de custos com estoque'
    ]
  },
  CRM: {
    name: 'CRM - Funil de Vendas',
    category: 'Relacionamento & Vendas',
    description: 'Gestão de leads e oportunidades com funil visual e automação de follow-up.',
    dependencies: [],
    benefits: [
      'Aumento de conversão de leads',
      'Funil visual (Kanban)',
      'Automação de follow-up',
      'Rastreamento de origem de leads'
    ]
  },
  MARKETING_AUTO: {
    name: 'Automação de Marketing',
    category: 'Relacionamento & Vendas',
    description: 'Campanhas automatizadas de recall, pós-consulta, aniversário e segmentação de pacientes.',
    dependencies: [],
    benefits: [
      'Aumento de retenção de pacientes',
      'Recall automático de consultas',
      'Segmentação inteligente',
      'ROI mensurável'
    ]
  },
  BI: {
    name: 'Business Intelligence',
    category: 'Relacionamento & Vendas',
    description: 'Dashboards personalizados, relatórios automatizados e análise de indicadores-chave.',
    dependencies: [],
    benefits: [
      'Dashboards personalizados',
      'KPIs em tempo real',
      'Relatórios automatizados',
      'Tomada de decisão baseada em dados'
    ]
  },
  LGPD: {
    name: 'Segurança e Conformidade LGPD',
    category: 'Conformidade & Legal',
    description: 'Gestão de consentimentos, solicitações de dados, logs de auditoria e conformidade com LGPD.',
    dependencies: [],
    benefits: [
      'Conformidade total com LGPD',
      'Gestão de consentimentos',
      'Exportação de dados do titular',
      'Auditoria completa de acessos'
    ]
  },
  ASSINATURA_ICP: {
    name: 'Assinatura Digital Qualificada',
    category: 'Conformidade & Legal',
    description: 'Assinatura digital com certificado ICP-Brasil (validade jurídica plena).',
    dependencies: ['PEP'],
    benefits: [
      'Validade jurídica plena',
      'Certificado ICP-Brasil',
      'Blockchain para imutabilidade',
      'Conformidade com CFO'
    ]
  },
  TISS: {
    name: 'Faturamento de Convênios',
    category: 'Conformidade & Legal',
    description: 'Geração de guias TISS (XML), envio para operadoras e rastreamento de reembolsos.',
    dependencies: ['PEP'],
    benefits: [
      'Faturamento automatizado',
      'Redução de glosas em até 70%',
      'Rastreamento de reembolsos',
      'Conformidade com padrão TISS'
    ]
  },
  TELEODONTO: {
    name: 'Teleodontologia',
    category: 'Conformidade & Legal',
    description: 'Teleconsultas com vídeo, gravação automática e conformidade com CFO.',
    dependencies: [],
    benefits: [
      'Atendimento remoto seguro',
      'Gravação automática (conformidade CFO)',
      'Prontuário integrado',
      'Receituário digital'
    ]
  },
  FLUXO_DIGITAL: {
    name: 'Integração Fluxo Digital',
    category: 'Tecnologias Avançadas',
    description: 'Integração com scanners intraorais e envio automático para laboratórios CAD/CAM.',
    dependencies: ['PEP'],
    benefits: [
      'Integração com scanners',
      'Envio automático para labs',
      'Rastreamento de pedidos',
      'Galeria de casos clínicos'
    ]
  },
  IA: {
    name: 'Inteligência Artificial',
    category: 'Tecnologias Avançadas',
    description: 'Análise automática de raio-X, detecção de problemas e sugestões de diagnóstico.',
    dependencies: ['PEP', 'FLUXO_DIGITAL'],
    benefits: [
      'Detecção precoce de problemas',
      'Segunda opinião automatizada',
      'Aumento de precisão diagnóstica',
      'Redução de erros humanos'
    ]
  },
};

export function ModuleTooltip({ moduleKey, children, variant = 'icon' }: ModuleTooltipProps) {
  const data = MODULE_DATA[moduleKey];
  
  if (!data) {
    return children || <Info className="h-4 w-4" />;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {variant === 'icon' ? (
            <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            children
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md p-4" sideOffset={8}>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-base">{data.name}</h4>
              <Badge variant="outline" className="mt-1 text-xs">{data.category}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            
            {data.dependencies && data.dependencies.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5 text-foreground/80">Depende de:</p>
                <div className="flex flex-wrap gap-1">
                  {data.dependencies.map(dep => (
                    <Badge key={dep} variant="secondary" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-xs font-medium mb-2 text-foreground/80">Benefícios:</p>
              <ul className="text-xs space-y-1.5">
                {data.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
