import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BackendProvider } from "@/lib/providers/BackendProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useHotkeys } from "@/hooks/useHotkeys";
import { LoadingState } from '@/components/shared/LoadingState';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { initPerformanceMonitoring } from '@/lib/performance';
import { lazy, Suspense, useEffect } from 'react';
// ✅ FASE 1 & 2: Lazy loading para páginas do V4.0
const AuditTrailViewer = lazy(() => import('./modules/admin/ui/pages/AuditTrailViewer'));
const QuickChart = lazy(() => import('./modules/pep/ui/pages/QuickChart'));
const RecallPage = lazy(() => import('./modules/marketing-auto/ui/pages/Recall'));
const TemplatesProcedimentosPage = lazy(() => import('./modules/procedimentos/ui/pages/TemplatesProcedimentos'));

// Core imports (não lazy)
import Demo from "./modules/core/ui/pages/Demo";
import DashboardUnified from "./modules/dashboard/ui/pages/DashboardUnified";
import PacientesListPage from "./modules/pacientes/ui/pages/PacientesListPage";
import PatientDetailPage from "./modules/pacientes/ui/pages/PatientDetailPage";
import PatientFormPage from "./modules/pacientes/ui/pages/PatientFormPage";
import DentistasPage from "./modules/dentistas/ui/pages/DentistasPage";
import FuncionariosPage from "./modules/funcionarios/ui/pages/FuncionariosPage";
import ProcedimentosPage from "./modules/procedimentos/ui/pages/ProcedimentosPage";
import CobrancaPage from "./modules/cobranca/ui/pages/CobrancaPage";
import { FinanceiroPage } from "./modules/financeiro/ui/pages/FinanceiroPage";
import { MarketingAutoPage } from './modules/marketing-auto/ui/pages/MarketingAutoPage';
import { OrcamentosPage } from './modules/orcamentos/ui/pages/OrcamentosPage';
import { EstoquePage } from './modules/estoque/ui/pages/EstoquePage';
import EstoqueDashboardPage from './modules/estoque/ui/pages/EstoqueDashboardPage';
import EstoqueMovimentacoesPage from './modules/estoque/ui/pages/EstoqueMovimentacoesPage';
import EstoqueCadastrosPage from './modules/estoque/ui/pages/EstoqueCadastrosPage';
import EstoquePedidosPage from './modules/estoque/ui/pages/EstoquePedidosPage';
import EstoqueInventarioPage from './modules/estoque/ui/pages/EstoqueInventarioPage';
import EstoqueRequisicoesPage from './modules/estoque/ui/pages/EstoqueRequisicoesPage';
import AgendaClinicaPage from "./modules/agenda/ui/pages/AgendaClinicaPage";
import Configuracoes from './modules/admin/ui/pages/Configuracoes';
import PEPPage from './modules/pep/ui/pages/PEPPage';
import HelpCenter from "./modules/admin/ui/pages/HelpCenter";
import Usuarios from "./modules/admin/ui/pages/Usuarios";
import { AgendaPage } from '@/modules/agenda/ui/pages/AgendaPage';
import { ProductTour } from './components/tour/ProductTour';
import Auth from './modules/auth/ui/pages/Auth';
import ResetPassword from './modules/auth/ui/pages/ResetPassword';
import NotFound from './modules/core/ui/pages/NotFound';
import Forbidden from './modules/core/ui/pages/Forbidden';

// Dashboards de Categoria - removidos no V5.1 (consolidados no DashboardUnified)

