import { SidebarHeader as ShadcnSidebarHeader } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import orthoLogo from '@/assets/ortho-logo-main.png';
import { QuickActionsBar } from '@/components/QuickActionsBar';

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <ShadcnSidebarHeader className="border-b border-sidebar-border/50 transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2">
          <img 
            src={orthoLogo} 
            alt="Ortho+" 
            className="h-8 w-auto shrink-0 transition-transform duration-300 hover:scale-110"
          />
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                Ortho+
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Sistema Odontológico
              </span>
            </div>
          )}
        </div>
      </div>
      
      {!collapsed && <QuickActionsBar />}
    </ShadcnSidebarHeader>
  );
}
