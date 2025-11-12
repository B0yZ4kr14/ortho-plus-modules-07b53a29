import {
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  Stethoscope,
  FileText,
  DollarSign,
  Settings,
  TrendingUp,
  ClipboardList,
  Shield,
  Activity,
  Package,
  CreditCard,
  BarChart3,
  FileBarChart,
  FolderOpen,
  ShoppingCart,
  Webhook,
  LineChart
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const menuGroups = [
  {
    label: 'Visão Geral',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Cadastros',
    items: [
      { title: 'Pacientes', url: '/pacientes', icon: Users },
      { title: 'Dentistas', url: '/dentistas', icon: UserPlus },
      { title: 'Funcionários', url: '/funcionarios', icon: Users },
      { title: 'Procedimentos', url: '/procedimentos', icon: Stethoscope },
    ]
  },
  {
    label: 'Clínica',
    items: [
      { title: 'Agenda', url: '/agenda-clinica', icon: Calendar },
      { title: 'PEP', url: '/pep', icon: FileText },
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
      { title: 'Integrações API', url: '/estoque/integracoes', icon: Webhook, badge: 'Beta' },
      { title: 'Análise de Pedidos', url: '/estoque/analise-pedidos', icon: LineChart },
      { title: 'Análise de Consumo', url: '/estoque/analise-consumo', icon: BarChart3 },
    ]
  },
  {
    label: 'Financeiro',
    collapsed: true,
    items: [
      { title: 'Dashboard', url: '/financeiro', icon: BarChart3 },
      { title: 'Transações', url: '/financeiro/transacoes', icon: Activity, badge: 'Novo' },
      { title: 'Contas a Receber', url: '/financeiro/contas-receber', icon: TrendingUp },
      { title: 'Contas a Pagar', url: '/financeiro/contas-pagar', icon: CreditCard },
      { title: 'Notas Fiscais', url: '/financeiro/notas-fiscais', icon: FileText },
      { title: 'Cobrança', url: '/cobranca', icon: CreditCard },
    ]
  },
  {
    label: 'Relatórios & BI',
    items: [
      { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
      { title: 'Business Intelligence', url: '/business-intelligence', icon: TrendingUp, badge: 'IA' },
      { title: 'Análise Comportamental', url: '/analise-comportamental', icon: Activity, badge: 'Novo' },
      { title: 'Templates', url: '/report-templates', icon: ClipboardList },
    ]
  },
  {
    label: 'Compliance',
    items: [
      { title: 'Auditoria', url: '/audit-logs', icon: Shield },
      { title: 'LGPD', url: '/lgpd-compliance', icon: Shield },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;

  const collapsed = state === 'collapsed';
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-72'} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4 bg-gradient-to-b from-sidebar to-sidebar/95">
        {!collapsed ? (
          <div className="flex items-center justify-center px-2">
            <img 
              src="/src/assets/ortho-logo-full.png" 
              alt="Ortho +" 
              className="h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <img 
              src="/src/assets/ortho-logo-full.png" 
              alt="Ortho +" 
              className="h-10 w-auto object-contain drop-shadow-md"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        {menuGroups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && <Separator className="my-2 bg-border/50" />}
            
            {group.collapsed ? (
              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider">
                    <CollapsibleTrigger className="flex w-full items-center justify-between hover:text-sidebar-foreground transition-all duration-300">
                      {!collapsed && (
                        <>
                          <span className="animate-fade-in">{group.label}</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden transition-all">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className="relative group hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:border-l-4 hover:border-l-primary hover:-translate-x-0.5 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/25 data-[active=true]:via-primary/15 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-l-primary data-[active=true]:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out"
                    >
                      <NavLink 
                        to={item.url} 
                        end 
                        className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                      >
                        <item.icon className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                        {!collapsed && (
                          <span className="text-sm font-medium animate-slide-in flex-1">{item.title}</span>
                        )}
                        {!collapsed && item.badge && (
                          <Badge 
                            variant={item.badge === 'IA' ? 'default' : item.badge === 'Beta' ? 'secondary' : 'outline'} 
                            className="ml-auto text-[10px] px-1.5 py-0.5 shadow-sm"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ) : (
              <SidebarGroup>
                <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider px-3">
                  {!collapsed && group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive(item.url)}
                          className="relative group hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:border-l-4 hover:border-l-primary hover:-translate-x-0.5 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/25 data-[active=true]:via-primary/15 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-l-primary data-[active=true]:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out"
                        >
                          <NavLink 
                            to={item.url} 
                            end 
                            className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                          >
                            <item.icon className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            {!collapsed && (
                              <span className="text-sm font-medium animate-slide-in flex-1">{item.title}</span>
                            )}
                            {!collapsed && item.badge && (
                              <Badge 
                                variant={item.badge === 'IA' ? 'default' : item.badge === 'Beta' ? 'secondary' : 'outline'} 
                                className="ml-auto text-[10px] px-1.5 py-0.5 shadow-sm"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <Separator className="my-2 bg-border/50" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider px-3">
                {!collapsed && 'Administração'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive('/configuracoes')}
                      className="relative group hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] hover:border-l-4 hover:border-l-primary hover:-translate-x-0.5 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/25 data-[active=true]:via-primary/15 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-l-primary data-[active=true]:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out"
                    >
                      <NavLink 
                        to="/configuracoes" 
                        className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                      >
                        <Settings className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                        {!collapsed && <span className="text-sm font-medium animate-slide-in">Configurações</span>}
                      </NavLink>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-sidebar">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-sidebar-foreground/60 font-medium">
              Ortho + v1.0
            </p>
            <p className="text-[10px] text-sidebar-foreground/40 mt-1">
              © 2025 - Todos os direitos reservados
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
