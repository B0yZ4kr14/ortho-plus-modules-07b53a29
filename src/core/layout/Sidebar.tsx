/**
 * FASE 0 - CORREÇÃO CRÍTICA: SIDEBAR PRINCIPAL
 * 
 * Componente principal de navegação lateral do sistema Ortho+
 * - Renderização dinâmica baseada em módulos ativos
 * - Proteção RBAC (ADMIN vs MEMBER)
 * - Design system compliant (semantic tokens)
 * - Navegação hierárquica por categorias
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/hooks/useModules';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  Calendar,
  FileText,
  Smile,
  Package,
  DollarSign,
  UserCog,
  Settings,
  TrendingUp,
  Shield,
  Microscope,
  Bitcoin,
  Video,
  Brain,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleTooltip } from '@/components/shared/ModuleTooltip';

interface AppSidebarProps {
  onNavigate?: () => void;
}

/**
 * Mapeamento de ícones por module_key
 */
const MODULE_ICONS: Record<string, any> = {
  // Core
  HOME: Home,
  PEP: FileText,
  AGENDA: Calendar,
  ORCAMENTOS: FileText,
  ODONTOGRAMA: Smile,
  ESTOQUE: Package,
  
  // Financeiro
  FINANCEIRO: DollarSign,
  SPLIT_PAGAMENTO: DollarSign,
  INADIMPLENCIA: TrendingUp,
  CRYPTO: Bitcoin,
  
  // Crescimento
  CRM: Users,
  MARKETING_AUTO: MessageSquare,
  BI: BarChart3,
  
  // Compliance
  LGPD: Shield,
  ASSINATURA_ICP: Shield,
  TISS: Shield,
  TELEODONTO: Video,
  
  // Inovação
  FLUXO_DIGITAL: Microscope,
  IA: Brain,
};

/**
 * Categorias de módulos para organização hierárquica
 */
const MODULE_CATEGORIES = {
  core: {
    label: 'Gestão e Operação',
    modules: ['PEP', 'AGENDA', 'ORCAMENTOS', 'ODONTOGRAMA', 'ESTOQUE'],
  },
  financial: {
    label: 'Financeiro',
    modules: ['FINANCEIRO', 'SPLIT_PAGAMENTO', 'INADIMPLENCIA', 'CRYPTO'],
  },
  growth: {
    label: 'Crescimento',
    modules: ['CRM', 'MARKETING_AUTO', 'BI'],
  },
  compliance: {
    label: 'Compliance',
    modules: ['LGPD', 'ASSINATURA_ICP', 'TISS', 'TELEODONTO'],
  },
  innovation: {
    label: 'Inovação',
    modules: ['FLUXO_DIGITAL', 'IA'],
  },
};

/**
 * Rotas dos módulos
 */
const MODULE_ROUTES: Record<string, string> = {
  HOME: '/',
  PEP: '/prontuario',
  AGENDA: '/agenda',
  ORCAMENTOS: '/orcamentos',
  ODONTOGRAMA: '/odontograma',
  ESTOQUE: '/estoque',
  FINANCEIRO: '/financeiro',
  SPLIT_PAGAMENTO: '/split-pagamento',
  INADIMPLENCIA: '/inadimplencia',
  CRYPTO: '/crypto-payment',
  CRM: '/crm-kanban',
  MARKETING_AUTO: '/marketing',
  BI: '/bi-dashboard',
  LGPD: '/lgpd',
  ASSINATURA_ICP: '/assinatura-digital',
  TISS: '/tiss',
  TELEODONTO: '/teleodonto',
  FLUXO_DIGITAL: '/fluxo-digital',
  IA: '/radiografia',
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { user, userRole, activeModules: authModules } = useAuth();
  const { modules, loading } = useModules();
  const { state } = useSidebar();
  
  const isAdmin = userRole === 'ADMIN';
  const isCollapsed = state === 'collapsed';
  const activeModules = authModules || [];

  /**
   * Verifica se módulo está ativo
   */
  const hasModuleAccess = (moduleKey: string): boolean => {
    return activeModules.includes(moduleKey);
  };

  /**
   * Renderiza um item de menu
   */
  const renderMenuItem = (moduleKey: string, label: string) => {
    if (!hasModuleAccess(moduleKey) && moduleKey !== 'HOME') return null;
    
    const Icon = MODULE_ICONS[moduleKey] || FileText;
    const route = MODULE_ROUTES[moduleKey] || '/';
    
    return (
      <SidebarMenuItem key={moduleKey}>
        <ModuleTooltip moduleKey={moduleKey}>
          <SidebarMenuButton asChild>
            <NavLink
              to={route}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          </SidebarMenuButton>
        </ModuleTooltip>
      </SidebarMenuItem>
    );
  };

  /**
   * Renderiza uma categoria de módulos
   */
  const renderCategory = (categoryKey: string, category: any) => {
    const visibleModules = category.modules.filter((key: string) => 
      hasModuleAccess(key)
    );
    
    if (visibleModules.length === 0) return null;
    
    return (
      <SidebarGroup key={categoryKey}>
        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
          {category.label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleModules.map((moduleKey: string) => {
              const moduleName = activeModules.find(m => m === moduleKey);
              return renderMenuItem(moduleKey, moduleName || moduleKey);
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  if (loading) {
    return (
      <Sidebar variant="sidebar" className="border-r border-border">
        <SidebarContent className="bg-sidebar">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="sidebar" className="border-r border-border" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-border bg-sidebar px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Smile className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-sidebar-foreground">Ortho+</h1>
              <p className="text-xs text-sidebar-foreground/60">Sistema Odontológico</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="bg-sidebar px-2 py-4 space-y-4">
        {/* Home sempre visível */}
        <SidebarGroup>
          <SidebarMenu>
            {renderMenuItem('HOME', 'Dashboard')}
          </SidebarMenu>
        </SidebarGroup>

        {/* Categorias de módulos */}
        {Object.entries(MODULE_CATEGORIES).map(([key, category]) =>
          renderCategory(key, category)
        )}

        {/* Administração - apenas para ADMIN */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/usuarios"
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                        )
                      }
                    >
                      <UserCog className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">Usuários</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Configurações */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/configuracoes"
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    )
                  }
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border bg-sidebar px-4 py-3">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {isAdmin ? 'Administrador' : 'Membro'}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
