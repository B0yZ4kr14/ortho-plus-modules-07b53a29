# 📚 Documentação Ortho+ SaaS v4.0

> Sistema de Gestão Odontológica B2B Multitenant com PostgreSQL no banco

---

## 🎯 Navegação Rápida

### 👥 Para Equipe Clínica (Linguagem Simples)
📘 **[Guias de Usuário](./GUIAS-USUARIO/)** - Manuais visuais e FAQs para dentistas e recepcionistas

| Guia | Descrição |
|------|-----------|
| [00-BEM-VINDO](./GUIAS-USUARIO/00-BEM-VINDO.md) | Introdução ao sistema e primeiros passos |
| [01-CADASTRO-PACIENTES](./GUIAS-USUARIO/01-CADASTRO-PACIENTES.md) | Como cadastrar e gerenciar pacientes |
| [02-AGENDAMENTO](./GUIAS-USUARIO/02-AGENDAMENTO.md) | Como usar a agenda inteligente |
| [03-PRONTUARIO-ELETRONICO](./GUIAS-USUARIO/03-PRONTUARIO-ELETRONICO.md) | Como preencher PEP (Prontuário Eletrônico) |
| [04-ODONTOGRAMA](./GUIAS-USUARIO/04-ODONTOGRAMA.md) | Como usar o odontograma 2D/3D |
| [05-ORCAMENTOS-CONTRATOS](./GUIAS-USUARIO/05-ORCAMENTOS-CONTRATOS.md) | Como criar orçamentos e contratos digitais |
| [06-FINANCEIRO](./GUIAS-USUARIO/06-FINANCEIRO.md) | Como gerenciar fluxo de caixa |
| [07-RECEBIMENTOS-CRYPTO](./GUIAS-USUARIO/07-RECEBIMENTOS-CRYPTO.md) | Como aceitar pagamentos em criptomoedas |
| [08-CRM-LEADS](./GUIAS-USUARIO/08-CRM-LEADS.md) | Como usar o CRM e funil de vendas |
| [09-MARKETING-AUTO](./GUIAS-USUARIO/09-MARKETING-AUTO.md) | Como automatizar marketing pós-consulta |
| [10-TELEODONTOLOGIA](./GUIAS-USUARIO/10-TELEODONTOLOGIA.md) | Como realizar teleconsultas |
| [11-IA-RADIOGRAFIA](./GUIAS-USUARIO/11-IA-RADIOGRAFIA.md) | Como usar IA para análise de radiografias |
| [12-LGPD-COMPLIANCE](./GUIAS-USUARIO/12-LGPD-COMPLIANCE.md) | Como estar em compliance com LGPD |
| [13-FAQ-CLINICA](./GUIAS-USUARIO/13-FAQ-CLINICA.md) | ❓ Perguntas frequentes (clínica) |

---

### 🔧 Para Equipe DevOps/TI (Linguagem Técnica)
🔧 **[Guias Técnicos](./GUIAS-TECNICO/)** - Arquitetura, deploy, performance e segurança

| Guia | Descrição |
|------|-----------|
| [01-ARQUITETURA-GERAL](./GUIAS-TECNICO/01-ARQUITETURA-GERAL.md) | Arquitetura completa com diagramas |
| [01-ARQUITETURA-GERAL]../GUIAS-TECNICO/01-ARQUITETURA-GERAL.md) | PostgreSQL, RLS, Auth, Storage |
| [03-EDGE-FUNCTIONS](./GUIAS-TECNICO/03-EDGE-FUNCTIONS.md) | Funções serverless (Deno) |
| [04-AUTENTICACAO-RLS](./GUIAS-TECNICO/04-AUTENTICACAO-RLS.md) | Auth + Row Level Security |
| [05-MODULOS-DEPENDENCIAS](./GUIAS-TECNICO/05-MODULOS-DEPENDENCIAS.md) | Sistema modular plug-and-play |
| [06-PERFORMANCE](./GUIAS-TECNICO/06-PERFORMANCE.md) | Otimizações e métricas (RUM, LCP, FID) |
| [07-SEGURANCA](./GUIAS-TECNICO/07-SEGURANCA.md) | Segurança, LGPD, Audit Trail |
| [08-DEPLOY-DOCKER](./GUIAS-TECNICO/08-DEPLOY-DOCKER.md) | Deploy com Docker Compose |
| [09-MONITORAMENTO](./GUIAS-TECNICO/09-MONITORAMENTO.md) | Prometheus, Grafana, RUM |
| [10-TESTES](./GUIAS-TECNICO/10-TESTES.md) | Unit, E2E, cobertura |
| [11-TROUBLESHOOTING](./GUIAS-TECNICO/11-TROUBLESHOOTING.md) | Guia de resolução de problemas |
| [12-FAQ-DEVOPS](./GUIAS-TECNICO/12-FAQ-DEVOPS.md) | ❓ Perguntas frequentes (DevOps) |

