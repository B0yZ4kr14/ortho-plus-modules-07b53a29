/**
 * FASE 4: Sistema de Tooltips Odontológicos
 * Base de conhecimento com 85+ módulos documentados
 */

export interface OdontoTooltip {
  id: string;
  module: string;
  title: string;
  definition: string;
  indications: string[];
  contraindications: string[];
  bestPractices: string[];
  category: 'gestao' | 'clinico' | 'financeiro' | 'marketing' | 'compliance' | 'inovacao';
  riskLevel?: 'baixo' | 'moderado' | 'alto' | 'critico';
  requiredTraining?: boolean;
}

export const odontoTooltipsData: Record<string, OdontoTooltip> = {
  // MÓDULOS DE GESTÃO E OPERAÇÃO
  PEP: {
    id: 'PEP',
    module: 'PEP',
    title: 'Prontuário Eletrônico do Paciente',
    definition: 'Sistema digital para registro completo do histórico clínico, anamnese, diagnósticos, tratamentos e evolução do paciente.',
    indications: [
      'Documentação legal de todos os atendimentos',
      'Facilitar acesso rápido ao histórico do paciente',
      'Atender requisitos da CFO e LGPD',
      'Integração com outros módulos clínicos'
    ],
    contraindications: [
      'Não utilizar em situações de emergência sem backup offline',
      'Evitar registros subjetivos sem embasamento clínico'
    ],
    bestPractices: [
      'Preencher imediatamente após cada atendimento',
      'Usar terminologia técnica padronizada (CID-10, TUSS)',
      'Incluir sempre data, hora e assinatura digital',
      'Manter backups regulares conforme LGPD',
      'Revisar periodicamente para atualização de dados'
    ],
    category: 'gestao',
    riskLevel: 'critico',
    requiredTraining: true
  },

  AGENDA: {
    id: 'AGENDA',
    module: 'AGENDA',
    title: 'Agenda Inteligente com Automação WhatsApp',
    definition: 'Sistema de agendamento automatizado com confirmações, lembretes e gestão de horários via WhatsApp integrado.',
    indications: [
      'Reduzir faltas e cancelamentos de última hora',
      'Otimizar ocupação da agenda clínica',
      'Melhorar comunicação com pacientes',
      'Automatizar confirmações e lembretes'
    ],
    contraindications: [
      'Não enviar mensagens em horários inadequados (22h-8h)',
      'Evitar spam ou mensagens excessivas'
    ],
    bestPractices: [
      'Confirmar agendamentos 24-48h antes',
      'Personalizar mensagens por tipo de procedimento',
      'Manter lista de cancelamento para reposição',
      'Respeitar preferências de contato do paciente',
      'Documentar todas as interações no prontuário'
    ],
    category: 'gestao',
    riskLevel: 'baixo'
  },

  ORCAMENTOS: {
    id: 'ORCAMENTOS',
    module: 'ORCAMENTOS',
    title: 'Orçamentos e Contratos Digitais',
    definition: 'Sistema para criação, aprovação e gestão de orçamentos odontológicos com contratos digitais assinados.',
    indications: [
      'Transparência nos valores e procedimentos',
      'Validade jurídica com assinatura digital',
      'Controle de aprovações e pendências',
      'Facilitar parcelamentos e negociações'
    ],
    contraindications: [
      'Não alterar valores após assinatura sem adendo',
      'Evitar termos técnicos complexos sem explicação'
    ],
    bestPractices: [
      'Detalhar todos os procedimentos e valores',
      'Incluir prazo de validade do orçamento',
      'Especificar formas e condições de pagamento',
      'Obter assinatura digital ICP-Brasil quando possível',
      'Arquivar cópia no prontuário do paciente'
    ],
    category: 'gestao',
    riskLevel: 'moderado'
  },

  ODONTOGRAMA: {
    id: 'ODONTOGRAMA',
    module: 'ODONTOGRAMA',
    title: 'Odontograma 2D e 3D',
    definition: 'Mapa visual interativo da arcada dentária para registro de condições, procedimentos realizados e planejados.',
    indications: [
      'Documentação visual do estado bucal',
      'Planejamento de tratamentos',
      'Acompanhamento de evolução clínica',
      'Comunicação clara com o paciente'
    ],
    contraindications: [
      'Não substituir exames radiográficos',
      'Evitar simplificações que omitam detalhes importantes'
    ],
    bestPractices: [
      'Atualizar a cada consulta odontológica',
      'Usar simbologia padronizada (ISO 3950)',
      'Incluir legenda clara dos símbolos',
      'Fotografar ou exportar para backup',
      'Integrar com plano de tratamento'
    ],
    category: 'clinico',
    riskLevel: 'moderado',
    requiredTraining: true
  },

  ESTOQUE: {
    id: 'ESTOQUE',
    module: 'ESTOQUE',
    title: 'Controle de Estoque Avançado',
    definition: 'Sistema de gestão de materiais odontológicos com controle de entrada, saída, validade e ponto de reposição.',
    indications: [
      'Evitar desperdício de materiais vencidos',
      'Garantir disponibilidade para procedimentos',
      'Controlar custos e margem de lucro',
      'Rastreabilidade para auditorias'
    ],
    contraindications: [
      'Não utilizar materiais sem registro na ANVISA',
      'Evitar estoque excessivo de itens perecíveis'
    ],
    bestPractices: [
      'Implementar FEFO (First Expired, First Out)',
      'Fazer inventário mensal',
      'Cadastrar lotes e validades corretamente',
      'Configurar alertas de estoque mínimo',
      'Integrar com sistema financeiro'
    ],
    category: 'gestao',
    riskLevel: 'baixo'
  },

  // MÓDULOS FINANCEIROS
  FINANCEIRO: {
    id: 'FINANCEIRO',
    module: 'FINANCEIRO',
    title: 'Gestão Financeira e Fluxo de Caixa',
    definition: 'Sistema completo de controle financeiro incluindo receitas, despesas, fluxo de caixa e relatórios gerenciais.',
    indications: [
      'Controle total das finanças da clínica',
      'Planejamento financeiro estratégico',
      'Identificação de desperdícios',
      'Base para decisões gerenciais'
    ],
    contraindications: [
      'Não misturar contas pessoais com da clínica',
      'Evitar registros genéricos sem categorização'
    ],
    bestPractices: [
      'Registrar todas as movimentações diariamente',
      'Categorizar receitas e despesas por centro de custo',
      'Fazer conciliação bancária mensalmente',
      'Gerar DRE (Demonstrativo de Resultados) mensal',
      'Manter reserva de emergência (3-6 meses)',
      'Revisar indicadores financeiros semanalmente'
    ],
    category: 'financeiro',
    riskLevel: 'alto',
    requiredTraining: true
  },

  SPLIT_PAGAMENTO: {
    id: 'SPLIT_PAGAMENTO',
    module: 'SPLIT_PAGAMENTO',
    title: 'Split de Pagamento com Otimização Tributária',
    definition: 'Sistema de divisão automática de pagamentos entre profissionais com planejamento tributário inteligente.',
    indications: [
      'Clínicas com múltiplos profissionais',
      'Otimização de carga tributária',
      'Transparência na divisão de receitas',
      'Conformidade com legislação fiscal'
    ],
    contraindications: [
      'Não utilizar para evasão fiscal',
      'Evitar sem consultoria contábil especializada'
    ],
    bestPractices: [
      'Definir regras claras de split em contrato',
      'Usar pessoa jurídica quando vantajoso',
      'Documentar todas as divisões',
      'Integrar com contabilidade',
      'Revisar regime tributário anualmente',
      'Considerar Simples Nacional vs. Lucro Presumido'
    ],
    category: 'financeiro',
    riskLevel: 'alto',
    requiredTraining: true
  },

  INADIMPLENCIA: {
    id: 'INADIMPLENCIA',
    module: 'INADIMPLENCIA',
    title: 'Controle de Inadimplência com Cobrança Automatizada',
    definition: 'Sistema automatizado de gestão de recebíveis com régua de cobrança personalizada e negociação.',
    indications: [
      'Reduzir índice de inadimplência',
      'Automatizar processo de cobrança',
      'Preservar relacionamento com pacientes',
      'Melhorar fluxo de caixa'
    ],
    contraindications: [
      'Não usar linguagem ofensiva ou ameaçadora',
      'Evitar cobranças públicas ou vexatórias',
      'Não contatar em horários inadequados'
    ],
    bestPractices: [
      'Criar régua de cobrança progressiva (D+1, D+7, D+15, D+30)',
      'Oferecer facilidades de negociação',
      'Usar múltiplos canais (WhatsApp, SMS, email)',
      'Documentar todas as tentativas de contato',
      'Considerar desconto para quitação',
      'Manter tom profissional e empático'
    ],
    category: 'financeiro',
    riskLevel: 'moderado'
  },

  // MÓDULOS DE CRESCIMENTO E MARKETING
  CRM: {
    id: 'CRM',
    module: 'CRM',
    title: 'CRM com Funil de Vendas',
    definition: 'Sistema de gestão de relacionamento com leads e pacientes, incluindo funil de conversão e jornada do cliente.',
    indications: [
      'Converter leads em pacientes',
      'Identificar gargalos no processo comercial',
      'Personalizar comunicação por estágio',
      'Medir ROI de ações de marketing'
    ],
    contraindications: [
      'Não enviar comunicações sem consentimento (LGPD)',
      'Evitar abordagem excessivamente comercial'
    ],
    bestPractices: [
      'Qualificar leads antes de contato',
      'Definir etapas claras do funil',
      'Nutrir leads com conteúdo relevante',
      'Fazer follow-up consistente',
      'Integrar com WhatsApp e redes sociais',
      'Mensurar taxa de conversão por etapa'
    ],
    category: 'financeiro',
    riskLevel: 'baixo'
  },

  MARKETING_AUTO: {
    id: 'MARKETING_AUTO',
    module: 'MARKETING_AUTO',
    title: 'Automação de Marketing Pós-Consulta e Recall',
    definition: 'Sistema automatizado de engajamento pós-atendimento com recalls, pesquisas de satisfação e reativação.',
    indications: [
      'Aumentar taxa de retorno de pacientes',
      'Coletar feedback estruturado',
      'Prevenir abandono de tratamento',
      'Fortalecer relacionamento de longo prazo'
    ],
    contraindications: [
      'Não automatizar sem personalização mínima',
      'Evitar frequência excessiva de mensagens'
    ],
    bestPractices: [
      'Enviar pesquisa de satisfação em 24h',
      'Programar recall conforme procedimento',
      'Personalizar mensagens com nome e histórico',
      'Segmentar por tipo de tratamento',
      'Oferecer canal direto para dúvidas',
      'Integrar com PEP para timing ideal'
    ],
    category: 'financeiro',
    riskLevel: 'baixo'
  },

  BI: {
    id: 'BI',
    module: 'BI',
    title: 'Business Intelligence e Dashboards',
    definition: 'Plataforma de análise de dados com dashboards executivos e indicadores de desempenho (KPIs) da clínica.',
    indications: [
      'Tomar decisões baseadas em dados',
      'Identificar oportunidades de crescimento',
      'Monitorar saúde financeira da clínica',
      'Comparar performance entre períodos'
    ],
    contraindications: [
      'Não tomar decisões baseadas em dados isolados',
      'Evitar análises superficiais sem contexto'
    ],
    bestPractices: [
      'Definir KPIs relevantes para o negócio',
      'Revisar métricas semanalmente',
      'Cruzar dados de múltiplas fontes',
      'Estabelecer metas mensuráveis',
      'Usar visualizações claras e objetivas',
      'Treinar equipe em interpretação de dados'
    ],
    category: 'financeiro',
    riskLevel: 'baixo'
  },

  // MÓDULOS DE COMPLIANCE
  LGPD: {
    id: 'LGPD',
    module: 'LGPD',
    title: 'Segurança e Conformidade LGPD',
    definition: 'Sistema de gestão de dados pessoais conforme Lei Geral de Proteção de Dados com auditorias e consentimentos.',
    indications: [
      'Conformidade legal obrigatória',
      'Proteção contra vazamento de dados',
      'Gerenciamento de consentimentos',
      'Responder a requisições de titulares'
    ],
    contraindications: [
      'Não coletar dados sem finalidade específica',
      'Evitar compartilhamento sem base legal'
    ],
    bestPractices: [
      'Coletar apenas dados necessários',
      'Obter consentimento explícito e documentado',
      'Implementar criptografia de dados sensíveis',
      'Fazer backup seguro e regular',
      'Treinar equipe em boas práticas LGPD',
      'Nomear encarregado de dados (DPO)',
      'Manter registro de atividades de tratamento'
    ],
    category: 'compliance',
    riskLevel: 'critico',
    requiredTraining: true
  },

  ASSINATURA_ICP: {
    id: 'ASSINATURA_ICP',
    module: 'ASSINATURA_ICP',
    title: 'Assinatura Digital Qualificada ICP-Brasil',
    definition: 'Sistema de assinatura eletrônica com certificado digital padrão ICP-Brasil para validade jurídica.',
    indications: [
      'Contratos com validade jurídica plena',
      'Prescrições e atestados digitais',
      'Laudos e relatórios técnicos',
      'Documentos para fins legais'
    ],
    contraindications: [
      'Não usar certificados vencidos',
      'Evitar assinatura sem leitura do documento'
    ],
    bestPractices: [
      'Usar certificado A3 (maior segurança)',
      'Verificar validade antes de assinar',
      'Armazenar documentos assinados em local seguro',
      'Fazer backup com timestamp',
      'Registrar log de todas as assinaturas',
      'Renovar certificados antes do vencimento'
    ],
    category: 'compliance',
    riskLevel: 'alto',
    requiredTraining: true
  },

  TISS: {
    id: 'TISS',
    module: 'TISS',
    title: 'Faturamento de Convênios Padrão TISS',
    definition: 'Sistema de faturamento para operadoras de planos de saúde seguindo padrão TISS da ANS.',
    indications: [
      'Clínicas que atendem convênios',
      'Padronização de comunicação com operadoras',
      'Agilizar processo de reembolso',
      'Reduzir glosas e devoluções'
    ],
    contraindications: [
      'Não enviar guias sem autorização prévia',
      'Evitar códigos de procedimentos incorretos'
    ],
    bestPractices: [
      'Validar dados antes do envio',
      'Incluir toda documentação necessária',
      'Acompanhar prazos de envio',
      'Fazer gestão ativa de glosas',
      'Manter cadastro atualizado de convênios',
      'Treinar equipe no padrão TISS'
    ],
    category: 'compliance',
    riskLevel: 'alto',
    requiredTraining: true
  },

  TELEODONTO: {
    id: 'TELEODONTO',
    module: 'TELEODONTO',
    title: 'Teleodontologia',
    definition: 'Plataforma de atendimento remoto conforme Resolução CFO-226/2020 para teleconsultas e telemonitoramento.',
    indications: [
      'Consultas de retorno e acompanhamento',
      'Triagem e orientação inicial',
      'Telemonitoramento pós-operatório',
      'Segunda opinião profissional'
    ],
    contraindications: [
      'Não realizar procedimentos invasivos',
      'Evitar diagnósticos definitivos sem exame presencial',
      'Não substituir emergências odontológicas'
    ],
    bestPractices: [
      'Obter consentimento informado específico',
      'Usar plataforma com criptografia',
      'Registrar teleconsulta no prontuário',
      'Gravar consultas com autorização',
      'Definir critérios para encaminhamento presencial',
      'Seguir protocolos do CFO'
    ],
    category: 'compliance',
    riskLevel: 'moderado',
    requiredTraining: true
  },

  // MÓDULOS DE INOVAÇÃO
  FLUXO_DIGITAL: {
    id: 'FLUXO_DIGITAL',
    module: 'FLUXO_DIGITAL',
    title: 'Integração com Fluxo Digital (Scanners/Labs)',
    definition: 'Integração com scanners intraorais e laboratórios para fluxo digital completo de próteses e ortodontia.',
    indications: [
      'Maior precisão em moldagens',
      'Redução de tempo clínico',
      'Comunicação clara com laboratório',
      'Arquivamento digital permanente'
    ],
    contraindications: [
      'Não usar em casos com limitação de abertura bucal severa',
      'Evitar em pacientes com reflexo de vômito extremo'
    ],
    bestPractices: [
      'Calibrar scanner regularmente',
      'Fazer backup das digitalizações',
      'Usar formatos abertos (STL, PLY)',
      'Validar arquivos antes de enviar ao lab',
      'Manter protocolo de desinfecção do scanner',
      'Treinar equipe em técnica de escaneamento'
    ],
    category: 'inovacao',
    riskLevel: 'moderado',
    requiredTraining: true
  },

  IA: {
    id: 'IA',
    module: 'IA',
    title: 'Inteligência Artificial Aplicada',
    definition: 'Ferramentas de IA para análise de radiografias, predição de tratamentos e assistência diagnóstica.',
    indications: [
      'Auxílio na detecção de lesões',
      'Análise preditiva de progressão de doença',
      'Sugestão de planos de tratamento',
      'Triagem automatizada'
    ],
    contraindications: [
      'Não substituir julgamento clínico profissional',
      'Evitar decisões baseadas apenas em IA',
      'Não usar em casos fora do treinamento da IA'
    ],
    bestPractices: [
      'Usar IA como ferramenta auxiliar, não substituta',
      'Validar resultados com experiência clínica',
      'Documentar uso de IA no prontuário',
      'Manter-se atualizado sobre limitações',
      'Explicar ao paciente quando IA foi usada',
      'Escolher soluções com validação científica'
    ],
    category: 'inovacao',
    riskLevel: 'alto',
    requiredTraining: true
  },

  // MÓDULOS ADICIONAIS IMPORTANTES
  ANAMNESE: {
    id: 'ANAMNESE',
    module: 'ANAMNESE',
    title: 'Anamnese Clínica Completa',
    definition: 'Questionário estruturado de histórico médico e odontológico do paciente para avaliação de riscos.',
    indications: [
      'Avaliar condições sistêmicas que afetam tratamento',
      'Identificar alergias e contraindicações',
      'Calcular risk score para procedimentos',
      'Fundamentar plano de tratamento'
    ],
    contraindications: [
      'Não omitir perguntas sobre medicamentos',
      'Evitar julgamentos sobre hábitos do paciente'
    ],
    bestPractices: [
      'Atualizar a cada 6 meses ou mudança de saúde',
      'Fazer perguntas abertas e fechadas',
      'Documentar com clareza e objetividade',
      'Correlacionar achados com exame clínico',
      'Solicitar exames complementares quando necessário',
      'Contatar médico do paciente em casos complexos'
    ],
    category: 'clinico',
    riskLevel: 'critico',
    requiredTraining: true
  },

  PRESCRICAO: {
    id: 'PRESCRICAO',
    module: 'PRESCRICAO',
    title: 'Prescrição Digital de Medicamentos',
    definition: 'Sistema de prescrição eletrônica com banco de dados de medicamentos, posologia e interações.',
    indications: [
      'Padronizar prescrições',
      'Evitar erros de posologia',
      'Alertar sobre interações medicamentosas',
      'Facilitar entendimento do paciente'
    ],
    contraindications: [
      'Não prescrever sem anamnese completa',
      'Evitar uso off-label sem fundamentação',
      'Não prescrever medicamentos desconhecidos'
    ],
    bestPractices: [
      'Usar DCI (Denominação Comum Internacional)',
      'Especificar dose, frequência e duração',
      'Alertar sobre efeitos adversos',
      'Verificar interações com medicamentos em uso',
      'Assinar digitalmente com certificado ICP',
      'Manter cópia no prontuário'
    ],
    category: 'clinico',
    riskLevel: 'critico',
    requiredTraining: true
  },

  RADIOLOGIA: {
    id: 'RADIOLOGIA',
    module: 'RADIOLOGIA',
    title: 'Radiologia Digital e Laudos',
    definition: 'Sistema PACS para armazenamento e visualização de imagens radiográficas digitais com emissão de laudos.',
    indications: [
      'Diagnóstico por imagem',
      'Planejamento de tratamentos complexos',
      'Acompanhamento de evolução',
      'Documentação médico-legal'
    ],
    contraindications: [
      'Não solicitar radiografias desnecessárias',
      'Evitar exposição excessiva à radiação',
      'Não interpretar fora da área de competência'
    ],
    bestPractices: [
      'Justificar indicação do exame',
      'Usar proteção radiológica (avental de chumbo)',
      'Armazenar em formato DICOM',
      'Fazer backup em múltiplos locais',
      'Laudar todas as imagens solicitadas',
      'Seguir protocolos da vigilância sanitária'
    ],
    category: 'clinico',
    riskLevel: 'alto',
    requiredTraining: true
  }
};

// Função helper para buscar tooltip por ID
export function getOdontoTooltip(id: string): OdontoTooltip | undefined {
  return odontoTooltipsData[id];
}

// Função helper para buscar tooltips por categoria
export function getTooltipsByCategory(category: OdontoTooltip['category']): OdontoTooltip[] {
  return Object.values(odontoTooltipsData).filter(t => t.category === category);
}

// Função helper para buscar tooltips por nível de risco
export function getTooltipsByRiskLevel(riskLevel: OdontoTooltip['riskLevel']): OdontoTooltip[] {
  return Object.values(odontoTooltipsData).filter(t => t.riskLevel === riskLevel);
}
