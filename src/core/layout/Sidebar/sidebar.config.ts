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
      { title: 'Dashboard', url: '/', icon: LayoutDashboard }
    ]
  },
  {
    label: 'Cadastros',
    items: [
      { title: 'Pacientes', url: '/pacientes', icon: Users },
      { title: 'Dentistas', url: '/dentistas', icon: UserPlus },
      { title: 'Funcionários', url: '/funcionarios', icon: Users },
      { title: 'Procedimentos', url: '/procedimentos', icon: Stethoscope }
    ]
  },
  {
    label: 'Clínica',
    items: [
      { title: 'Agenda', url: '/agenda-clinica', icon: Calendar },
      { title: 'PEP', url: '/pep', icon: FileText },
      { title: 'Orçamentos', url: '/orcamentos', icon: FileText },
      { title: 'Contratos', url: '/contratos', icon: FileSignature },
      {
        title: 'Teleodontologia',
        icon: Video,
        collapsed: true,
        subItems: [
          { title: 'Consultas', url: '/teleodontologia', icon: Video },
          { title: 'Histórico', url: '/historico-teleconsultas', icon: FileText }
        ]
      },
      { title: 'IA Raio-X', url: '/ia-radiografia', icon: Scan }
    ]
  },
  {
    label: 'Estoque',
    collapsed: true,
    items: [
      { title: 'Dashboard', url: '/estoque', icon: BarChart3 },
      { title: 'Cadastros', url: '/estoque/cadastros', icon: FolderOpen },
      { title: 'Requisições', url: '/estoque/requisicoes', icon: ClipboardList },
      { title: 'Movimentações', url: '/estoque/movimentacoes', icon: Package },
      { title: 'Pedidos', url: '/estoque/pedidos', icon: ShoppingCart },
      { title: 'Integrações API', url: '/estoque/integracoes', icon: Webhook },
      { title: 'Análise de Pedidos', url: '/estoque/analise-pedidos', icon: LineChart },
      { title: 'Análise de Consumo', url: '/estoque/analise-consumo', icon: BarChart3 },
      {
        title: 'Inventário',
        icon: ClipboardCheck,
        collapsed: true,
        subItems: [
          { title: 'Gestão', url: '/estoque/inventario', icon: ClipboardCheck },
          { title: 'Dashboard Executivo', url: '/estoque/inventario/dashboard', icon: BarChart3 },
          { title: 'Histórico', url: '/estoque/inventario/historico', icon: TrendingUp }
        ]
      },
      { title: 'Scanner Mobile', url: '/estoque/scanner-mobile', icon: Smartphone }
    ]
  },
  {
    label: 'Financeiro',
    collapsed: true,
    items: [
      { title: 'Dashboard', url: '/financeiro', icon: DollarSign },
      { title: 'Fluxo de Caixa', url: '/fluxo-caixa', icon: TrendingUp },
      { title: 'Contas a Pagar', url: '/contas-pagar', icon: FileText },
      { title: 'Contas a Receber', url: '/contas-receber', icon: FileBarChart },
      { title: 'PDV', url: '/pdv', icon: ShoppingCart },
      { title: 'Split de Pagamento', url: '/split-pagamento', icon: CreditCard },
      { title: 'Inadimplência', url: '/inadimplencia', icon: Shield }
    ]
  },
  {
    label: 'Marketing & CRM',
    collapsed: true,
    items: [
      { title: 'CRM', url: '/crm', icon: Users },
      { title: 'Automação', url: '/automacao-marketing', icon: Activity },
      { title: 'Fidelidade', url: '/programa-fidelidade', icon: Award }
    ]
  },
  {
    label: 'Relatórios',
    collapsed: true,
    items: [
      { title: 'Business Intelligence', url: '/bi', icon: BarChart3 }
    ]
  },
  {
    label: 'Compliance',
    collapsed: true,
    items: [
      { title: 'LGPD', url: '/lgpd', icon: Shield },
      { title: 'TISS', url: '/tiss', icon: FileText }
    ]
  },
  {
    label: 'Inovação',
    collapsed: true,
    items: [
      { title: 'Fluxo Digital', url: '/fluxo-digital', icon: Scan },
      { title: 'Criptomoedas', url: '/crypto', icon: Bitcoin }
    ]
  },
  {
    label: 'Suporte',
    items: [
      { title: 'Central de Ajuda', url: '/ajuda', icon: BookOpen }
    ]
  }
];

export const adminMenuItems: MenuItem[] = [
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
  { title: 'Usuários', url: '/usuarios', icon: UserCog },
  { title: 'Meus Módulos', url: '/configuracoes/modulos', icon: Package }
];