---

### 📐 Diagramas de Arquitetura
📐 **[Diagramas Mermaid](./DIAGRAMAS/)** - Visualizações gráficas da arquitetura

| Diagrama | Tipo |
|----------|------|
| [01-ARQUITETURA-GERAL](./DIAGRAMAS/01-ARQUITETURA-GERAL.md) | Diagrama de arquitetura completa |
| [02-FLUXO-AUTENTICACAO](./DIAGRAMAS/02-FLUXO-AUTENTICACAO.md) | Sequence diagram de autenticação |
| [03-SISTEMA-MODULAR](./DIAGRAMAS/03-SISTEMA-MODULAR.md) | Grafo de módulos e dependências |
| [04-BANCO-DE-DADOS](./DIAGRAMAS/04-BANCO-DE-DADOS.md) | ERD do PostgreSQL |
| [05-FLUXO-PACIENTE](./DIAGRAMAS/05-FLUXO-PACIENTE.md) | User journey do paciente |
| [06-FLUXO-AGENDAMENTO](./DIAGRAMAS/06-FLUXO-AGENDAMENTO.md) | Flowchart de agendamento |
| [07-EDGE-FUNCTIONS](./DIAGRAMAS/07-EDGE-FUNCTIONS.md) | Diagrama de edge functions |
| [08-RLS-POLICIES](./DIAGRAMAS/08-RLS-POLICIES.md) | Diagrama de políticas RLS |
| [09-DEPLOY-WORKFLOW](./DIAGRAMAS/09-DEPLOY-WORKFLOW.md) | CI/CD pipeline |

---

### 📖 Referência de APIs
📖 **[API Reference](./API-REFERENCE/)** - Documentação de endpoints e schemas

| Documento | Descrição |
|-----------|-----------|
| [01-REST-API](./API-REFERENCE/01-REST-API.md) | Endpoints REST do banco |
| [02-EDGE-FUNCTIONS-API](./API-REFERENCE/02-EDGE-FUNCTIONS-API.md) | Edge Functions documentadas |
| [03-WEBHOOKS](./API-REFERENCE/03-WEBHOOKS.md) | Webhooks disponíveis |
| [04-SCHEMAS](./API-REFERENCE/04-SCHEMAS.md) | Schemas Zod/TypeScript |

---

### 🎓 Tutoriais Práticos
🎓 **[Tutoriais](./TUTORIAIS/)** - Guias passo-a-passo

| Tutorial | Descrição |
|----------|-----------|
| [01-COMO-ATIVAR-MODULOS](./TUTORIAIS/01-COMO-ATIVAR-MODULOS.md) | Como ativar/desativar módulos |
| [02-COMO-CRIAR-USUARIO-ROOT](./TUTORIAIS/02-COMO-CRIAR-USUARIO-ROOT.md) | Como criar usuário administrador |
| [03-COMO-CONFIGURAR-BACKUP](./TUTORIAIS/03-COMO-CONFIGURAR-BACKUP.md) | Como configurar backups automáticos |
| [04-COMO-INTEGRAR-CRYPTO](./TUTORIAIS/04-COMO-INTEGRAR-CRYPTO.md) | Como integrar pagamentos crypto |
| [05-COMO-CONFIGURAR-IA](./TUTORIAIS/05-COMO-CONFIGURAR-IA.md) | Como configurar análise de IA |
| [06-COMO-AUDITAR-LOGS](./TUTORIAIS/06-COMO-AUDITAR-LOGS.md) | Como auditar logs LGPD |

---

### 📋 Changelog e Roadmap
📋 **[Changelog](./CHANGELOG/)** - Histórico de versões

| Versão | Data | Descrição |
|--------|------|-----------|
| [V4.0.0](./CHANGELOG/V4.0.0.md) | Nov 2025 | Sistema modular + IA + Crypto |
| [ROADMAP](./CHANGELOG/ROADMAP.md) | - | Roadmap V5.0 |

---

## 🗄️ Backend: PostgreSQL no banco

Este sistema **roda 100% em PostgreSQL 15.x hospedado no banco**.

