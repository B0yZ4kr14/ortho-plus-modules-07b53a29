import { Home, BarChart3, Users, UserCog, Briefcase, Stethoscope, Calendar, ClipboardCheck, Phone, UserCheck, Settings, DollarSign } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
} from "@/components/ui/sidebar";
import orthoLogo from "@/assets/ortho-logo.png";

const menuSections = [
  {
    label: "DASHBOARD",
    items: [
      { title: "Página Inicial", url: "/", icon: Home },
      { title: "Resumo Gerencial", url: "/resumo", icon: BarChart3 },
    ],
  },
  {
    label: "CADASTROS",
    items: [
      { title: "Pacientes", url: "/pacientes", icon: Users, badge: "1.247" },
      { title: "Dentistas", url: "/dentistas", icon: UserCog },
      { title: "Funcionários", url: "/funcionarios", icon: Briefcase },
      { title: "Procedimentos", url: "/procedimentos", icon: Stethoscope },
    ],
  },
  {
    label: "AGENDA",
    items: [
      { title: "Agenda Clínica", url: "/agenda-clinica", icon: Calendar, badge: "28" },
      { title: "Agenda de Avaliação", url: "/agenda-avaliacao", icon: ClipboardCheck },
      { title: "Controle de Chegada", url: "/controle-chegada", icon: UserCheck },
      { title: "Confirmação Agenda", url: "/confirmacao-agenda", icon: Phone },
      { title: "Gestão de Dentistas", url: "/gestao-dentistas", icon: Settings },
    ],
  },
  {
    label: "COMERCIAL",
    items: [
      { title: "Financeiro", url: "/financeiro", icon: DollarSign },
    ],
  },
];

export function AppSidebar() {
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
    </Sidebar>
  );
}
