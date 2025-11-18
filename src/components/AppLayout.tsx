import { ReactNode, useState, memo, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/core/layout/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFocusMode } from '@/hooks/useFocusMode';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isFocusMode } = useFocusMode({ enabled: true, timeout: 3000 });

  const contentClassName = useMemo(
    () => `flex-1 bg-background overflow-x-hidden transition-all duration-300 ${isFocusMode ? 'p-2 md:p-4' : 'p-4 md:p-6'}`,
    [isFocusMode]
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!isMobile && !isFocusMode && (
          <div data-tour="sidebar" className="transition-all duration-300">
            <AppSidebar />
          </div>
        )}

        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[280px] p-0">
              <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isFocusMode ? 'ml-0' : ''}`}>
          {(!isFocusMode || isMobile) && (
            <div className="transition-all duration-300">
              <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
            </div>
          )}
          
          <main className={contentClassName}>
            {isFocusMode && !isMobile && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Modo Foco Ativo - Digitando...</span>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      <GlobalSearch />
    </SidebarProvider>
  );
});
