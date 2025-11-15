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
  // ========== GESTÃO E OPERAÇÃO ==========
  DASHBOARD: {
    key: 'DASHBOARD',
    name: 'Dashboard',
    description: 'Visão geral do sistema',
    category: 'Gestão e Operação',
    icon: 'LayoutDashboard',
  },
  AGENDA: {
    key: 'AGENDA',
    name: 'Agenda Inteligente',
    description: 'Gestão de consultas e automação via WhatsApp',
    category: 'Gestão e Operação',
    icon: 'CalendarDays',
  },
  PACIENTES: {
    key: 'PACIENTES',
    name: 'Pacientes',
    description: 'Cadastro e gestão de pacientes',
    category: 'Gestão e Operação',
    icon: 'Users',
  },
  PEP: {
    key: 'PEP',
    name: 'Prontuário Eletrônico (PEP)',
    description: 'Prontuário digital completo',
    category: 'Gestão e Operação',
    icon: 'FileHeart',
  },
  ODONTOGRAMA: {
    key: 'ODONTOGRAMA',
    name: 'Odontograma',
    description: 'Mapa dental 2D e 3D',
    category: 'Gestão e Operação',
    icon: 'Microscope',
  },
  ESTOQUE: {
    key: 'ESTOQUE',
    name: 'Controle de Estoque',
    description: 'Gestão de materiais e insumos',
    category: 'Gestão e Operação',
    icon: 'Package',
  },
  PROCEDIMENTOS: {
    key: 'PROCEDIMENTOS',
    name: 'Procedimentos',
    description: 'Catálogo de procedimentos odontológicos',
    category: 'Gestão e Operação',
    icon: 'Clipboard',
  },
  TELEODONTO: {
    key: 'TELEODONTO',
    name: 'Teleodontologia',
    description: 'Atendimento remoto',
    category: 'Gestão e Operação',
    icon: 'Video',
  },

  // ========== FINANCEIRO ==========
  FINANCEIRO: {
    key: 'FINANCEIRO',
    name: 'Gestão Financeira',
    description: 'Fluxo de caixa e controles financeiros',
    category: 'Financeiro',
    icon: 'BarChart3',
  },
  SPLIT_PAGAMENTO: {
    key: 'SPLIT_PAGAMENTO',
    name: 'Split de Pagamento',
    description: 'Divisão automática de pagamentos',
    category: 'Financeiro',
    icon: 'Split',
    dependencies: ['FINANCEIRO'],
  },
  INADIMPLENCIA: {
    key: 'INADIMPLENCIA',
    name: 'Controle de Inadimplência',
    description: 'Cobrança automatizada',
    category: 'Financeiro',
    icon: 'AlertTriangle',
    dependencies: ['FINANCEIRO'],
  },
  ORCAMENTOS: {
    key: 'ORCAMENTOS',
    name: 'Orçamentos',
    description: 'Criação e gestão de orçamentos',
    category: 'Financeiro',
    icon: 'FileText',
    dependencies: ['ODONTOGRAMA'],
  },

  // ========== CRESCIMENTO E MARKETING ==========
  CRM: {
    key: 'CRM',
    name: 'CRM',
    description: 'Gestão de relacionamento com pacientes',
    category: 'Crescimento e Marketing',
    icon: 'Target',
  },
  MARKETING_AUTO: {
    key: 'MARKETING_AUTO',
    name: 'Automação de Marketing',
    description: 'Campanhas automatizadas',
    category: 'Crescimento e Marketing',
    icon: 'Send',
  },
  BI: {
    key: 'BI',
    name: 'Business Intelligence',
    description: 'Dashboards e relatórios avançados',
    category: 'Crescimento e Marketing',
    icon: 'PieChart',
  },

  // ========== COMPLIANCE ==========
  LGPD: {
    key: 'LGPD',
    name: 'Segurança e Conformidade LGPD',
    description: 'Gestão de privacidade e dados',
    category: 'Compliance',
    icon: 'ShieldCheck',
  },
  ASSINATURA_ICP: {
    key: 'ASSINATURA_ICP',
    name: 'Assinatura Digital',
    description: 'Assinatura qualificada ICP-Brasil',
    category: 'Compliance',
    icon: 'FileSignature',
    dependencies: ['PEP'],
  },
  TISS: {
    key: 'TISS',
    name: 'Faturamento TISS',
    description: 'Padrão TISS para convênios',
    category: 'Compliance',
    icon: 'FileSpreadsheet',
    dependencies: ['PEP'],
  },

  // ========== INOVAÇÃO ==========
  FLUXO_DIGITAL: {
    key: 'FLUXO_DIGITAL',
    name: 'Fluxo Digital',
    description: 'Integração com scanners e laboratórios',
    category: 'Inovação',
    icon: 'Workflow',
    dependencies: ['PEP'],
  },
  IA: {
    key: 'IA',
    name: 'Inteligência Artificial',
    description: 'IA aplicada à odontologia',
    category: 'Inovação',
    icon: 'BrainCircuit',
    dependencies: ['PEP', 'FLUXO_DIGITAL'],
  },
};

export const MODULE_CATEGORIES = [
  'Gestão e Operação',
  'Financeiro',
  'Crescimento e Marketing',
  'Compliance',
  'Inovação',
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
