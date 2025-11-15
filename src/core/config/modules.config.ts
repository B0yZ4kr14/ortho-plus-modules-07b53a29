/**
 * Módulos Configuration - Central Source of Truth
 * Consolidates all module-related logic and constants
 */

export interface ModuleConfig {
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dependencies?: string[];
}

export const MODULES_CONFIG: Record<string, ModuleConfig> = {
  // ========== ATENDIMENTO CLÍNICO ==========
  DASHBOARD: {
    key: 'DASHBOARD',
    name: 'Dashboard',
    description: 'Visão geral do sistema',
    category: 'Atendimento Clínico',
    icon: 'LayoutDashboard',
  },
  AGENDA: {
    key: 'AGENDA',
    name: 'Agenda Inteligente',
    description: 'Gestão de consultas e automação via WhatsApp',
    category: 'Atendimento Clínico',
    icon: 'CalendarDays',
  },
  PACIENTES: {
    key: 'PACIENTES',
    name: 'Pacientes',
    description: 'Cadastro e gestão de pacientes',
    category: 'Atendimento Clínico',
    icon: 'Users',
  },
  PEP: {
    key: 'PEP',
    name: 'Prontuário Eletrônico (PEP)',
    description: 'Prontuário digital completo',
    category: 'Atendimento Clínico',
    icon: 'FileHeart',
  },
  ODONTOGRAMA: {
    key: 'ODONTOGRAMA',
    name: 'Odontograma',
    description: 'Mapa dental 2D e 3D',
    category: 'Atendimento Clínico',
    icon: 'Microscope',
  },
  ESTOQUE: {
    key: 'ESTOQUE',
    name: 'Controle de Estoque',
    description: 'Gestão de materiais e insumos',
    category: 'Atendimento Clínico',
    icon: 'Package',
  },
  PROCEDIMENTOS: {
    key: 'PROCEDIMENTOS',
    name: 'Procedimentos',
    description: 'Catálogo de procedimentos odontológicos',
    category: 'Atendimento Clínico',
    icon: 'Clipboard',
  },
  TELEODONTO: {
    key: 'TELEODONTO',
    name: 'Teleodontologia',
    description: 'Atendimento remoto',
    category: 'Conformidade & Legal',
    icon: 'Video',
  },

  // ========== GESTÃO FINANCEIRA ==========
  FINANCEIRO: {
    key: 'FINANCEIRO',
    name: 'Gestão Financeira',
    description: 'Fluxo de caixa e controles financeiros',
    category: 'Gestão Financeira',
    icon: 'BarChart3',
  },
  SPLIT_PAGAMENTO: {
    key: 'SPLIT_PAGAMENTO',
    name: 'Split de Pagamento',
    description: 'Divisão automática de pagamentos',
    category: 'Gestão Financeira',
    icon: 'Split',
    dependencies: ['FINANCEIRO'],
  },
  INADIMPLENCIA: {
    key: 'INADIMPLENCIA',
    name: 'Controle de Inadimplência',
    description: 'Cobrança automatizada',
    category: 'Gestão Financeira',
    icon: 'AlertTriangle',
    dependencies: ['FINANCEIRO'],
  },
  ORCAMENTOS: {
    key: 'ORCAMENTOS',
    name: 'Orçamentos',
    description: 'Criação e gestão de orçamentos',
    category: 'Atendimento Clínico',
    icon: 'FileText',
    dependencies: ['ODONTOGRAMA'],
  },

  // ========== RELACIONAMENTO & VENDAS ==========
  CRM: {
    key: 'CRM',
    name: 'CRM',
    description: 'Gestão de relacionamento com pacientes',
    category: 'Relacionamento & Vendas',
    icon: 'Target',
  },
  MARKETING_AUTO: {
    key: 'MARKETING_AUTO',
    name: 'Automação de Marketing',
    description: 'Campanhas automatizadas',
    category: 'Relacionamento & Vendas',
    icon: 'Send',
  },
  BI: {
    key: 'BI',
    name: 'Business Intelligence',
    description: 'Dashboards e relatórios avançados',
    category: 'Relacionamento & Vendas',
    icon: 'PieChart',
  },

  // ========== CONFORMIDADE & LEGAL ==========
  LGPD: {
    key: 'LGPD',
    name: 'Segurança e Conformidade LGPD',
    description: 'Gestão de privacidade e dados',
    category: 'Conformidade & Legal',
    icon: 'ShieldCheck',
  },
  ASSINATURA_ICP: {
    key: 'ASSINATURA_ICP',
    name: 'Assinatura Digital',
    description: 'Assinatura qualificada ICP-Brasil',
    category: 'Conformidade & Legal',
    icon: 'FileSignature',
    dependencies: ['PEP'],
  },
  TISS: {
    key: 'TISS',
    name: 'Faturamento TISS',
    description: 'Padrão TISS para convênios',
    category: 'Conformidade & Legal',
    icon: 'FileSpreadsheet',
    dependencies: ['PEP'],
  },

  // ========== TECNOLOGIAS AVANÇADAS ==========
  FLUXO_DIGITAL: {
    key: 'FLUXO_DIGITAL',
    name: 'Fluxo Digital',
    description: 'Integração com scanners e laboratórios',
    category: 'Tecnologias Avançadas',
    icon: 'Workflow',
    dependencies: ['PEP'],
  },
  IA: {
    key: 'IA',
    name: 'Inteligência Artificial',
    description: 'IA aplicada à odontologia',
    category: 'Tecnologias Avançadas',
    icon: 'BrainCircuit',
    dependencies: ['PEP', 'FLUXO_DIGITAL'],
  },
};

export const MODULE_CATEGORIES = [
  'Atendimento Clínico',
  'Gestão Financeira',
  'Relacionamento & Vendas',
  'Conformidade & Legal',
  'Tecnologias Avançadas',
] as const;

export type ModuleCategory = typeof MODULE_CATEGORIES[number];

export function getModulesByCategory(category: ModuleCategory): ModuleConfig[] {
  return Object.values(MODULES_CONFIG).filter(m => m.category === category);
}

export function getModuleDependencies(moduleKey: string): string[] {
  return MODULES_CONFIG[moduleKey]?.dependencies || [];
}

export function hasAllDependencies(
  moduleKey: string, 
  activeModules: string[]
): boolean {
  const dependencies = getModuleDependencies(moduleKey);
  return dependencies.every(dep => activeModules.includes(dep));
}
