import { Home, BarChart3, Users, UserCog, Briefcase, Stethoscope, Calendar, ClipboardCheck, Phone, UserCheck, Settings, DollarSign, Cog } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useModules } from "@/contexts/ModulesContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import orthoLogo from "@/assets/ortho-logo.png";
import { Button } from "@/components/ui/button";

// Map icons to module IDs
const iconMap: Record<string, any> = {
  'home': Home,
  'resumo': BarChart3,
  'pacientes': Users,
  'dentistas': UserCog,
  'funcionarios': Briefcase,
  'procedimentos': Stethoscope,
  'agenda-clinica': Calendar,
  'agenda-avaliacao': ClipboardCheck,
  'controle-chegada': UserCheck,
  'confirmacao-agenda': Phone,
  'gestao-dentistas': Settings,
  'financeiro': DollarSign,
};

export function AppSidebar() {
  const { modules } = useModules();
  const { userRole } = useAuth();
  
  // Get enabled modules grouped by category
  const enabledModules = modules.filter(m => m.enabled);
  const categories = Array.from(new Set(enabledModules.map(m => m.category)));
  
  const menuSections = categories.map(category => ({
    label: category,
    items: enabledModules
      .filter(m => m.category === category)
      .map(m => ({
        title: m.name,
        url: m.path,
        icon: iconMap[m.id] || Settings,
        badge: m.badge,
      })),
  }));

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-2">
          <img src={orthoLogo} alt="Ortho+" className="w-32 h-auto" />
          <p className="text-xs text-sidebar-foreground/70 text-center">
            Sistema de Gestão Odontológica
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold px-4">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center justify-between text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {userRole === 'ADMIN' && (
          <NavLink to="/settings/modules">
            <Button variant="outline" className="w-full gap-2 justify-start" size="sm">
              <Cog className="h-4 w-4" />
              Gerenciar Módulos
            </Button>
          </NavLink>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}