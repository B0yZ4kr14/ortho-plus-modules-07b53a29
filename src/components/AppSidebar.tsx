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
  FolderOpen
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
    label: 'Financeiro',
    items: [
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
      { title: 'Cobrança', url: '/cobranca', icon: CreditCard },
    ]
  },
  {
    label: 'Estoque',
    collapsed: true,
    items: [
      { title: 'Cadastros', url: '/estoque/cadastros', icon: FolderOpen },
      { title: 'Requisições', url: '/estoque/requisicoes', icon: ClipboardList },
      { title: 'Movimentações', url: '/estoque/movimentacoes', icon: Package },
    ]
  },
  {
    label: 'Relatórios & BI',
    items: [
      { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
      { title: 'Business Intelligence', url: '/business-intelligence', icon: TrendingUp },
      { title: 'Análise Comportamental', url: '/analise-comportamental', icon: Activity },
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
      <SidebarHeader className="border-b border-border p-4 bg-sidebar">
        {!collapsed ? (
          <div className="flex items-center justify-center px-2">
            <img 
              src="/src/assets/ortho-logo-new.png" 
              alt="Ortho +" 
              className="h-12 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <img 
              src="/src/assets/ortho-logo-new.png" 
              alt="Ortho +" 
              className="h-8 w-auto object-contain"
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
                    <CollapsibleTrigger className="flex w-full items-center justify-between hover:text-sidebar-foreground transition-colors">
                      {!collapsed && (
                        <>
                          <span>{group.label}</span>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                              asChild 
                              isActive={isActive(item.url)}
                              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-colors"
                            >
                              <NavLink 
                                to={item.url} 
                                end 
                                className="flex items-center gap-3 px-3 py-2"
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
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
                          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-colors"
                        >
                          <NavLink 
                            to={item.url} 
                            end 
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="text-sm">{item.title}</span>}
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
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-colors"
                    >
                      <NavLink 
                        to="/configuracoes" 
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">Configurações</span>}
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
