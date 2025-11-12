import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Dentistas from "./pages/Dentistas";
import Funcionarios from "./pages/Funcionarios";
import Procedimentos from "./pages/Procedimentos";
import Financeiro from "./pages/Financeiro";
import Resumo from "./pages/Resumo";
import AgendaClinica from "./pages/AgendaClinica";
import GerenciamentoModulos from "./pages/GerenciamentoModulos";
import ModulesAdmin from "./pages/settings/ModulesAdmin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ModulesProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
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
                              <Route path="/funcionarios" element={<Funcionarios />} />
                              <Route path="/procedimentos" element={<Procedimentos />} />
                              <Route path="/financeiro" element={<Financeiro />} />
                              <Route path="/agenda-clinica" element={<AgendaClinica />} />
                              <Route path="/modulos" element={<GerenciamentoModulos />} />
                              <Route 
                                path="/settings/modules" 
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <ModulesAdmin />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ModulesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
