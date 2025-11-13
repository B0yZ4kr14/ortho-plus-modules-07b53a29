import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({
  children
}: AppLayoutProps) {
  return <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div data-tour="sidebar">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader className="rounded-bl-none px-[9px] mx-[30px]" />
          <main className="flex-1 bg-background overflow-x-hidden pt-6 px-4 lg:px-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}