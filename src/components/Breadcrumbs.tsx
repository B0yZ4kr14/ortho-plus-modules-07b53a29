import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mapeamento de rotas para labels legíveis
const routeLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'pacientes': 'Pacientes',
  'dentistas': 'Dentistas',
  'funcionarios': 'Funcionários',
  'agenda': 'Agenda',
  'procedimentos': 'Procedimentos',
  'pep': 'Prontuário (PEP)',
  'financeiro': 'Financeiro',
  'transacoes': 'Transações',
  'contas-receber': 'Contas a Receber',
  'contas-pagar': 'Contas a Pagar',
  'notas-fiscais': 'Notas Fiscais',
  'crypto-pagamentos': 'Pagamentos Cripto',
  'orcamentos': 'Orçamentos',
  'contratos': 'Contratos',
  'crm': 'CRM',
  'crm-funil': 'CRM',
  'cobranca': 'Cobrança',
  'split-pagamento': 'Split de Pagamento',
  'fidelidade': 'Programa de Fidelidade',
  'bi': 'Business Intelligence',
  'relatorios': 'Relatórios',
  'lgpd-compliance': 'Compliance LGPD',
  'teleodontologia': 'Teleodontologia',
  'historico': 'Histórico de Consultas',
  'ia-radiografia': 'IA para Radiografia',
  'portal-paciente': 'Portal do Paciente',
  'configuracoes': 'Configurações',
  'modulos': 'Gestão de Módulos',
  'audit-logs': 'Logs de Auditoria',
  'estoque': 'Estoque',
  'cadastros': 'Cadastros',
  'movimentacoes': 'Movimentações',
  'pedidos': 'Pedidos',
  'requisicoes': 'Requisições',
  'analise-consumo': 'Análise de Consumo',
  'analise-pedidos': 'Análise de Pedidos',
  'integracoes': 'Integrações',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Não mostrar breadcrumbs na página inicial
  if (pathnames.length === 0 || location.pathname === '/') {
    return null;
  }

  return (
    <div className="bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
      <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);

          return (
            <BreadcrumbItem key={routeTo}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={routeTo}>{label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
