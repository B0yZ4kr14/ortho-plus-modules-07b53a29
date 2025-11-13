import { SidebarGroup as ShadcnSidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem as ShadcnSidebarMenuItem } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarMenuItem } from './SidebarMenuItem';
import { MenuGroup } from './sidebar.config';

interface SidebarGroupProps {
  group: MenuGroup;
  index: number;
  onNavigate?: () => void;
}

export function SidebarGroup({ group, index, onNavigate }: SidebarGroupProps) {
  const { state } = useSidebar();
  const { hasModuleAccess } = useAuth();
  const collapsed = state === 'collapsed';

  // Filter items based on module access
  const visibleItems = group.items.filter(item => {
    // If no moduleKey, item is always visible
    if (!item.moduleKey) return true;
    // Check if user has access to this module
    return hasModuleAccess(item.moduleKey);
  });

  // Don't render group if no visible items
  if (visibleItems.length === 0) {
    return null;
  }

  const containerStyle = `rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-xl backdrop-blur-sm border border-sidebar-border/50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl animate-fade-in`;

  if (group.collapsed) {
    return (
      <div className={containerStyle} style={{ animationDelay: `${index * 100}ms` }}>
        <Collapsible defaultOpen={false} className="group/collapsible">
          <ShadcnSidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md cursor-pointer hover:bg-sidebar-accent/30 rounded-lg transition-all duration-200">
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="tracking-wide transition-opacity duration-300">
                      {group.label}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
                  </div>
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <ShadcnSidebarMenuItem key={item.title}>
                      <SidebarMenuItem item={item} onNavigate={onNavigate} />
                    </ShadcnSidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </ShadcnSidebarGroup>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className={containerStyle} style={{ animationDelay: `${index * 100}ms` }}>
      <ShadcnSidebarGroup>
        <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
          {!collapsed && (
            <span className="tracking-wide transition-opacity duration-300">
              {group.label}
            </span>
          )}
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1">
          <SidebarMenu>
            {visibleItems.map((item) => (
              <ShadcnSidebarMenuItem key={item.title}>
                <SidebarMenuItem item={item} onNavigate={onNavigate} />
              </ShadcnSidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </ShadcnSidebarGroup>
    </div>
  );
}
