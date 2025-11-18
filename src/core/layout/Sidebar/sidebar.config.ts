/**
 * SIDEBAR CONFIGURATION V5.0 - Ortho+ (OTIMIZADO)
 * Terminologia intuitiva para profissionais de odontologia
 */

import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  Settings,
  Video,
  UserCog,
  AlertCircle,
  Award,
  Building2,
  BookOpen,
  Database,
  HardDrive,
  Wrench,
  GitBranch,
  Code2,
  ScrollText,
  FileCode,
  BookText,
  Github,
  type LucideIcon,
  Sparkles,
  BriefcaseBusiness,
  Receipt,
  ShoppingCart,
  FileSpreadsheet,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Bell,
  BarChart3,
  TrendingDown,
  TrendingUp,
  PieChart,
  LineChart,
  Target,
  Megaphone,
  Mail,
  Lock,
  FileCheck,
  FileSignature,
  Eye,
  Workflow,
  Stethoscope,
  HeartPulse,
  Pill,
  Activity,
  ClipboardPlus,
  Wallet,
  ArrowLeftRight,
  Boxes,
  PackagePlus,
  Coins,
  BadgeCheck,
  Scan,
  Brain,
  ScanLine,
  Shield,
  DollarSign
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
  boundedContext: string; // DDD: Bounded Context identifier
  collapsed?: boolean;
  items: MenuItem[];
}

/**
 * NAVEGAÇÃO MODULAR POR BOUNDED CONTEXTS (DDD)
 */
export const menuGroups: MenuGroup[] = [
  // ========= DASHBOARD (Visão Geral) =========
  {
    label: 'VISÃO GERAL',
    boundedContext: 'CORE',
    items: [
      { 
        title: 'Dashboard Executivo', 
        url: '/', 
        icon: LayoutDashboard 
      }
    ]
  },

  // ========= BOUNDED CONTEXT: PACIENTES =========
  {
    label: 'PACIENTES',
    boundedContext: 'PACIENTES',
    collapsed: false,
    items: [
      { 
        title: 'Agenda', 
        url: '/agenda', 
        icon: Calendar, 
        moduleKey: 'AGENDA' 
      },
      { 
        title: 'Pacientes', 
        url: '/pacientes', 
        icon: Users, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Prontuário Eletrônico', 
        url: '/pep', 
        icon: FileText, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Odontograma Digital', 
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
        title: 'Diagnóstico Avançado',
        icon: Brain,
        moduleKey: 'IA',
        collapsed: true,
        subItems: [
          { title: 'IA para Diagnóstico', url: '/ia-radiografia', icon: Brain },
          { title: 'Fluxo Digital (CAD/CAM)', url: '/fluxo-digital', icon: Scan }
        ]
      }
    ]
  },

  // ========= BOUNDED CONTEXT: PEP (Prontuário Eletrônico) =========
  {
    label: 'PRONTUÁRIO ELETRÔNICO',
    boundedContext: 'PEP',
    collapsed: false,
    items: [
      { 
        title: 'Dentistas e Auxiliares',
        icon: Stethoscope,
        moduleKey: 'PEP',
        collapsed: true,
        subItems: [
          { title: 'Profissionais', url: '/dentistas', icon: Stethoscope },
          { title: 'Auxiliares', url: '/funcionarios', icon: UserCog }
        ]
      },
      { 
        title: 'Tabela de Procedimentos', 
        url: '/procedimentos', 
        icon: ClipboardList, 
        moduleKey: 'PEP' 
      }
    ]
  },

  // ========= BOUNDED CONTEXT: FINANCEIRO =========
  {
    label: 'FINANCEIRO',
    boundedContext: 'FINANCEIRO',
    collapsed: false,
    items: [
      { 
        title: 'Dashboard Financeiro',
        url: '/financeiro',
        icon: PieChart,
        moduleKey: 'FINANCEIRO'
      },
      { 
        title: 'Receitas e Despesas',
        icon: ArrowLeftRight,
        moduleKey: 'FINANCEIRO',
        collapsed: true,
        subItems: [
          { title: 'Contas a Receber', url: '/financeiro/contas-receber', icon: TrendingUp },
          { title: 'Contas a Pagar', url: '/financeiro/contas-pagar', icon: TrendingDown },
          { title: 'Transações', url: '/financeiro/transacoes', icon: Activity },
          { title: 'Conciliação', url: '/financeiro/conciliacao', icon: BadgeCheck }
        ]
      },
      { 
        title: 'Fluxo de Caixa', 
        url: '/fluxo-caixa', 
        icon: LineChart, 
        moduleKey: 'FINANCEIRO' 
      },
      { 
        title: 'Orçamentos', 
        url: '/orcamentos', 
        icon: FileSpreadsheet, 
        moduleKey: 'ORCAMENTOS' 
      },
      { 
        title: 'Contratos', 
        url: '/contratos', 
        icon: FileCheck, 
        moduleKey: 'ORCAMENTOS' 
      },
      { 
        title: 'PDV', 
        url: '/pdv', 
        icon: ShoppingCart, 
        moduleKey: 'FINANCEIRO' 
      },
      { 
        title: 'Notas Fiscais', 
        url: '/notas-fiscais', 
        icon: Receipt, 
        moduleKey: 'TISS' 
      },
      { 
        title: 'Pagamentos Avançados',
        icon: Wallet,
        moduleKey: 'SPLIT_PAGAMENTO',
        collapsed: true,
        subItems: [
          { title: 'Split de Pagamento', url: '/split-pagamento', icon: Coins },
          { title: 'Inadimplência', url: '/inadimplencia', icon: AlertCircle }
        ]
      }
    ]
  },

  // ========= BOUNDED CONTEXT: INVENTÁRIO =========
  {
    label: 'INVENTÁRIO',
    boundedContext: 'INVENTARIO',
    collapsed: false,
    items: [
      { 
        title: 'Controle de Estoque',
        icon: Boxes,
        moduleKey: 'ESTOQUE',
        collapsed: true,
        subItems: [
          { title: 'Dashboard', url: '/estoque/dashboard', icon: BarChart3 },
          { title: 'Produtos', url: '/estoque/cadastros', icon: PackagePlus },
          { title: 'Requisições', url: '/estoque/requisicoes', icon: Clipboard },
          { title: 'Inventário', url: '/estoque/inventario', icon: ClipboardCheck },
          { title: 'Scanner Mobile', url: '/estoque/scanner-mobile', icon: ScanLine }
        ]
      }
    ]
  },

  // ========= BOUNDED CONTEXT: MARKETING & CRM =========
  {
    label: 'MARKETING & CRM',
    boundedContext: 'MARKETING',
    collapsed: true,
    items: [
      {
        title: 'CRM e Relacionamento',
        icon: Users,
        moduleKey: 'CRM',
        collapsed: true,
        subItems: [
          { title: 'CRM Odontológico', url: '/crm', icon: Users },
          { title: 'Funil de Captação', url: '/crm/funil', icon: Target },
          { title: 'Programa de Fidelidade', url: '/programa-fidelidade', icon: Award }
        ]
      },
      {
        title: 'Marketing e Comunicação',
        icon: Megaphone,
        moduleKey: 'MARKETING_AUTO',
        collapsed: true,
        subItems: [
          { title: 'Campanhas de Marketing', url: '/marketing-auto', icon: Megaphone },
          { title: 'Automação de E-mails', url: '/email-marketing', icon: Mail }
        ]
      }
    ]
  },

  // ========= BOUNDED CONTEXT: BUSINESS INTELLIGENCE =========
  {
    label: 'BUSINESS INTELLIGENCE',
    boundedContext: 'BI',
    collapsed: true,
    items: [
      { 
        title: 'Business Intelligence', 
        url: '/bi', 
        icon: BarChart3, 
        moduleKey: 'BI' 
      },
      {
        title: 'Dashboards por Categoria',
        icon: LayoutDashboard,
        collapsed: true,
        subItems: [
          { title: 'Dashboard Clínico', url: '/dashboards/clinica', icon: Activity },
          { title: 'Dashboard Financeiro', url: '/dashboards/financeiro', icon: DollarSign },
          { title: 'Dashboard Comercial', url: '/dashboards/comercial', icon: Target }
        ]
      }
    ]
  },

  // ========= BOUNDED CONTEXT: COMPLIANCE =========
  {
    label: 'COMPLIANCE & REGULAMENTAÇÃO',
    boundedContext: 'COMPLIANCE',
    collapsed: true,
    items: [
      { 
        title: 'LGPD e Privacidade', 
        url: '/lgpd', 
        icon: Lock, 
        moduleKey: 'LGPD' 
      },
      { 
        title: 'Assinatura Digital ICP', 
        url: '/assinatura-digital', 
        icon: FileSignature, 
        moduleKey: 'ASSINATURA_ICP' 
      },
      { 
        title: 'Faturamento TISS', 
        url: '/tiss', 
        icon: FileText, 
        moduleKey: 'TISS' 
      },
      { 
        title: 'Auditoria e Logs', 
        url: '/auditoria', 
        icon: Eye, 
        moduleKey: 'LGPD' 
      },
      { 
        title: 'Teleodontologia', 
        url: '/teleodonto', 
        icon: Video, 
        moduleKey: 'TELEODONTO' 
      }
    ]
  },

  // ========= SUPORTE =========
  {
    label: 'SUPORTE',
    boundedContext: 'SUPPORT',
    items: [
      { 
        title: 'Central de Ajuda', 
        url: '/ajuda', 
        icon: BookOpen 
      }
    ]
  }
];

