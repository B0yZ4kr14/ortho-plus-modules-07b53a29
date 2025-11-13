import { LayoutDashboard, Users, UserPlus, Calendar, Stethoscope, FileText, DollarSign, Settings, TrendingUp, ClipboardList, Shield, Activity, Package, CreditCard, BarChart3, FileBarChart, Bitcoin, FolderOpen, ShoppingCart, Webhook, LineChart, FileSignature, User, Video, Scan, UserCog, Award, Smartphone, ClipboardCheck } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, SidebarHeader, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useRef } from 'react';
import orthoLogo from '@/assets/ortho-logo-main.png';
const menuGroups = [{
  label: 'Visão Geral',
  items: [{
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard
  }]
}, {
  label: 'Cadastros',
  items: [{
    title: 'Pacientes',
    url: '/pacientes',
    icon: Users
  }, {
    title: 'Dentistas',
    url: '/dentistas',
    icon: UserPlus
  }, {
    title: 'Funcionários',
    url: '/funcionarios',
    icon: Users
  }, {
    title: 'Procedimentos',
    url: '/procedimentos',
    icon: Stethoscope
  }]
}, {
  label: 'Clínica',
  items: [{
    title: 'Agenda',
    url: '/agenda-clinica',
    icon: Calendar
  }, {
    title: 'PEP',
    url: '/pep',
    icon: FileText
  }, {
    title: 'Orçamentos',
    url: '/orcamentos',
    icon: FileText
  }, {
    title: 'Contratos',
    url: '/contratos',
    icon: FileSignature
  }, {
    title: 'Teleodontologia',
    icon: Video,
    collapsed: true,
    subItems: [{
      title: 'Consultas',
      url: '/teleodontologia',
      icon: Video
    }, {
      title: 'Histórico',
      url: '/historico-teleconsultas',
      icon: FileText
    }]
  }, {
    title: 'IA Raio-X',
    url: '/ia-radiografia',
    icon: Scan
  }]
}, {
  label: 'Estoque',
  collapsed: true,
  items: [{
    title: 'Dashboard',
    url: '/estoque',
    icon: BarChart3
  }, {
    title: 'Cadastros',
    url: '/estoque/cadastros',
    icon: FolderOpen
  }, {
    title: 'Requisições',
    url: '/estoque/requisicoes',
    icon: ClipboardList
  }, {
    title: 'Movimentações',
    url: '/estoque/movimentacoes',
    icon: Package
  }, {
    title: 'Pedidos',
    url: '/estoque/pedidos',
    icon: ShoppingCart
  }, {
    title: 'Integrações API',
    url: '/estoque/integracoes',
    icon: Webhook
  }, {
    title: 'Análise de Pedidos',
    url: '/estoque/analise-pedidos',
    icon: LineChart
  }, {
    title: 'Análise de Consumo',
    url: '/estoque/analise-consumo',
    icon: BarChart3
  }, {
    title: 'Inventário',
    url: '/estoque/inventario',
    icon: ClipboardCheck
  }, {
    title: 'Scanner Mobile',
    url: '/estoque/scanner-mobile',
    icon: Smartphone
  }]
}, {
  label: 'Financeiro',
  collapsed: true,
  items: [{
    title: 'Dashboard',
    url: '/financeiro',
    icon: BarChart3
  }, {
    title: 'Transações',
    url: '/financeiro/transacoes',
    icon: Activity
  }, {
    title: 'Contas a Receber',
    url: '/financeiro/contas-receber',
    icon: TrendingUp
  }, {
    title: 'Contas a Pagar',
    url: '/financeiro/contas-pagar',
    icon: CreditCard
  }, {
    title: 'Notas Fiscais',
    url: '/financeiro/notas-fiscais',
    icon: FileText
  }, {
    title: 'Cobrança',
    url: '/cobranca',
    icon: CreditCard
  }, {
    title: 'Split de Pagamento',
    url: '/split-pagamento',
    icon: DollarSign
  }, {
    title: 'Crypto Pagamentos',
    url: '/financeiro/crypto',
    icon: Bitcoin
  }]
}, {
  label: 'Relatórios & BI',
  items: [{
    title: 'Relatórios',
    url: '/relatorios',
    icon: FileBarChart
  }, {
    title: 'Business Intelligence',
    url: '/business-intelligence',
    icon: TrendingUp
  }, {
    title: 'Análise Comportamental',
    url: '/analise-comportamental',
    icon: Activity
  }, {
    title: 'Templates',
    url: '/report-templates',
    icon: ClipboardList
  }]
}, {
  label: 'Pacientes',
  items: [{
    title: 'Portal do Paciente',
    url: '/portal-paciente',
    icon: User
  }, {
    title: 'CRM + Funil',
    url: '/crm-funil',
    icon: UserCog
  }, {
    title: 'Programa Fidelidade',
    url: '/programa-fidelidade',
    icon: Award
  }]
}, {
  label: 'Compliance',
  items: [{
    title: 'Auditoria',
    url: '/audit-logs',
    icon: Shield
  }, {
    title: 'LGPD',
    url: '/lgpd-compliance',
    icon: Shield
  }]
}];
interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps = {}) {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin, hasModuleAccess, userRole } = useAuth();
  const currentPath = location.pathname;
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  // Module key mapping for permission checks
  const moduleKeyMap: Record<string, string> = {
    '/': 'DASHBOARD',
    '/pacientes': 'PACIENTES',
    '/dentistas': 'DENTISTAS',
    '/funcionarios': 'FUNCIONARIOS',
    '/procedimentos': 'PROCEDIMENTOS',
    '/agenda-clinica': 'AGENDA',
    '/pep': 'PEP',
    '/orcamentos': 'ORCAMENTOS',
    '/contratos': 'CONTRATOS',
    '/teleodontologia': 'TELEODONTO',
    '/historico-teleconsultas': 'TELEODONTO',
    '/ia-radiografia': 'IA',
    '/estoque': 'ESTOQUE',
    '/estoque/cadastros': 'ESTOQUE',
    '/estoque/requisicoes': 'ESTOQUE',
    '/estoque/movimentacoes': 'ESTOQUE',
    '/estoque/pedidos': 'ESTOQUE',
    '/estoque/integracoes': 'ESTOQUE',
    '/estoque/analise-pedidos': 'ESTOQUE',
    '/estoque/analise-consumo': 'ESTOQUE',
    '/estoque/inventario': 'ESTOQUE',
    '/financeiro': 'FINANCEIRO',
    '/financeiro/transacoes': 'FINANCEIRO',
    '/financeiro/contas-receber': 'FINANCEIRO',
    '/financeiro/contas-pagar': 'FINANCEIRO',
    '/financeiro/notas-fiscais': 'FINANCEIRO',
    '/financeiro/crypto': 'FINANCEIRO',
    '/cobranca': 'INADIMPLENCIA',
    '/split-pagamento': 'SPLIT_PAGAMENTO',
    '/relatorios': 'RELATORIOS',
    '/business-intelligence': 'BI',
    '/analise-comportamental': 'BI',
    '/report-templates': 'RELATORIOS',
    '/portal-paciente': 'PORTAL_PACIENTE',
    '/crm-funil': 'CRM',
    '/programa-fidelidade': 'FIDELIDADE',
    '/audit-logs': 'LGPD',
    '/lgpd-compliance': 'LGPD'
  };
  const hasAccessToRoute = (url: string) => {
    // Admin always has access
    if (isAdmin) return true;

    // Check module permission for the route
    const moduleKey = moduleKeyMap[url];
    if (!moduleKey) return true; // Allow access if not mapped

    return hasModuleAccess(moduleKey);
  };
  const collapsed = state === 'collapsed';
  const isActive = (path: string) => currentPath === path;
  
  const renderMenuItem = (item: any, isSubItem = false) => {
    const ItemContent = (
      <SidebarMenuButton 
        asChild 
        isActive={isActive(item.url)} 
        className={`group/button my-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-lg transition-all duration-200 min-h-[44px] relative overflow-hidden ${
          isActive(item.url) 
            ? 'bg-primary/20 text-primary border-l-4 border-l-primary shadow-lg' 
            : ''
        }`}
        onClick={createRipple}
      >
        <NavLink to={item.url} end={!isSubItem} className="flex items-center gap-3 px-3 py-2 relative z-10" onClick={onNavigate}>
          <item.icon className={isSubItem ? "h-4 w-4" : "h-5 w-5 shrink-0"} />
          {!collapsed && (
            <span className={`${isSubItem ? 'text-sm' : 'text-sm flex-1'} font-medium transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              {item.title}
            </span>
          )}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute inset-0 bg-primary/30 rounded-full animate-ripple pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </NavLink>
      </SidebarMenuButton>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {ItemContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return ItemContent;
  };
  
  return <TooltipProvider delayDuration={300}>
    <Sidebar 
      className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`} 
      collapsible="icon"
    >
      <SidebarHeader className="p-4 mb-2 mx-2 rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-2xl backdrop-blur-sm border-0 transition-all duration-300">
        {!collapsed ? (
          <div className="flex items-center justify-center py-3 transition-all duration-300">
            <img src={orthoLogo} alt="Ortho +" className="h-24 w-auto object-contain transition-all duration-300 drop-shadow-2xl opacity-100" />
          </div>
        ) : (
          <div className="flex justify-center transition-all duration-300">
            <img src={orthoLogo} alt="Ortho +" className="h-20 w-auto object-contain transition-all duration-300 drop-shadow-2xl" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="space-y-3 px-2">
        {menuGroups.map((group, index) => (
          <div 
            key={group.label} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            
            {group.collapsed ? (
              <Collapsible defaultOpen={false} className="group/collapsible">
                <div className="rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-xl backdrop-blur-sm border border-sidebar-border/50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
                  <SidebarGroup>
                    <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
                      <CollapsibleTrigger className="flex w-full items-center justify-between hover:text-primary transition-all duration-200">
                        {!collapsed && (
                          <>
                            <span className="tracking-wide transition-opacity duration-300">{group.label}</span>
                            <ChevronDown className="h-4 w-4 transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent className="mt-1">
                        <SidebarMenu>
                          {group.items.map(item => (
                            <SidebarMenuItem key={item.title}>
                              {renderMenuItem(item)}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </div>
              </Collapsible>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-xl backdrop-blur-sm border border-sidebar-border/50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
                    {!collapsed && <span className="tracking-wide transition-opacity duration-300">{group.label}</span>}
                  </SidebarGroupLabel>
                  <SidebarGroupContent className="mt-1">
                    <SidebarMenu>
                      {group.items.map(item => item.subItems ? (
                        <Collapsible key={item.title} defaultOpen={false} className="group/submenu">
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="group/button my-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-lg transition-all duration-200">
                              <div className="flex items-center gap-3 px-3 py-2 w-full">
                                <item.icon className="h-5 w-5 shrink-0" />
                                 {!collapsed && (
                                  <>
                                    <span className="text-sm flex-1 font-medium transition-opacity duration-300">{item.title}</span>
                                    <ChevronDown className="h-4 w-4 transition-all duration-300 group-data-[state=open]/submenu:rotate-180" />
                                  </>
                                )}
                              </div>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subItems.map(subItem => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    {renderMenuItem(subItem, true)}
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      ) : (
                        <SidebarMenuItem key={item.title}>
                          {renderMenuItem(item)}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </div>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <div 
              className="rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-xl backdrop-blur-sm border border-sidebar-border/50 p-2 mt-3 animate-fade-in transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{ animationDelay: `${menuGroups.length * 100}ms` }}
            >
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
                  {!collapsed && <span className="tracking-wide transition-opacity duration-300">Administração</span>}
                </SidebarGroupLabel>
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      {renderMenuItem({ title: 'Configurações', url: '/configuracoes', icon: Settings })}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 mt-2 mx-2 rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-2xl backdrop-blur-sm border-0 transition-all duration-300">
        {!collapsed && (
          <div className="text-center space-y-0.5 transition-opacity duration-300">
            <p className="text-xs text-sidebar-foreground/80 font-semibold drop-shadow">Ortho + v1.0</p>
            <p className="text-[10px] text-sidebar-foreground/60 font-medium">© 2025 TSI Telecom</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  </TooltipProvider>;
}