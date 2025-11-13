# Ortho+ | Sistema de Gestão Odontológica Completo

## 🦷 Sobre o Sistema

**Ortho+** é uma plataforma SaaS B2B multitenant completa para gestão de clínicas odontológicas, desenvolvida com foco em modularidade, escalabilidade e experiência do usuário.

### Desenvolvido por TSI Telecom
**Copyright © 2025 TSI Telecom - Todos os direitos reservados**

---

## 🚀 Tecnologias

- **React 18.3** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Storage + Functions)
- **React Query** + **Zod** + **React Joyride**

## 📦 Módulos Disponíveis (26 módulos production-ready)

### 🎯 Core (10 módulos)
Dashboard | Pacientes | Dentistas | Funcionários | Agenda | Procedimentos | PEP | Odontograma | Estoque | Orçamentos | Contratos

### 💰 Financeiro (6 módulos)  
Dashboard Financeiro | Contas a Receber | Contas a Pagar | NFe | Split de Pagamento | Pagamentos Crypto

### 📈 Crescimento & Marketing (4 módulos)
CRM + Funil | Cobrança/Inadimplência | Business Intelligence | Programa de Fidelidade

### 🔒 Compliance (3 módulos)
LGPD Compliance | Auditoria de Logs | Assinatura Digital ICP-Brasil

### 🚀 Inovação (3 módulos)
Teleodontologia | IA Radiografia (Gemini Vision) | Portal do Paciente

---

## 🐳 Deploy com Docker

### Opção 1: Docker Compose (Recomendado)

Execute a stack completa (aplicação + PostgreSQL + Nginx + Prometheus + Grafana):

```sh
# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie todos os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f orthoplus

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

**Serviços disponíveis:**
- Ortho+: `http://localhost:5173`
- Grafana: `http://localhost:3000` (admin/admin)
- Prometheus: `http://localhost:9090`
- PostgreSQL: `localhost:5432`

### Opção 2: Docker Individual

Execute apenas a aplicação:

```sh
# Build da imagem
docker build -t orthoplus:latest .

# Executar container
docker run -d \
  --name orthoplus \
  -p 5173:5173 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  -e VITE_SUPABASE_PROJECT_ID=your_id \
  orthoplus:latest

# Ver logs
docker logs -f orthoplus

# Parar container
docker stop orthoplus

# Remover container
docker rm orthoplus
```

### Opção 3: Docker Hub (Produção)

```sh
# Pull da imagem oficial
docker pull tsitelecom/orthoplus:latest

# Executar
docker run -d \
  --name orthoplus \
  -p 80:5173 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  tsitelecom/orthoplus:latest
```

---

## 🏗️ Instalação Manual

### Opção 1: Instalação Automática (Ubuntu 24.04.3 LTS)

```sh
# Baixe e execute o script de instalação
wget https://raw.githubusercontent.com/tsitelecom/ortho-plus/main/install.sh
chmod +x install.sh
sudo ./install.sh
```

O script instala automaticamente:
- Node.js, PostgreSQL, Nginx
- Prometheus, Grafana, UFW
- Configuração completa do Ortho+
- Backups automáticos diários

**Documentação completa:** [INSTALLATION.md](./INSTALLATION.md)

### Opção 2: Desenvolvimento Local

```sh
# Clone o repositório
git clone https://github.com/tsitelecom/ortho-plus.git
cd ortho-plus

# Instale as dependências
npm install

# Configure variáveis de ambiente (.env)
# Veja exemplo em .env.example

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🚀 Deploy

Abra [Lovable](https://lovable.dev/projects/ab203c0d-07a2-4325-8893-0110d34090b0) e clique em **Share → Publish**.

## 🌐 Domínio Customizado

Conecte seu domínio em **Project > Settings > Domains > Connect Domain**.

[Documentação Completa](https://docs.lovable.dev/features/custom-domain)

---

## 📚 Documentação Completa

- **[INSTALLATION.md](./INSTALLATION.md)** - Guia completo de instalação (Ubuntu 24.04.3 LTS)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica e design patterns
- **[VALIDATION_REPORT.md](./VALIDATION_REPORT.md)** - Relatório de validação sistemática (26 módulos)
- **[PAGEHEADER_AUDIT.md](./PAGEHEADER_AUDIT.md)** - Auditoria completa de componentes PageHeader (39 arquivos)
- **[E2E_TESTS_SUMMARY.md](./E2E_TESTS_SUMMARY.md)** - Resumo dos 46 testes E2E automatizados
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Histórico de refatorações
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de versões
- **[CREDITS.md](./CREDITS.md)** - Créditos e reconhecimentos

---

## 🏆 Diferenciais

1. **Arquitetura 100% Modular** - 26 módulos plug-and-play descentralizados
2. **IA Integrada** - Gemini Vision para análise de raio-X e odontograma
3. **Automação Completa** - Estoque → Pedidos → Cobranças automáticas
4. **Multi-tenancy Robusto** - RLS policies + isolamento perfeito
5. **Design Premium** - 3 temas profissionais + animações (Light/Dark/Professional-Dark)
6. **LGPD Native** - Compliance total desde o design
7. **Tour Guiado Interativo** - Onboarding com React Joyride (5 passos)
8. **Crypto Ready** - Bitcoin nativo com integração exchanges
9. **Observabilidade** - ELK Stack + Prometheus + Grafana
10. **Performance** - Redis cache + otimizações
11. **Testes E2E** - 46 testes automatizados Playwright
12. **CI/CD** - Deploy automático Docker Hub

---

## 📞 Contato

**TSI Telecom**  
🌐 https://tsitelecom.com  
📧 contato@tsitelecom.com

---

---

## ✅ Status: Production-Ready

- ✅ 26 módulos validados e funcionais
- ✅ 50+ tabelas PostgreSQL com RLS
- ✅ 28 Edge Functions operacionais  
- ✅ 46 testes E2E aprovados
- ✅ Documentação completa
- ✅ Docker production-ready
- ✅ CI/CD configurado
- ✅ Monitoramento completo

📄 [Ver Relatório de Validação Completo](./VALIDATION_REPORT.md)

---

*Desenvolvido com excelência e 💙 pela TSI Telecom | Versão 1.0.0 Production-Ready*
