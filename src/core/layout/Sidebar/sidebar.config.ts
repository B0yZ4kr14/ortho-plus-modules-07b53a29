/**
 * SIDEBAR CONFIGURATION V5.3 COHERENCE - Ortho+
 * Sincronização completa com module_catalog
 */

import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  Settings,
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Megaphone,
  BarChart3,
  Stethoscope,
  Scan,
  Brain,
  ClipboardPlus,
  Wallet,
  FileSpreadsheet,
  Target,
  Mail,
  AlertCircle,
  Lock,
  FileCheck,
  Video,
  Bitcoin,
  Wrench,
  Database,
  HardDrive,
  Terminal,
  Github,
  Gift,
  ClipboardCheck,
  UserCircle,
  FileSignature,
  type LucideIcon
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  moduleKey?: string;
  collapsed?: boolean;
  subItems?: MenuItem[];
  isSubItem?: boolean;
  badge?: {
    count: number | string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
}

export interface MenuGroup {
  label: string;
  boundedContext: string;
  category: string;
  collapsed?: boolean;
  items: MenuItem[];
}

/**
 * NAVEGAÇÃO V5.3: TODOS OS MÓDULOS COM moduleKey
 */
export const menuGroups: MenuGroup[] = [
  // ========= 1. DASHBOARD UNIFICADO =========
  {
    label: 'VISÃO GERAL',
    boundedContext: 'DASHBOARD',
    category: 'DASHBOARD',
    items: [
      { 
        title: 'Dashboard Executivo', 
        url: '/', 
        icon: LayoutDashboard,
        moduleKey: 'DASHBOARD',
        badge: { count: 0, variant: 'default' }
      }
    ]
  },

  // ========= 2. ATENDIMENTO CLÍNICO =========
  {
    label: 'ATENDIMENTO CLÍNICO',
    boundedContext: 'CLINICA',
    category: 'ATENDIMENTO CLÍNICO',
    collapsed: false,
    items: [
      { 
        title: 'Agenda', 
        url: '/agenda', 
        icon: Calendar, 
        moduleKey: 'AGENDA',
        badge: { count: 0, variant: 'default' }
      },
      { 
        title: 'Pacientes', 
        url: '/pacientes', 
        icon: Users, 
        moduleKey: 'PACIENTES'
      },
      { 
        title: 'Prontuário Eletrônico', 
        url: '/pep', 
        icon: FileText, 
        moduleKey: 'PEP'
      },
      { 
        title: 'Odontograma', 
        url: '/odontograma', 
        icon: Scan, 
        moduleKey: 'ODONTOGRAMA'
      },
      { 
        title: 'Planos de Tratamento', 
        url: '/tratamentos', 
        icon: ClipboardPlus, 
        moduleKey: 'PEP'
      },
      {
        title: 'Orçamentos',
        url: '/orcamentos',
        icon: FileText,
        moduleKey: 'ORCAMENTOS',
      },
      {
        title: 'Contratos Digitais',
        url: '/contratos',
        icon: FileSignature,
        moduleKey: 'CONTRATOS',
      },
      {
        title: 'Procedimentos',
        url: '/procedimentos',
        icon: Stethoscope,
        moduleKey: 'PROCEDIMENTOS',
      },
    ]
  },

  // ========= 3. GESTÃO FINANCEIRA =========
  {
    label: 'GESTÃO FINANCEIRA',
    boundedContext: 'FINANCEIRO',
    category: 'GESTÃO FINANCEIRA',
    collapsed: false,
    items: [
      { 
        title: 'Fluxo de Caixa', 
        url: '/financeiro', 
        icon: Wallet, 
        moduleKey: 'FINANCEIRO'
      },
      { 
        title: 'Contas a Receber', 
        url: '/financeiro/receber', 
        icon: TrendingUp, 
        moduleKey: 'FINANCEIRO',
        badge: { count: 0, variant: 'destructive' }
      },
      { 
        title: 'Inadimplência', 
        url: '/inadimplencia', 
        icon: AlertCircle, 
        moduleKey: 'INADIMPLENCIA',
        badge: { count: 0, variant: 'destructive' }
      },
      { 
        title: 'Pagamentos em Criptomoedas', 
        url: '/crypto-payment', 
        icon: Bitcoin, 
        moduleKey: 'CRYPTO_PAYMENTS'
      },
      { 
        title: 'PDV (Ponto de Venda)', 
        url: '/pdv', 
        icon: ShoppingCart, 
        moduleKey: 'PDV'
      },
      {
        title: 'Notas Fiscais (NFe/NFCe)',
        url: '/financeiro/fiscal/notas',
        icon: Receipt,
        moduleKey: 'FISCAL'
      },
      {
        title: 'Conciliação Bancária',
        url: '/financeiro/conciliacao',
        icon: FileCheck,
        moduleKey: 'FINANCEIRO'
      },
      {
        title: 'Split de Pagamentos',
        url: '/split-pagamento',
        icon: DollarSign,
        moduleKey: 'SPLIT_PAGAMENTO'
      }
    ]
  },

  // ========= 4. OPERAÇÕES =========
  {
    label: 'OPERAÇÕES',
    boundedContext: 'OPERACOES',
    category: 'OPERAÇÕES',
    collapsed: false,
    items: [
      { 
        title: 'Estoque', 
        url: '/estoque', 
        icon: Package, 
        moduleKey: 'ESTOQUE',
        subItems: [
          {
            title: 'Dashboard de Inventário',
            url: '/inventario/dashboard',
            icon: ClipboardCheck,
            moduleKey: 'INVENTARIO',
          },
          {
            title: 'Histórico de Inventários',
            url: '/estoque/inventario-historico',
            icon: ClipboardCheck,
            moduleKey: 'INVENTARIO',
          },
        ],
      },
      {
        title: 'Scanner Mobile',
        url: '/estoque/scanner',
        icon: Scan,
        moduleKey: 'ESTOQUE'
      }
    ]
  },

  // ========= 5. MARKETING & RELACIONAMENTO =========
  {
    label: 'MARKETING & RELACIONAMENTO',
    boundedContext: 'CRESCIMENTO',
    category: 'MARKETING & RELACIONAMENTO',
    collapsed: false,
    items: [
      { 
        title: 'CRM (Funil de Vendas)', 
        url: '/crm', 
        icon: Target, 
        moduleKey: 'CRM'
      },
      { 
        title: 'Programa de Fidelidade', 
        url: '/fidelidade', 
        icon: Gift, 
        moduleKey: 'FIDELIDADE'
      },
      { 
        title: 'Campanhas de Marketing', 
        url: '/marketing-auto', 
        icon: Megaphone, 
        moduleKey: 'MARKETING_AUTO'
      },
      { 
        title: 'Recall Automático', 
        url: '/recall', 
        icon: Mail, 
        moduleKey: 'MARKETING_AUTO',
        badge: { count: 0, variant: 'default' }
      },
      {
        title: 'Portal do Paciente',
        url: '/portal-paciente',
        icon: UserCircle,
        moduleKey: 'PORTAL_PACIENTE',
      },
    ]
  },

  // ========= 6. ANÁLISES & RELATÓRIOS =========
  {
    label: 'ANÁLISES & RELATÓRIOS',
    boundedContext: 'BI',
    category: 'ANÁLISES & RELATÓRIOS',
    collapsed: false,
    items: [
      { 
        title: 'Business Intelligence', 
        url: '/bi', 
        icon: BarChart3, 
        moduleKey: 'BI'
      },
      {
        title: 'Dashboard Comercial',
        url: '/dashboards/comercial',
        icon: TrendingUp,
        moduleKey: 'BI'
      }
    ]
  },

  // ========= 7. CONFORMIDADE & LEGAL =========
  {
    label: 'CONFORMIDADE & LEGAL',
    boundedContext: 'COMPLIANCE',
    category: 'CONFORMIDADE & LEGAL',
    collapsed: false,
    items: [
      {
        title: 'LGPD & Compliance',
        url: '/lgpd',
        icon: Lock,
        moduleKey: 'LGPD'
      },
      {
        title: 'Assinatura Digital (ICP)',
        url: '/assinatura-icp',
        icon: FileSignature,
        moduleKey: 'ASSINATURA_ICP'
      },
      {
        title: 'Faturamento TISS',
        url: '/faturamento-tiss',
        icon: FileText,
        moduleKey: 'TISS'
      },
      {
        title: 'Teleodontologia',
        url: '/teleodonto',
        icon: Video,
        moduleKey: 'TELEODONTO'
      }
    ]
  },

  // ========= 8. INOVAÇÃO & TECNOLOGIA =========
  {
    label: 'INOVAÇÃO & TECNOLOGIA',
    boundedContext: 'INOVACAO',
    category: 'INOVAÇÃO & TECNOLOGIA',
    collapsed: false,
    items: [
      {
        title: 'Diagnóstico com IA',
        url: '/ia-radiografia',
        icon: Brain,
        moduleKey: 'IA'
      },
      {
        title: 'Fluxo Digital (CAD/CAM)',
        url: '/fluxo-digital',
        icon: Scan,
        moduleKey: 'FLUXO_DIGITAL'
      }
    ]
  },

  // ========= 9. ADMINISTRAÇÃO & DEVOPS =========
  {
    label: 'ADMINISTRAÇÃO & DEVOPS',
    boundedContext: 'ADMIN',
    category: 'ADMINISTRAÇÃO & DEVOPS',
    collapsed: false,
    items: [
      {
        title: 'Administração de Banco',
        url: '/admin/database',
        icon: Database,
        moduleKey: 'DATABASE_ADMIN',
      },
      {
        title: 'Backups Avançados',
        url: '/admin/backups',
        icon: HardDrive,
        moduleKey: 'BACKUPS',
      },
      {
        title: 'Configuração Crypto',
        url: '/admin/crypto-config',
        icon: Bitcoin,
        moduleKey: 'CRYPTO_CONFIG',
      },
      {
        title: 'Ferramentas GitHub',
        url: '/admin/github',
        icon: Github,
        moduleKey: 'GITHUB_TOOLS',
      },
      {
        title: 'Terminal Web',
        url: '/admin/terminal',
        icon: Terminal,
        moduleKey: 'TERMINAL',
      }
    ]
  },

  // ========= 10. CONFIGURAÇÕES =========
  {
    label: 'CONFIGURAÇÕES',
    boundedContext: 'CONFIGURACOES',
    category: 'CONFIGURAÇÕES',
    collapsed: false,
    items: [
      {
        title: 'Meus Módulos',
        url: '/configuracoes/modulos',
        icon: Settings,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Dentistas',
        url: '/dentistas',
        icon: Stethoscope,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Funcionários',
        url: '/funcionarios',
        icon: Users,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Usuários',
        url: '/usuarios',
        icon: Users,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Configurações Gerais',
        url: '/configuracoes',
        icon: Settings,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Ajuda',
        url: '/help',
        icon: Mail,
        moduleKey: 'ADMIN_ONLY'
      }
    ]
  }
];

