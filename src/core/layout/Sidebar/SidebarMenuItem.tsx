import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Circle } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem } from './sidebar.config';
import { Badge } from '@/components/ui/badge';

interface SidebarMenuItemProps {
  item: MenuItem;
  isSubItem?: boolean;
  onNavigate?: () => void;
}

export function SidebarMenuItem({ item, isSubItem = false, onNavigate }: SidebarMenuItemProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const { hasModuleAccess } = useAuth();
  const collapsed = state === 'collapsed';

  // Check module access - if moduleKey is defined, check access
  const hasAccess = !item.moduleKey || hasModuleAccess(item.moduleKey);
  
  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  const handleClick = () => {
    onNavigate?.();
  };

  // Get icon with fallback
  const IconComponent = item.icon || Circle;

  // Menu item com subitems
  if (item.subItems && !isSubItem) {
    return (
      <Collapsible defaultOpen={false} className="group/submenu">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="group/button my-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 px-3 py-2 w-full">
              <IconComponent className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm flex-1 font-medium transition-opacity duration-300">
                    {item.title}
                  </span>
                  <ChevronDown className="h-4 w-4 transition-all duration-300 group-data-[state=open]/submenu:rotate-180" />
                </>
              )}
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuItem item={subItem} isSubItem onNavigate={onNavigate} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Menu item simples
  const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
  const isItemActive = isActive(item.url);

  return (
    <ButtonComponent asChild>
      <NavLink
        to={item.url || '#'}
        onClick={handleClick}
        className={`my-1 rounded-xl transition-all duration-200 ${
          isItemActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg scale-[1.02]'
            : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:shadow-md'
        }`}
      >
        <div className={`flex items-center gap-3 ${isSubItem ? 'px-4 py-1.5' : 'px-3 py-2'} w-full`}>
          <IconComponent className={`${isSubItem ? 'h-4 w-4' : 'h-5 w-5'} shrink-0`} />
          {!collapsed && (
            <>
              <span className={`${isSubItem ? 'text-xs' : 'text-sm'} font-medium transition-opacity duration-300 flex-1`}>
                {item.title}
              </span>
            </>
          )}
        </div>
      </NavLink>
    </ButtonComponent>
  );
}