// ✅ FASE 2: Lazy load páginas pesadas
const Relatorios = lazy(() => import('./modules/bi/ui/pages/Relatorios'));
const BusinessIntelligence = lazy(() => import('./modules/bi/ui/pages'));
const IARadiografia = lazy(() => import('@/modules/ia-radiografia/ui/pages/IARadiografia'));
const UserBehaviorAnalytics = lazy(() => import("@/modules/bi/ui/pages/UserBehaviorAnalytics"));
const OnboardingAnalytics = lazy(() => import('./modules/settings/ui/pages/OnboardingAnalytics'));
const ModulesAdmin = lazy(() => import('./modules/settings/ui/pages/ModulesAdmin'));
const ModulesSimple = lazy(() => import('./modules/settings/ui/pages/ModulesSimple'));
const ProfileSettings = lazy(() => import('./modules/settings/ui/pages/ProfileSettings'));
const CRM = lazy(() => import('./modules/crm/ui/pages/crm'));
const Teleodontologia = lazy(() => import('./modules/teleodonto/ui/pages/teleodonto'));
const EstoqueInventarioHistorico = lazy(() => import('@/modules/estoque/ui/pages/EstoqueInventarioHistorico'));
const EstoqueInventarioDashboard = lazy(() => import('@/modules/estoque/ui/pages/EstoqueInventarioDashboard'));
const ReportTemplates = lazy(() => import('@/modules/bi/ui/pages/ReportTemplates'));
const AuditLogs = lazy(() => import('@/modules/admin/ui/pages/AuditLogs'));
const LGPDCompliance = lazy(() => import("@/modules/lgpd/ui/pages"));
// Cobranca migrated to module
const ScheduledBackupsManagement = lazy(() => import('./modules/settings/ui/pages/ScheduledBackupsManagement'));
const BackupExecutivePage = lazy(() => import('./modules/settings/ui/pages/BackupExecutivePage'));
const ModulesPage = lazy(() => import('./modules/settings/ui/pages/ModulesPage'));

// V4.0 - New Pages
const PatientDetailV2 = lazy(() => import('./modules/pacientes/ui/pages/PatientDetail-v2'));
const FluxoDigital = lazy(() => import('./modules/pep/ui/pages/FluxoDigital'));
const DashboardComercialROI = lazy(() => import('./modules/dashboards/ui/pages/DashboardComercial'));
const EstoqueAnaliseConsumo = lazy(() => import('@/modules/estoque/ui/pages/EstoqueAnaliseConsumo'));
const EstoqueIntegracoes = lazy(() => import('@/modules/estoque/ui/pages/EstoqueIntegracoes'));
const EstoqueAnalisePedidos = lazy(() => import('@/modules/estoque/ui/pages/EstoqueAnalisePedidos'));
const EstoqueScannerMobile = lazy(() => import('@/modules/estoque/ui/pages/EstoqueScannerMobile'));
const ContasReceber = lazy(() => import('@/modules/financeiro/ui/pages/ContasReceber'));
const ContasPagar = lazy(() => import('@/modules/financeiro/ui/pages/ContasPagar'));
const NotasFiscais = lazy(() => import('@/modules/financeiro/ui/pages/NotasFiscais'));
const Transacoes = lazy(() => import('@/modules/financeiro/ui/pages/Transacoes'));
const CryptoPagamentos = lazy(() => import('@/modules/financeiro/ui/pages/CryptoPagamentos'));
const ConciliacaoBancaria = lazy(() => import('@/modules/financeiro/ui/pages/ConciliacaoBancaria'));
const DashboardVendasPDV = lazy(() => import('./modules/financeiro/ui/pages/DashboardVendasPDV'));
const CRMFunil = lazy(() => import('@/modules/crm/ui/pages/CRMFunil'));
const RadiografiaPage = lazy(() => import('@/modules/ia-radiografia/ui/pages/radiografia'));
const CryptoPaymentPage = lazy(() => import('@/modules/crypto/ui/pages/CryptoPaymentPage'));
const SplitPagamentoPage = lazy(() => import('@/modules/split-pagamento/ui/pages/split-pagamento'));
const InadimplenciaPage = lazy(() => import('@/modules/cobranca/ui/pages/inadimplencia'));
const BIDashboardPage = lazy(() => import('@/modules/bi/ui/pages/bi-dashboard'));
const TISSPage = lazy(() => import('@/modules/tiss/ui/pages/tiss'));
const AssinaturaICP = lazy(() => import('@/modules/pep/ui/pages/AssinaturaICP'));
const ProgramaFidelidade = lazy(() => import('@/modules/marketing-auto/ui/pages/ProgramaFidelidade'));
const PDVPage = lazy(() => import('@/modules/pdv/ui/pages/PDVPage'));
const RelatorioCaixa = lazy(() => import('@/modules/financeiro/ui/pages/RelatorioCaixa'));
const MetasGamificacao = lazy(() => import('./modules/pdv/ui/pages/MetasGamificacao'));

