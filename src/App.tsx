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
import { AppLayout } from "@/components/AppLayout";
import { useHotkeys } from "@/hooks/useHotkeys";
import { LoadingState } from '@/components/shared/LoadingState';
import { lazy, Suspense } from 'react';
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PatientDetail from "./pages/PatientDetail";
import PatientForm from "./pages/PatientForm";
import Dentistas from "./pages/Dentistas";
import Funcionarios from "./pages/Funcionarios";
import Procedimentos from "./pages/Procedimentos";
import Financeiro from "./pages/Financeiro";
import Resumo from "./pages/Resumo";
import AgendaClinica from "./pages/AgendaClinica";
import Configuracoes from './pages/Configuracoes';
import PEP from './pages/PEP';
import HelpCenter from "./pages/HelpCenter";
import Usuarios from "./pages/Usuarios";
// Lazy load rotas pesadas
const Relatorios = lazy(() => import('./pages/Relatorios'));
const BusinessIntelligence = lazy(() => import('./pages/BusinessIntelligence'));
const IARadiografia = lazy(() => import('@/pages/IARadiografia'));
const UserBehaviorAnalytics = lazy(() => import("@/pages/UserBehaviorAnalytics"));
const OnboardingAnalytics = lazy(() => import('./pages/settings/OnboardingAnalytics'));
const ModulesAdmin = lazy(() => import('./pages/settings/ModulesAdmin'));
const ModulesSimple = lazy(() => import('./pages/settings/ModulesSimple'));
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const CRM = lazy(() => import('./pages/CRM'));
import Auth from './pages/Auth';
import ReportTemplates from '@/pages/ReportTemplates';
import AuditLogs from '@/pages/AuditLogs';
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
import EstoqueScannerMobile from '@/pages/estoque/EstoqueScannerMobile';
import EstoqueInventario from '@/pages/estoque/EstoqueInventario';
const EstoqueInventarioHistorico = lazy(() => import('@/pages/estoque/EstoqueInventarioHistorico'));
const EstoqueInventarioDashboard = lazy(() => import('@/pages/estoque/EstoqueInventarioDashboard'));
import ContasReceber from '@/pages/financeiro/ContasReceber';
import ContasPagar from '@/pages/financeiro/ContasPagar';
import NotasFiscais from '@/pages/financeiro/NotasFiscais';
import Transacoes from '@/pages/financeiro/Transacoes';
import CryptoPagamentos from '@/pages/financeiro/CryptoPagamentos';
import ConciliacaoBancaria from '@/pages/financeiro/ConciliacaoBancaria';
import Orcamentos from '@/pages/Orcamentos';
import Contratos from '@/pages/Contratos';
import PortalPaciente from '@/pages/PortalPaciente';
import Teleodontologia from './pages/Teleodontologia';
import HistoricoTeleconsultas from './pages/HistoricoTeleconsultas';
import CRMFunil from '@/pages/CRMFunil';
import SplitPagamento from '@/pages/SplitPagamento';
import Inadimplencia from '@/pages/Inadimplencia';
import BI from '@/pages/BI';
import LGPD from '@/pages/LGPD';
import MarketingAuto from '@/pages/MarketingAuto';
import AssinaturaICP from '@/pages/AssinaturaICP';
import { AgendaPage } from '@/modules/agenda/ui/pages/AgendaPage';
import ProgramaFidelidade from '@/pages/ProgramaFidelidade';
import PDV from '@/pages/PDV';
import RelatorioCaixa from '@/pages/RelatorioCaixa';
import NotFound from './pages/NotFound';
import TestNotifications from '@/pages/TestNotifications';
import { ProductTour } from './components/tour/ProductTour';
import ScheduledBackupsManagement from './pages/settings/ScheduledBackupsManagement';
import BackupExecutivePage from './pages/settings/BackupExecutivePage';
import ModulesPage from './pages/settings/ModulesPage';
import DashboardVendasPDV from './pages/financeiro/DashboardVendasPDV';
import MetasGamificacao from './pages/pdv/MetasGamificacao';
import DashboardExecutivoPDV from './pages/pdv/DashboardExecutivoPDV';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

