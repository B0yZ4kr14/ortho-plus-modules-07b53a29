import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  Stethoscope,
  FileText,
  DollarSign,
  Settings
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import orthoLogo from '@/assets/ortho-logo.png';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Pacientes', url: '/pacientes', icon: Users },
  { title: 'Dentistas', url: '/dentistas', icon: UserPlus },
  { title: 'Funcionários', url: '/funcionarios', icon: Users },
  { title: 'Agenda', url: '/agenda-clinica', icon: Calendar },
  { title: 'Procedimentos', url: '/procedimentos', icon: Stethoscope },
  { title: 'PEP', url: '/pep', icon: FileText },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Relatórios', url: '/relatorios', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;

  const collapsed = state === 'collapsed';
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src={orthoLogo} alt="Ortho +" className="h-8" />
            <span className="font-bold text-lg">Ortho +</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={orthoLogo} alt="Ortho +" className="h-8" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/configuracoes')}>
                      <NavLink 
                        to="/configuracoes" 
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        {!collapsed && <span>Configurações</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!collapsed && (
          <p className="text-xs text-center text-muted-foreground">
            Ortho + v1.0 • 2025
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