/**
 * MENU ADMINISTRATIVO (ADMIN_ONLY)
 */
export const adminMenuItems: MenuItem[] = [
  {
    title: 'Administração de Banco',
    url: '/admin/database',
    icon: Database,
    moduleKey: 'DATABASE_ADMIN',
  },
  {
    title: 'Backups Avançados',
    url: '/admin/backups',
    icon: HardDrive,
    moduleKey: 'BACKUPS',
  },
  {
    title: 'Configuração Crypto',
    url: '/admin/crypto-config',
    icon: Bitcoin,
    moduleKey: 'CRYPTO_CONFIG',
  },
  {
    title: 'Ferramentas GitHub',
    url: '/admin/github',
    icon: Github,
    moduleKey: 'GITHUB_TOOLS',
  },
  {
    title: 'Terminal Web',
    url: '/admin/terminal',
    icon: Terminal,
    moduleKey: 'TERMINAL',
  },
  {
    title: 'Wiki & Documentação',
    url: '/admin/wiki',
    icon: FileText,
    moduleKey: 'ADMIN_ONLY',
  },
  {
    title: 'ADRs (Architecture Decisions)',
    url: '/admin/adrs',
    icon: FileSignature,
    moduleKey: 'ADMIN_ONLY',
  },
  {
    title: 'Monitoramento',
    url: '/admin/monitoring',
    icon: BarChart3,
    moduleKey: 'ADMIN_ONLY',
  },
  {
    title: 'System Logs',
    url: '/admin/logs',
    icon: FileText,
    moduleKey: 'ADMIN_ONLY',
  },
  {
    title: 'API Docs',
    url: '/admin/api-docs',
    icon: FileText,
    moduleKey: 'ADMIN_ONLY',
  },
];