function HotkeysManager() {
  useHotkeys();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <HotkeysManager />
          <AuthProvider>
            <ModulesProvider>
              <Toaster />
              <Sonner />
              <ProductTour />
              <Routes>
                <Route path="/demo" element={<Demo />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected Routes with Layout */}
                <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/resumo" element={<ProtectedRoute><AppLayout><Resumo /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes" element={<ProtectedRoute><AppLayout><Pacientes /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/novo" element={<ProtectedRoute><AppLayout><PatientForm /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/editar/:id" element={<ProtectedRoute><AppLayout><PatientForm /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/:id" element={<ProtectedRoute><AppLayout><PatientDetail /></AppLayout></ProtectedRoute>} />
                <Route path="/dentistas" element={<ProtectedRoute><AppLayout><Dentistas /></AppLayout></ProtectedRoute>} />
                <Route path="/funcionarios" element={<ProtectedRoute><AppLayout><Funcionarios /></AppLayout></ProtectedRoute>} />
                <Route path="/procedimentos" element={<ProtectedRoute><AppLayout><Procedimentos /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro" element={<ProtectedRoute><AppLayout><Financeiro /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/transacoes" element={<ProtectedRoute><AppLayout><Transacoes /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/contas-receber" element={<ProtectedRoute><AppLayout><ContasReceber /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/contas-pagar" element={<ProtectedRoute><AppLayout><ContasPagar /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/notas-fiscais" element={<ProtectedRoute><AppLayout><NotasFiscais /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/crypto" element={<ProtectedRoute><AppLayout><CryptoPagamentos /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/conciliacao-bancaria" element={<ProtectedRoute><AppLayout><ConciliacaoBancaria /></AppLayout></ProtectedRoute>} />
                <Route path="/financeiro/dashboard-vendas" element={<ProtectedRoute><AppLayout><DashboardVendasPDV /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/metas" element={<ProtectedRoute><AppLayout><MetasGamificacao /></AppLayout></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><AppLayout><AgendaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/agenda-clinica" element={<ProtectedRoute><AppLayout><AgendaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/pep" element={<ProtectedRoute><AppLayout><PEP /></AppLayout></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando relatórios..." />}><Relatorios /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/business-intelligence" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando BI..." />}><BusinessIntelligence /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/analise-comportamental" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando analytics..." />}><UserBehaviorAnalytics /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/lgpd-compliance" element={<ProtectedRoute><AppLayout><LGPDCompliance /></AppLayout></ProtectedRoute>} />
                <Route path="/cobranca" element={<ProtectedRoute><AppLayout><Cobranca /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque" element={<ProtectedRoute><AppLayout><EstoqueDashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/cadastros" element={<ProtectedRoute><AppLayout><EstoqueCadastros /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/requisicoes" element={<ProtectedRoute><AppLayout><EstoqueRequisicoes /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/movimentacoes" element={<ProtectedRoute><AppLayout><EstoqueMovimentacoes /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/pedidos" element={<ProtectedRoute><AppLayout><EstoquePedidos /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/integracoes" element={<ProtectedRoute><AppLayout><EstoqueIntegracoes /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/analise-pedidos" element={<ProtectedRoute><AppLayout><EstoqueAnalisePedidos /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/analise-consumo" element={<ProtectedRoute><AppLayout><EstoqueAnaliseConsumo /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/scanner-mobile" element={<ProtectedRoute><AppLayout><EstoqueScannerMobile /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario" element={<ProtectedRoute><AppLayout><EstoqueInventario /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario/dashboard" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando dashboard..." />}><EstoqueInventarioDashboard /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario/historico" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando histórico..." />}><EstoqueInventarioHistorico /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/orcamentos" element={<ProtectedRoute><AppLayout><Orcamentos /></AppLayout></ProtectedRoute>} />
                <Route path="/contratos" element={<ProtectedRoute><AppLayout><Contratos /></AppLayout></ProtectedRoute>} />
                <Route path="/portal-paciente" element={<ProtectedRoute><AppLayout><PortalPaciente /></AppLayout></ProtectedRoute>} />
                <Route path="/teleodontologia" element={<ProtectedRoute><AppLayout><Teleodontologia /></AppLayout></ProtectedRoute>} />
                <Route path="/historico-teleconsultas" element={<ProtectedRoute><AppLayout><HistoricoTeleconsultas /></AppLayout></ProtectedRoute>} />
                <Route path="/ia-radiografia" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando IA..." />}><IARadiografia /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/crm" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando CRM..." />}><CRM /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/bi" element={<ProtectedRoute><AppLayout><BI /></AppLayout></ProtectedRoute>} />
                <Route path="/lgpd" element={<ProtectedRoute><AppLayout><LGPD /></AppLayout></ProtectedRoute>} />
                <Route path="/assinatura-digital" element={<ProtectedRoute><AppLayout><AssinaturaICP /></AppLayout></ProtectedRoute>} />
                <Route path="/marketing-auto" element={<ProtectedRoute><AppLayout><MarketingAuto /></AppLayout></ProtectedRoute>} />
                <Route path="/crm-funil" element={<ProtectedRoute><AppLayout><CRMFunil /></AppLayout></ProtectedRoute>} />
                <Route path="/split-pagamento" element={<ProtectedRoute><AppLayout><SplitPagamento /></AppLayout></ProtectedRoute>} />
                <Route path="/inadimplencia" element={<ProtectedRoute><AppLayout><Inadimplencia /></AppLayout></ProtectedRoute>} />
                <Route path="/programa-fidelidade" element={<ProtectedRoute><AppLayout><ProgramaFidelidade /></AppLayout></ProtectedRoute>} />
                <Route path="/report-templates" element={<ProtectedRoute requireAdmin><AppLayout><ReportTemplates /></AppLayout></ProtectedRoute>} />
                <Route path="/audit-logs" element={<ProtectedRoute requireAdmin><AppLayout><AuditLogs /></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute requireAdmin><AppLayout><Configuracoes /></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes/modulos" element={<ProtectedRoute requireAdmin><AppLayout><ModulesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/usuarios" element={<ProtectedRoute requireAdmin><AppLayout><Usuarios /></AppLayout></ProtectedRoute>} />
                <Route path="/ajuda" element={<ProtectedRoute><AppLayout><HelpCenter /></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes/analytics" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><OnboardingAnalytics /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes/backups-agendados" element={<ProtectedRoute requireAdmin><AppLayout><ScheduledBackupsManagement /></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes/backup-executivo" element={<ProtectedRoute requireAdmin><AppLayout><BackupExecutivePage /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv" element={<ProtectedRoute><AppLayout><PDV /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/dashboard" element={<ProtectedRoute><AppLayout><DashboardVendasPDV /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/executivo" element={<ProtectedRoute requireAdmin><AppLayout><DashboardExecutivoPDV /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/metas" element={<ProtectedRoute><AppLayout><MetasGamificacao /></AppLayout></ProtectedRoute>} />
                <Route path="/relatorio-caixa" element={<ProtectedRoute><AppLayout><RelatorioCaixa /></AppLayout></ProtectedRoute>} />
                <Route path="/settings/modules" element={<ProtectedRoute requireAdmin><AppLayout><ModulesAdmin /></AppLayout></ProtectedRoute>} />
                <Route path="/test-notifications" element={<ProtectedRoute><AppLayout><TestNotifications /></AppLayout></ProtectedRoute>} />
                <Route path="/settings/modules" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><ModulesAdmin /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/settings/modules-simple" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><ModulesSimple /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/settings/profile" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><ProfileSettings /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ModulesProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
