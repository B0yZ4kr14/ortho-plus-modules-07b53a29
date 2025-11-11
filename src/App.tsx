import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Dentistas from "./pages/Dentistas";
import Resumo from "./pages/Resumo";
import AgendaClinica from "./pages/AgendaClinica";
import GerenciamentoModulos from "./pages/GerenciamentoModulos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ModulesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <main className="flex-1 bg-background">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/resumo" element={<Resumo />} />
                    <Route path="/pacientes" element={<Pacientes />} />
                    <Route path="/dentistas" element={<Dentistas />} />
                    <Route path="/agenda-clinica" element={<AgendaClinica />} />
                    <Route path="/modulos" element={<GerenciamentoModulos />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </ModulesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