// V5.3 COHERENCE: New pages with module permissions
import ContratosPage from './modules/contratos/ui/pages/Contratos';
import FidelidadePage from './modules/marketing-auto/ui/pages/Fidelidade';
import InventarioDashboard from './modules/inventario/ui/pages/Dashboard';
import PortalPacientePage from './modules/portal-paciente/ui/pages/PortalPaciente';
const DashboardExecutivoPDV = lazy(() => import('./modules/pdv/ui/pages/DashboardExecutivoPDV'));
const TerminalPage = lazy(() => import('./modules/admin/ui/pages/TerminalPage'));
const GitHubManagerPage = lazy(() => import('./modules/admin/ui/pages/GitHubManagerPage'));
const DatabaseMaintenancePage = lazy(() => import('./modules/admin/ui/pages/DatabaseMaintenancePage'));
const BackupsPage = lazy(() => import('./modules/admin/ui/pages/BackupsPage'));
const CryptoConfigPage = lazy(() => import('./modules/admin/ui/pages/CryptoConfigPage'));
const WikiPage = lazy(() => import('./modules/admin/ui/pages/WikiPage'));
const ADRsPage = lazy(() => import('./modules/admin/ui/pages/ADRsPage'));
const MonitoringPage = lazy(() => import('./modules/admin/ui/pages/MonitoringPage'));
const SystemLogsPage = lazy(() => import('./modules/admin/ui/pages/SystemLogsPage'));
const ApiDocsPage = lazy(() => import('./modules/admin/ui/pages/ApiDocsPage'));

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
          <BackendProvider>
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
                <Route path="/" element={<ProtectedRoute><AppLayout><DashboardUnified /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes" element={<ProtectedRoute moduleKey="PACIENTES"><AppLayout><PacientesListPage /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/novo" element={<ProtectedRoute moduleKey="PACIENTES"><AppLayout><PatientFormPage /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/editar/:id" element={<ProtectedRoute moduleKey="PACIENTES"><AppLayout><PatientFormPage /></AppLayout></ProtectedRoute>} />
                <Route path="/pacientes/:id" element={<ProtectedRoute moduleKey="PACIENTES"><AppLayout><PatientDetailPage /></AppLayout></ProtectedRoute>} />
                <Route path="/dentistas" element={<ProtectedRoute moduleKey="DENTISTAS"><AppLayout><DentistasPage /></AppLayout></ProtectedRoute>} />
                <Route path="/funcionarios" element={<ProtectedRoute moduleKey="FUNCIONARIOS"><AppLayout><FuncionariosPage /></AppLayout></ProtectedRoute>} />
                <Route path="/procedimentos" element={<ProtectedRoute moduleKey="PROCEDIMENTOS"><AppLayout><ProcedimentosPage /></AppLayout></ProtectedRoute>} />
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
                {/* V4.0 New Routes */}
                <Route path="/fluxo-digital" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando..." />}><FluxoDigital /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/dashboards/comercial-roi" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando..." />}><DashboardComercialROI /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/metas" element={<ProtectedRoute><AppLayout><MetasGamificacao /></AppLayout></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><AppLayout><AgendaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando relatórios..." />}><Relatorios /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/business-intelligence" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando BI..." />}><BusinessIntelligence /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/bi" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando BI..." />}><BusinessIntelligence /></Suspense></AppLayout></ProtectedRoute>} />
                {/* Dashboards de Categoria - Removidos no V5.1 (consolidados no DashboardUnified) */}
                <Route path="/analise-comportamental" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando analytics..." />}><UserBehaviorAnalytics /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/lgpd" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando..." />}><LGPDCompliance /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/cobranca" element={<ProtectedRoute moduleKey="INADIMPLENCIA"><AppLayout><CobrancaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque" element={<ProtectedRoute><AppLayout><EstoquePage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/dashboard" element={<ProtectedRoute><AppLayout><EstoqueDashboardPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/cadastros" element={<ProtectedRoute><AppLayout><EstoqueCadastrosPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/requisicoes" element={<ProtectedRoute><AppLayout><EstoqueRequisicoesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/movimentacoes" element={<ProtectedRoute><AppLayout><EstoqueMovimentacoesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/pedidos" element={<ProtectedRoute><AppLayout><EstoquePedidosPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/integracoes" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" />}><EstoqueIntegracoes /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/analise-pedidos" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" />}><EstoqueAnalisePedidos /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/analise-consumo" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" />}><EstoqueAnaliseConsumo /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/scanner-mobile" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" />}><EstoqueScannerMobile /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario" element={<ProtectedRoute><AppLayout><EstoqueInventarioPage /></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario/dashboard" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando dashboard..." />}><EstoqueInventarioDashboard /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/estoque/inventario/historico" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando histórico..." />}><EstoqueInventarioHistorico /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* V5.3 COHERENCE: New routes with module permission guards */}
                <Route path="/contratos" element={<ProtectedRoute moduleKey="CONTRATOS"><AppLayout><ContratosPage /></AppLayout></ProtectedRoute>} />
                <Route path="/fidelidade" element={<ProtectedRoute moduleKey="FIDELIDADE"><AppLayout><FidelidadePage /></AppLayout></ProtectedRoute>} />
                <Route path="/inventario/dashboard" element={<ProtectedRoute moduleKey="INVENTARIO"><AppLayout><InventarioDashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/portal-paciente" element={<ProtectedRoute moduleKey="PORTAL_PACIENTE"><AppLayout><PortalPacientePage /></AppLayout></ProtectedRoute>} />
                
                <Route path="/teleodonto" element={<ProtectedRoute><AppLayout><Teleodontologia /></AppLayout></ProtectedRoute>} />
                <Route path="/teleodontologia" element={<ProtectedRoute><AppLayout><Teleodontologia /></AppLayout></ProtectedRoute>} />
                <Route path="/ia-radiografia" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando IA..." />}><IARadiografia /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/crm" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando CRM..." />}><CRM /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/crm-kanban" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState size="lg" message="Carregando CRM..." />}><CRM /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/radiografia" element={<ProtectedRoute><AppLayout><RadiografiaPage /></AppLayout></ProtectedRoute>} />
                <Route path="/crypto-payment" element={<ProtectedRoute><AppLayout><CryptoPaymentPage /></AppLayout></ProtectedRoute>} />
                <Route path="/bi-dashboard" element={<ProtectedRoute><AppLayout><BIDashboardPage /></AppLayout></ProtectedRoute>} />
                <Route path="/tiss" element={<ProtectedRoute><AppLayout><TISSPage /></AppLayout></ProtectedRoute>} />
                <Route path="/assinatura-digital" element={<ProtectedRoute><AppLayout><AssinaturaICP /></AppLayout></ProtectedRoute>} />
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
                <Route path="/pdv" element={<ProtectedRoute><AppLayout><PDVPage /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/dashboard" element={<ProtectedRoute><AppLayout><DashboardVendasPDV /></AppLayout></ProtectedRoute>} />
                <Route path="/pdv/executivo" element={<ProtectedRoute requireAdmin><AppLayout><DashboardExecutivoPDV /></AppLayout></ProtectedRoute>} />
                <Route path="/relatorio-caixa" element={<ProtectedRoute><AppLayout><RelatorioCaixa /></AppLayout></ProtectedRoute>} />
                <Route path="/settings/modules" element={<ProtectedRoute requireAdmin><AppLayout><ModulesAdmin /></AppLayout></ProtectedRoute>} />
                <Route path="/settings/modules-simple" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><ModulesSimple /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/settings/profile" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><ProfileSettings /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* V4.0 Routes - Audit Trail, Quick Chart, Recall, Templates */}
                <Route path="/admin/audit-trail" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><AuditTrailViewer /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/quick-chart/:patientId" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><QuickChart /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/recall" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><RecallPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/templates-procedimentos" element={<ProtectedRoute><AppLayout><Suspense fallback={<LoadingState />}><TemplatesProcedimentosPage /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* Admin Routes - Enterprise Tools */}
                <Route path="/admin/terminal" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><TerminalPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/github" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><GitHubManagerPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/database" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><DatabaseMaintenancePage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/backups" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><BackupsPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/crypto" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><CryptoConfigPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/wiki" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><WikiPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/adrs" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><ADRsPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/monitoring" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><MonitoringPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><SystemLogsPage /></Suspense></AppLayout></ProtectedRoute>} />
                <Route path="/admin/api-docs" element={<ProtectedRoute requireAdmin><AppLayout><Suspense fallback={<LoadingState />}><ApiDocsPage /></Suspense></AppLayout></ProtectedRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ModulesProvider>
          </AuthProvider>
          </BackendProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
