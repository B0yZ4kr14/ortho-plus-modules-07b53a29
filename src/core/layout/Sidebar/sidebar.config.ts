import { 
  LayoutDashboard, Users, UserPlus, Calendar, Stethoscope, FileText, 
  DollarSign, Settings, TrendingUp, ClipboardList, Shield, Activity, 
  Package, CreditCard, BarChart3, FileBarChart, Bitcoin, FolderOpen, 
  ShoppingCart, Webhook, LineChart, FileSignature, User, Video, Scan, 
  UserCog, Award, Smartphone, ClipboardCheck, BookOpen, LucideIcon 
} from 'lucide-react';

export interface MenuSubItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  moduleKey?: string; // Module key for access control
  collapsed?: boolean;
  subItems?: MenuSubItem[];
}

export interface MenuGroup {
  label: string;
  collapsed?: boolean;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard } // Dashboard sempre visível
    ]
  },
  {
    label: 'Cadastros',
    items: [
      { title: 'Pacientes', url: '/pacientes', icon: Users, moduleKey: 'PEP' },
      { title: 'Dentistas', url: '/dentistas', icon: UserPlus, moduleKey: 'PEP' },
      { title: 'Funcionários', url: '/funcionarios', icon: Users, moduleKey: 'PEP' },
      { title: 'Procedimentos', url: '/procedimentos', icon: Stethoscope, moduleKey: 'PEP' }
    ]
  },
  {
    label: 'Clínica',
    items: [
      { title: 'Agenda', url: '/agenda-clinica', icon: Calendar, moduleKey: 'AGENDA' },
      { title: 'PEP', url: '/pep', icon: FileText, moduleKey: 'PEP' },
      { title: 'Orçamentos', url: '/orcamentos', icon: FileText, moduleKey: 'ORCAMENTOS' },
      { title: 'Contratos', url: '/contratos', icon: FileSignature, moduleKey: 'ORCAMENTOS' },
      {
        title: 'Teleodontologia',
        icon: Video,
        moduleKey: 'TELEODONTO',
        collapsed: true,
        subItems: [
          { title: 'Consultas', url: '/teleodontologia', icon: Video },
          { title: 'Histórico', url: '/historico-teleconsultas', icon: FileText }
        ]
      },
      { title: 'IA Raio-X', url: '/ia-radiografia', icon: Scan, moduleKey: 'IA' }
    ]
  },
  {
    label: 'Estoque',
    collapsed: true,
    items: [
      { title: 'Dashboard', url: '/estoque', icon: BarChart3, moduleKey: 'ESTOQUE' },
      { title: 'Cadastros', url: '/estoque/cadastros', icon: FolderOpen, moduleKey: 'ESTOQUE' },
      { title: 'Requisições', url: '/estoque/requisicoes', icon: ClipboardList, moduleKey: 'ESTOQUE' },
      { title: 'Movimentações', url: '/estoque/movimentacoes', icon: Package, moduleKey: 'ESTOQUE' },
      { title: 'Pedidos', url: '/estoque/pedidos', icon: ShoppingCart, moduleKey: 'ESTOQUE' },
      { title: 'Integrações API', url: '/estoque/integracoes', icon: Webhook, moduleKey: 'ESTOQUE' },
      { title: 'Análise de Pedidos', url: '/estoque/analise-pedidos', icon: LineChart, moduleKey: 'ESTOQUE' },
      { title: 'Análise de Consumo', url: '/estoque/analise-consumo', icon: BarChart3, moduleKey: 'ESTOQUE' },
      {
        title: 'Inventário',
        icon: ClipboardCheck,
        moduleKey: 'ESTOQUE',
        collapsed: true,
        subItems: [
          { title: 'Gestão', url: '/estoque/inventario', icon: ClipboardCheck },
          { title: 'Dashboard Executivo', url: '/estoque/inventario/dashboard', icon: BarChart3 },
          { title: 'Histórico', url: '/estoque/inventario/historico', icon: TrendingUp }
        ]
      },
      { title: 'Scanner Mobile', url: '/estoque/scanner-mobile', icon: Smartphone, moduleKey: 'ESTOQUE' }
    ]
  },
  {
    label: 'Financeiro',
    collapsed: true,
    items: [
      { title: 'Dashboard', url: '/financeiro', icon: DollarSign, moduleKey: 'FINANCEIRO' },
      { title: 'Fluxo de Caixa', url: '/fluxo-caixa', icon: TrendingUp, moduleKey: 'FINANCEIRO' },
      { title: 'Contas a Pagar', url: '/contas-pagar', icon: FileText, moduleKey: 'FINANCEIRO' },
      { title: 'Contas a Receber', url: '/contas-receber', icon: FileBarChart, moduleKey: 'FINANCEIRO' },
      { title: 'PDV', url: '/pdv', icon: ShoppingCart, moduleKey: 'FINANCEIRO' },
      { title: 'Split de Pagamento', url: '/split-pagamento', icon: CreditCard, moduleKey: 'SPLIT_PAGAMENTO' },
      { title: 'Inadimplência', url: '/inadimplencia', icon: Shield, moduleKey: 'INADIMPLENCIA' }
    ]
  },
  {
    label: 'Marketing & CRM',
    collapsed: true,
    items: [
      { title: 'CRM', url: '/crm', icon: Users, moduleKey: 'CRM' },
      { title: 'Automação', url: '/automacao-marketing', icon: Activity, moduleKey: 'MARKETING_AUTO' },
      { title: 'Fidelidade', url: '/programa-fidelidade', icon: Award, moduleKey: 'CRM' }
    ]
  },
  {
    label: 'Relatórios',
    collapsed: true,
    items: [
      { title: 'Business Intelligence', url: '/bi', icon: BarChart3, moduleKey: 'BI' }
    ]
  },
  {
    label: 'Compliance',
    collapsed: true,
    items: [
      { title: 'LGPD', url: '/lgpd', icon: Shield, moduleKey: 'LGPD' },
      { title: 'TISS', url: '/tiss', icon: FileText, moduleKey: 'TISS' }
    ]
  },
  {
    label: 'Inovação',
    collapsed: true,
    items: [
      { title: 'Fluxo Digital', url: '/fluxo-digital', icon: Scan, moduleKey: 'FLUXO_DIGITAL' },
      { title: 'Criptomoedas', url: '/crypto', icon: Bitcoin, moduleKey: 'FINANCEIRO' }
    ]
  },
  {
    label: 'Suporte',
    items: [
      { title: 'Central de Ajuda', url: '/ajuda', icon: BookOpen } // Sempre visível
    ]
  }
];

export const adminMenuItems: MenuItem[] = [
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
  { title: 'Usuários', url: '/usuarios', icon: UserCog },
  { title: 'Meus Módulos', url: '/configuracoes/modulos', icon: Package }
];