/**
 * MENU ADMINISTRAÇÃO (ADMIN ONLY) - OTIMIZADO
 */
export const adminMenuItems: MenuItem[] = [
  {
    title: "Clínicas",
    url: "/clinicas",
    icon: Building2,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Módulos",
    url: "/configuracoes/modulos",
    icon: Package,
  },
  {
    title: "Infraestrutura",
    icon: Wrench,
    collapsed: false,
    subItems: [
      { title: "GitHub", url: "/admin/github", icon: Github },
      { title: "Autenticação", url: "/admin/authentication", icon: Shield },
      { title: "Modelos de IA", url: "/admin/ai-models", icon: Brain },
      { title: "Pagamentos Digitais", url: "/configuracoes/crypto", icon: Wallet }
    ]
  },
  {
    title: "Dados & Backups",
    icon: Database,
    collapsed: false,
    subItems: [
      { title: "Backups", url: "/admin/backups", icon: HardDrive },
      { title: "Manutenção DB", url: "/admin/database-maintenance", icon: Wrench },
      { title: "Migrations", url: "/admin/migrations", icon: GitBranch },
      { title: "SQL Query", url: "/admin/sql-query", icon: Code2 }
    ]
  },
  {
    title: "Documentação",
    icon: BookText,
    collapsed: false,
    subItems: [
      { title: "Decisões (ADR)", url: "/admin/adrs", icon: ScrollText },
      { title: "Código Fonte", url: "/admin/codebase", icon: FileCode }
    ]
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  }
];
