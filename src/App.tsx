import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import Pacientes from "./pages/Pacientes";
import Dentistas from "./pages/Dentistas";
import Funcionarios from "./pages/Funcionarios";
import Procedimentos from "./pages/Procedimentos";
import Financeiro from "./pages/Financeiro";
import Resumo from "./pages/Resumo";
import AgendaClinica from "./pages/AgendaClinica";
import GerenciamentoModulos from "./pages/GerenciamentoModulos";
import ModulesAdmin from './pages/settings/ModulesAdmin';
import Configuracoes from './pages/Configuracoes';
import PEP from './pages/PEP';
import Relatorios from './pages/Relatorios';
import BusinessIntelligence from './pages/BusinessIntelligence';
import Auth from './pages/Auth';
import ReportTemplates from '@/pages/ReportTemplates';
import AuditLogs from '@/pages/AuditLogs';
import UserBehaviorAnalytics from "@/pages/UserBehaviorAnalytics";
import LGPDCompliance from "@/pages/LGPDCompliance";
import Cobranca from '@/pages/Cobranca';
import EstoqueDashboard from '@/pages/estoque/EstoqueDashboard';
import EstoqueCadastros from '@/pages/estoque/EstoqueCadastros';
import EstoqueRequisicoes from '@/pages/estoque/EstoqueRequisicoes';
import EstoqueMovimentacoes from '@/pages/estoque/EstoqueMovimentacoes';
import EstoqueAnaliseConsumo from '@/pages/estoque/EstoqueAnaliseConsumo';
import EstoquePedidos from '@/pages/estoque/EstoquePedidos';
import EstoqueIntegracoes from '@/pages/estoque/EstoqueIntegracoes';
import EstoqueAnalisePedidos from '@/pages/estoque/EstoqueAnalisePedidos';
import ContasReceber from '@/pages/financeiro/ContasReceber';
import ContasPagar from '@/pages/financeiro/ContasPagar';
import NotasFiscais from '@/pages/financeiro/NotasFiscais';
import Transacoes from '@/pages/financeiro/Transacoes';
import CryptoPagamentos from '@/pages/financeiro/CryptoPagamentos';
import Orcamentos from '@/pages/Orcamentos';
import Contratos from '@/pages/Contratos';
import PortalPaciente from '@/pages/PortalPaciente';
import Teleodontologia from './pages/Teleodontologia';
import HistoricoTeleconsultas from './pages/HistoricoTeleconsultas';
import IARadiografia from '@/pages/IARadiografia';
import CRMFunil from '@/pages/CRMFunil';
import SplitPagamento from '@/pages/SplitPagamento';
import ProgramaFidelidade from '@/pages/ProgramaFidelidade';
import NotFound from './pages/NotFound';
import { ProductTour } from './components/tour/ProductTour';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ModulesProvider>
              <Toaster />
              <Sonner />
              <ProductTour />
              <Routes>
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full">
                        <div data-tour="sidebar">
                          <AppSidebar />
                        </div>
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
                              <Route path="/financeiro/transacoes" element={<Transacoes />} />
                              <Route path="/financeiro/contas-receber" element={<ContasReceber />} />
                              <Route path="/financeiro/contas-pagar" element={<ContasPagar />} />
                              <Route path="/financeiro/notas-fiscais" element={<NotasFiscais />} />
                              <Route path="/financeiro/crypto" element={<CryptoPagamentos />} />
                              <Route path="/agenda" element={<AgendaClinica />} />
                              <Route path="/agenda-clinica" element={<AgendaClinica />} />
                              <Route path="/pep" element={<PEP />} />
                              <Route path="/relatorios" element={<Relatorios />} />
                              <Route path="/business-intelligence" element={<BusinessIntelligence />} />
                              <Route path="/analise-comportamental" element={<UserBehaviorAnalytics />} />
                              <Route path="/lgpd-compliance" element={<LGPDCompliance />} />
                              <Route path="/cobranca" element={<Cobranca />} />
                              <Route path="/estoque" element={<EstoqueDashboard />} />
                              <Route path="/estoque/cadastros" element={<EstoqueCadastros />} />
                              <Route path="/estoque/requisicoes" element={<EstoqueRequisicoes />} />
                              <Route path="/estoque/movimentacoes" element={<EstoqueMovimentacoes />} />
                               <Route path="/estoque/pedidos" element={<EstoquePedidos />} />
                              <Route path="/estoque/integracoes" element={<EstoqueIntegracoes />} />
                              <Route path="/estoque/analise-pedidos" element={<EstoqueAnalisePedidos />} />
                              <Route path="/estoque/analise-consumo" element={<EstoqueAnaliseConsumo />} />
                              <Route path="/orcamentos" element={<Orcamentos />} />
                              <Route path="/contratos" element={<Contratos />} />
                              <Route path="/portal-paciente" element={<PortalPaciente />} />
                              <Route path="/teleodontologia" element={<Teleodontologia />} />
                              <Route path="/historico-teleconsultas" element={<HistoricoTeleconsultas />} />
                              <Route path="/ia-radiografia" element={<IARadiografia />} />
                              <Route path="/crm-funil" element={<CRMFunil />} />
                              <Route path="/split-pagamento" element={<SplitPagamento />} />
                              <Route path="/programa-fidelidade" element={<ProgramaFidelidade />} />
                              <Route
                                path="/report-templates"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <ReportTemplates />
                                  </ProtectedRoute>
                                }
                              />
                              <Route 
                                path="/audit-logs" 
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <AuditLogs />
                                  </ProtectedRoute>
                                }
                              />
                              <Route path="/modulos" element={<GerenciamentoModulos />} />
                              <Route
                                path="/configuracoes" 
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <Configuracoes />
                                  </ProtectedRoute>
                                 }
                               />
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
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