### O que isso significa?
- ✅ **Banco de dados relacional** robusto e escalável
- ✅ **Row Level Security (RLS)** para segurança por linha
- ✅ **Triggers, functions e policies** em SQL nativo
- ✅ **Auto-scaling gerenciado** pelo banco
- ✅ **Backups automáticos diários**
- ✅ **Express REST API** gerada automaticamente
- ✅ **Realtime subscriptions** via WebSockets
- ✅ **Storage integrado** para arquivos (radiografias, PEP)

### Arquitetura Simplificada
```
Frontend (React + Vite)
    ↓
PostgreSQL Client
    ↓
Express REST API
    ↓
PostgreSQL 15.x
    ↓
Row Level Security (RLS)
```

### Documentação Oficial
- **PostgreSQL:** [https://apiClient.com/docs](https://apiClient.com/docs)
- **PostgreSQL RLS:** [https://www.postgresql.org/docs/15/ddl-rowsecurity.html](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)

---

## 🎯 Stack Tecnológica

### Frontend
- **React 18.3** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** + Shadcn/UI
- **React Query** (server state)
- **Zustand** (client state)
- **React Router v6**

### Backend (PostgreSQL no banco)
- **PostgreSQL 15.x**
- **Express** (REST API)
- **Express Auth** (JWT)
- **MinIO Storage** (S3-compatible)
- **Edge Functions** (Deno runtime)

### Infraestrutura
- **Docker Compose** (orquestração)
- **Nginx** (reverse proxy)
- **Prometheus** + **Grafana** (monitoramento)

### Observabilidade
- **Audit Trail** (LGPD-compliant)
- **RUM Metrics** (Web Vitals)
- **Error Tracking** (Sentry-ready)

---

## 📊 Módulos Disponíveis (21 total)

### Core (Sempre Ativos)
- 📊 **DASHBOARD** - Visão geral e KPIs
- 👥 **PACIENTES** - Cadastro de pacientes
- 📝 **PEP** - Prontuário Eletrônico

### Gestão Clínica
- 📅 **AGENDA** - Agenda inteligente com WhatsApp
- 🦷 **ODONTOGRAMA** - Odontograma 2D/3D
- 💰 **ORCAMENTOS** - Orçamentos e contratos digitais
- 📦 **ESTOQUE** - Controle de estoque avançado

### Financeiro
- 💵 **FINANCEIRO** - Fluxo de caixa
- 💳 **SPLIT_PAGAMENTO** - Split de pagamento (depende de FINANCEIRO)
- 🚨 **INADIMPLENCIA** - Cobrança automatizada (depende de FINANCEIRO)
- ₿ **CRYPTO_PAYMENTS** - Pagamentos em cripto (depende de FINANCEIRO)

### Marketing e Vendas
- 📈 **CRM** - Funil de vendas
- 📧 **MARKETING_AUTO** - Automação de marketing
- 📊 **BI** - Business Intelligence e dashboards

### Compliance
- 🔒 **LGPD** - Segurança e conformidade LGPD
- ✍️ **ASSINATURA_ICP** - Assinatura digital qualificada (depende de PEP)
- 🏥 **TISS** - Faturamento de convênios (depende de PEP)

### Inovação
- 🎥 **TELEODONTO** - Teleodontologia
- 🔗 **FLUXO_DIGITAL** - Integração com scanners/labs (depende de PEP)
- 🤖 **IA** - Inteligência Artificial para radiografias (depende de PEP + FLUXO_DIGITAL)

---

## 🚀 Começando

### Para Usuários Clínicos
👉 Leia: [00-BEM-VINDO](./GUIAS-USUARIO/00-BEM-VINDO.md)

### Para DevOps/TI
👉 Leia: [01-ARQUITETURA-GERAL](./GUIAS-TECNICO/01-ARQUITETURA-GERAL.md)

---

## 📞 Suporte

### Equipe Clínica
📧 Email: suporte@orthoplus.com.br  
📱 WhatsApp: (11) 98765-4321  
🕐 Horário: Seg-Sex 8h-18h

### Equipe Técnica (DevOps/TI)
📧 Email: devops@orthoplus.com.br  
💬 Slack: #ortho-devops  
🆘 Emergência: (11) 91234-5678 (24/7)

---

## 📜 Licença

**Proprietary License** - Todos os direitos reservados © 2025 Ortho+ SaaS  
Veja: [LICENSE](./LEGAL/LICENSE.md)

---

## 📝 Atualizações

**Última atualização:** 15/Novembro/2025  
**Versão:** v4.0.0  
**Próxima versão (V5.0):** [Roadmap](./CHANGELOG/ROADMAP.md)
