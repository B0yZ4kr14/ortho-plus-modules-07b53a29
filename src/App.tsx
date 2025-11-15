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
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { initPerformanceMonitoring } from '@/lib/performance';
import { lazy, Suspense, useEffect } from 'react';
// ✅ FASE 1 & 2: Lazy loading para páginas do V4.0
const AuditTrailViewer = lazy(() => import('./pages/AuditTrailViewer'));
const QuickChart = lazy(() => import('./pages/QuickChart'));
const RecallPage = lazy(() => import('./pages/Recall'));
const TemplatesProcedimentosPage = lazy(() => import('./pages/TemplatesProcedimentos'));

// Core imports (não lazy)
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PatientDetail from "./pages/PatientDetail";
import PatientForm from "./pages/PatientForm";
import Dentistas from "./pages/Dentistas";
import Funcionarios from "./pages/Funcionarios";
import Procedimentos from "./pages/Procedimentos";
import { FinanceiroPage } from "./modules/financeiro/ui/pages/FinanceiroPage";
import { MarketingAutoPage } from './modules/marketing-auto/ui/pages/MarketingAutoPage';
import { OrcamentosPage } from './modules/orcamentos/ui/pages/OrcamentosPage';
import { EstoquePage } from './modules/estoque/ui/pages/EstoquePage';
import Resumo from "./pages/Resumo";
import AgendaClinica from "./pages/AgendaClinica";
import Configuracoes from './pages/Configuracoes';
import PEP from './pages/PEP';
import HelpCenter from "./pages/HelpCenter";
import Usuarios from "./pages/Usuarios";
import { AgendaPage } from '@/modules/agenda/ui/pages/AgendaPage';
import { ProductTour } from './components/tour/ProductTour';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// ✅ FASE 2: Lazy load páginas pesadas
const Relatorios = lazy(() => import('./pages/Relatorios'));
const BusinessIntelligence = lazy(() => import('./pages/BusinessIntelligence'));
const IARadiografia = lazy(() => import('@/pages/IARadiografia'));
const UserBehaviorAnalytics = lazy(() => import("@/pages/UserBehaviorAnalytics"));
const OnboardingAnalytics = lazy(() => import('./pages/settings/OnboardingAnalytics'));
const ModulesAdmin = lazy(() => import('./pages/settings/ModulesAdmin'));
const ModulesSimple = lazy(() => import('./pages/settings/ModulesSimple'));
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const CRM = lazy(() => import('./pages/crm'));
const Teleodontologia = lazy(() => import('./pages/teleodonto'));
const EstoqueInventarioHistorico = lazy(() => import('@/pages/estoque/EstoqueInventarioHistorico'));
const EstoqueInventarioDashboard = lazy(() => import('@/pages/estoque/EstoqueInventarioDashboard'));
const ReportTemplates = lazy(() => import('@/pages/ReportTemplates'));
const AuditLogs = lazy(() => import('@/pages/AuditLogs'));
const LGPDCompliance = lazy(() => import("@/pages/LGPDCompliance"));
const Cobranca = lazy(() => import('@/pages/Cobranca'));
const ScheduledBackupsManagement = lazy(() => import('./pages/settings/ScheduledBackupsManagement'));
const BackupExecutivePage = lazy(() => import('./pages/settings/BackupExecutivePage'));
const ModulesPage = lazy(() => import('./pages/settings/ModulesPage'));
const EstoqueDashboard = lazy(() => import('@/pages/estoque/EstoqueDashboard'));
const EstoqueCadastros = lazy(() => import('@/pages/estoque/EstoqueCadastros'));
const EstoqueRequisicoes = lazy(() => import('@/pages/estoque/EstoqueRequisicoes'));
const EstoqueMovimentacoes = lazy(() => import('@/pages/estoque/EstoqueMovimentacoes'));
const EstoqueAnaliseConsumo = lazy(() => import('@/pages/estoque/EstoqueAnaliseConsumo'));
const EstoquePedidos = lazy(() => import('@/pages/estoque/EstoquePedidos'));
const EstoqueIntegracoes = lazy(() => import('@/pages/estoque/EstoqueIntegracoes'));
const EstoqueAnalisePedidos = lazy(() => import('@/pages/estoque/EstoqueAnalisePedidos'));
const EstoqueScannerMobile = lazy(() => import('@/pages/estoque/EstoqueScannerMobile'));
const EstoqueInventario = lazy(() => import('@/pages/estoque/EstoqueInventario'));
const ContasReceber = lazy(() => import('@/pages/financeiro/ContasReceber'));
const ContasPagar = lazy(() => import('@/pages/financeiro/ContasPagar'));
const NotasFiscais = lazy(() => import('@/pages/financeiro/NotasFiscais'));
const Transacoes = lazy(() => import('@/pages/financeiro/Transacoes'));
const CryptoPagamentos = lazy(() => import('@/pages/financeiro/CryptoPagamentos'));
const ConciliacaoBancaria = lazy(() => import('@/pages/financeiro/ConciliacaoBancaria'));
const DashboardVendasPDV = lazy(() => import('./pages/financeiro/DashboardVendasPDV'));
const Orcamentos = lazy(() => import('@/pages/Orcamentos'));
const Contratos = lazy(() => import('@/pages/Contratos'));
const PortalPaciente = lazy(() => import('@/pages/PortalPaciente'));
const HistoricoTeleconsultas = lazy(() => import('./pages/HistoricoTeleconsultas'));
const CRMFunil = lazy(() => import('@/pages/CRMFunil'));
const CRMPage = lazy(() => import('@/pages/crm'));
const RadiografiaPage = lazy(() => import('@/pages/radiografia'));
const CryptoPaymentPage = lazy(() => import('@/pages/crypto-payment'));
const TeleodontoPage = lazy(() => import('@/pages/teleodonto'));
const SplitPagamentoPage = lazy(() => import('@/pages/split-pagamento'));
const InadimplenciaPage = lazy(() => import('@/pages/inadimplencia'));
const BIDashboardPage = lazy(() => import('@/pages/bi-dashboard'));
const LGPDPage = lazy(() => import('@/pages/lgpd'));
const TISSPage = lazy(() => import('@/pages/tiss'));
const MarketingAuto = lazy(() => import('@/pages/MarketingAuto'));
const AssinaturaICP = lazy(() => import('@/pages/AssinaturaICP'));
const ProgramaFidelidade = lazy(() => import('@/pages/ProgramaFidelidade'));
const PDV = lazy(() => import('@/pages/PDV'));
const RelatorioCaixa = lazy(() => import('@/pages/RelatorioCaixa'));
const TestNotifications = lazy(() => import('@/pages/TestNotifications'));
const MetasGamificacao = lazy(() => import('./pages/pdv/MetasGamificacao'));
const DashboardExecutivoPDV = lazy(() => import('./pages/pdv/DashboardExecutivoPDV'));
const TerminalPage = lazy(() => import('./pages/admin/TerminalPage'));
const GitHubManagerPage = lazy(() => import('./pages/admin/GitHubManagerPage'));
const DatabaseMaintenancePage = lazy(() => import('./pages/admin/DatabaseMaintenancePage'));
const WikiPage = lazy(() => import('./pages/admin/WikiPage'));
const ADRsPage = lazy(() => import('./pages/admin/ADRsPage'));
const MonitoringPage = lazy(() => import('./pages/admin/MonitoringPage'));
const SystemLogsPage = lazy(() => import('./pages/admin/SystemLogsPage'));
const ApiDocsPage = lazy(() => import('./pages/admin/ApiDocsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}

function HotkeysManager() {
  useHotkeys();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <HotkeysManager />
          <PerformanceMonitor />
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
                {/* FINANCEIRO Module - Clean Architecture */}
                <Route path="/financeiro" element={<ProtectedRoute><AppLayout><FinanceiroPage /></AppLayout></ProtectedRoute>} />
                {/* MARKETING_AUTO Module - Clean Architecture */}
                <Route path="/marketing-auto" element={<ProtectedRoute><AppLayout><MarketingAutoPage /></AppLayout></ProtectedRoute>} />
                {/* ORCAMENTOS Module - Clean Architecture */}
                <Route path="/orcamentos" element={<ProtectedRoute><AppLayout><OrcamentosPage /></AppLayout></ProtectedRoute>} />
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
                <Route path="/estoque" element={<ProtectedRoute><AppLayout><EstoquePage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/dashboard" element={<ProtectedRoute><AppLayout><EstoqueDashboard /></AppLayout></ProtectedRoute>} />
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
                <Route path="/crm-kanban" element={<ProtectedRoute><AppLayout><CRMPage /></AppLayout></ProtectedRoute>} />
                <Route path="/radiografia" element={<ProtectedRoute><AppLayout><RadiografiaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/crypto-payment" element={<ProtectedRoute><AppLayout><CryptoPaymentPage /></AppLayout></ProtectedRoute>} />
                <Route path="/teleodonto" element={<ProtectedRoute><AppLayout><TeleodontoPage /></AppLayout></ProtectedRoute>} />
                <Route path="/bi-dashboard" element={<ProtectedRoute><AppLayout><BIDashboardPage /></AppLayout></ProtectedRoute>} />
                <Route path="/lgpd" element={<ProtectedRoute><AppLayout><LGPDPage /></AppLayout></ProtectedRoute>} />
                <Route path="/tiss" element={<ProtectedRoute><AppLayout><TISSPage /></AppLayout></ProtectedRoute>} />
                <Route path="/assinatura-digital" element={<ProtectedRoute><AppLayout><AssinaturaICP /></AppLayout></ProtectedRoute>} />
                <Route path="/marketing-auto" element={<ProtectedRoute><AppLayout><MarketingAuto /></AppLayout></ProtectedRoute>} />
                <Route path="/crm-funil" element={<ProtectedRoute><AppLayout><CRMFunil /></AppLayout></ProtectedRoute>} />
                <Route path="/split-pagamento" element={<ProtectedRoute><AppLayout><SplitPagamentoPage /></AppLayout></ProtectedRoute>} />
                <Route path="/inadimplencia" element={<ProtectedRoute><AppLayout><InadimplenciaPage /></AppLayout></ProtectedRoute>} />
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
                
                {/* V4.0 Routes - Audit Trail, Quick Chart, Recall, Templates */}
                <Route path="/admin/audit-trail" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><AuditTrailViewer /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/quick-chart/:patientId" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><QuickChart /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/recall" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><RecallPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/templates-procedimentos" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><TemplatesProcedimentosPage /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* Admin Routes - Enterprise Tools */}
                <Route path="/admin/terminal" element={<ProtectedRoute requireAdmin><AppLayout><TerminalPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/github" element={<ProtectedRoute requireAdmin><AppLayout><GitHubManagerPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/database-maintenance" element={<ProtectedRoute requireAdmin><AppLayout><DatabaseMaintenancePage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/wiki" element={<ProtectedRoute requireAdmin><AppLayout><WikiPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/adrs" element={<ProtectedRoute requireAdmin><AppLayout><ADRsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/monitoring" element={<ProtectedRoute requireAdmin><AppLayout><MonitoringPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute requireAdmin><AppLayout><SystemLogsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/api-docs" element={<ProtectedRoute requireAdmin><AppLayout><ApiDocsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/backups" element={<ProtectedRoute requireAdmin><AppLayout><BackupExecutivePage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/sql-query" element={<ProtectedRoute requireAdmin><AppLayout><BackupExecutivePage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/migrations" element={<ProtectedRoute requireAdmin><AppLayout><BackupExecutivePage /></AppLayout></ProtectedRoute>} />
                
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
