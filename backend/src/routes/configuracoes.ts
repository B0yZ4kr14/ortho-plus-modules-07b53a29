import { Request, Response, Router } from "express";

const router = Router();

// Full module catalog matching useModulos.ts expectations
const MODULE_CATALOG = [
  {
    id: 1,
    module_key: "DASHBOARD",
    name: "Dashboard",
    description: "Painel principal com KPIs e métricas",
    category: "CORE",
    is_active: true,
    dependencies: [],
  },
  {
    id: 2,
    module_key: "AGENDA",
    name: "Agenda",
    description: "Agendamento de consultas e procedimentos",
    category: "CORE",
    is_active: true,
    dependencies: [],
  },
  {
    id: 3,
    module_key: "PACIENTES",
    name: "Pacientes",
    description: "Gestão de pacientes e prontuários",
    category: "CORE",
    is_active: true,
    dependencies: [],
  },
  {
    id: 4,
    module_key: "PEP",
    name: "Prontuário Eletrônico",
    description: "Prontuário eletrônico do paciente",
    category: "CORE",
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 5,
    module_key: "FINANCEIRO",
    name: "Financeiro",
    description: "Gestão financeira e contas",
    category: "FINANCEIRO",
    is_active: true,
    dependencies: [],
  },
  {
    id: 6,
    module_key: "PDV",
    name: "Ponto de Venda",
    description: "Ponto de venda e cobranças",
    category: "FINANCEIRO",
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 7,
    module_key: "FISCAL",
    name: "Fiscal",
    description: "Emissão de notas fiscais",
    category: "FINANCEIRO",
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 8,
    module_key: "ESTOQUE",
    name: "Estoque",
    description: "Controle de materiais e insumos",
    category: "OPERACIONAL",
    is_active: true,
    dependencies: [],
  },
  {
    id: 9,
    module_key: "INVENTARIO",
    name: "Inventário",
    description: "Inventário e contagem de estoque",
    category: "OPERACIONAL",
    is_active: true,
    dependencies: ["ESTOQUE"],
  },
  {
    id: 10,
    module_key: "CRM",
    name: "CRM",
    description: "Gestão de leads e funil de vendas",
    category: "COMERCIAL",
    is_active: true,
    dependencies: [],
  },
  {
    id: 11,
    module_key: "FIDELIDADE",
    name: "Fidelidade",
    description: "Programa de fidelidade e pontos",
    category: "COMERCIAL",
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 12,
    module_key: "CRYPTO_PAYMENTS",
    name: "Pagamentos Crypto",
    description: "Pagamentos em criptomoedas",
    category: "FINANCEIRO",
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 13,
    module_key: "TELEODONTO",
    name: "Teleodonto",
    description: "Teleconsulta odontológica",
    category: "CLINICO",
    is_active: true,
    dependencies: ["PACIENTES", "AGENDA"],
  },
  {
    id: 14,
    module_key: "TISS",
    name: "TISS",
    description: "Integração com convênios via TISS",
    category: "CLINICO",
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 15,
    module_key: "BI",
    name: "Business Intelligence",
    description: "Relatórios avançados e BI",
    category: "ADMINISTRATIVO",
    is_active: true,
    dependencies: ["DASHBOARD"],
  },
  {
    id: 16,
    module_key: "LGPD",
    name: "LGPD",
    description: "Conformidade com Lei Geral de Proteção de Dados",
    category: "ADMINISTRATIVO",
    is_active: true,
    dependencies: [],
  },
];

// GET /api/configuracoes/modulos - List all modules
router.get("/modulos", (_req: Request, res: Response) => {
  res.json({ modules: MODULE_CATALOG });
});

// GET /api/configuracoes/modulos/dependencies - Get dependency graph
router.get("/modulos/dependencies", (_req: Request, res: Response) => {
  const deps = MODULE_CATALOG.filter(
    (m) => m.dependencies && m.dependencies.length > 0,
  ).map((m) => ({
    module_key: m.module_key,
    depends_on: m.dependencies,
  }));

  res.json({ dependencies: deps });
});

// POST /api/configuracoes/modulos/:id/toggle - Toggle module active state
router.post("/modulos/:id/toggle", (req: Request, res: Response) => {
  const moduleId = parseInt(req.params.id, 10);
  const mod = MODULE_CATALOG.find((m) => m.id === moduleId);

  if (!mod) {
    return res.status(404).json({ error: "Módulo não encontrado" });
  }

  // Check dependencies for activation
  if (!mod.is_active && mod.dependencies && mod.dependencies.length > 0) {
    const unmet = mod.dependencies.filter(
      (dep) => !MODULE_CATALOG.find((m) => m.module_key === dep && m.is_active),
    );
    if (unmet.length > 0) {
      return res.status(412).json({
        error: `Dependências não atendidas: ${unmet.join(", ")}`,
        unmetDependencies: unmet,
      });
    }
  }

  // Check if other active modules depend on this one for deactivation
  if (mod.is_active) {
    const dependents = MODULE_CATALOG.filter(
      (m) =>
        m.is_active &&
        m.dependencies &&
        m.dependencies.includes(mod.module_key),
    );
    if (dependents.length > 0) {
      return res.status(412).json({
        error: `Módulo tem dependentes ativos: ${dependents.map((d) => d.name).join(", ")}`,
        activeDependents: dependents.map((d) => d.module_key),
      });
    }
  }

  mod.is_active = !mod.is_active;
  return res.json({
    module: mod,
    message: `Módulo ${mod.is_active ? "ativado" : "desativado"} com sucesso`,
  });
});

export default router;
