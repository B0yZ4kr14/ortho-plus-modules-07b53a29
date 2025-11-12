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

## 📦 Módulos Disponíveis (22 módulos)

### Gestão e Operação
- Dashboard, Pacientes, Dentistas, Funcionários, Agenda, PEP, Odontograma, Estoque, Orçamentos, Contratos

### Financeiro  
- Gestão Financeira, Contas a Receber/Pagar, NFe, Split de Pagamento, Cobrança, Crypto

### Crescimento & Marketing
- CRM + Funil, Automação, Business Intelligence, Fidelidade

### Compliance
- LGPD, Auditoria, Assinatura Digital ICP, TISS

### Inovação
- Teleodontologia, IA Raio-X, Fluxo Digital, Portal do Paciente

---

## 🏗️ Instalação

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

## 📚 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura técnica completa
- [SECURITY.md](./SECURITY.md) - Práticas de segurança
- [API_DOCS.md](./API_DOCS.md) - Documentação das Edge Functions

---

## 🏆 Diferenciais

1. **Arquitetura Modular Descentralizada** - 100% plug-and-play
2. **IA Integrada** - Gemini Vision + ML
3. **Automação Completa** - Do estoque às cobranças
4. **Multi-tenancy Robusto** - Isolamento perfeito
5. **Design Premium** - 3 temas + animações
6. **LGPD Native** - Compliance desde o design
7. **Tour Guiado** - Onboarding interativo
8. **Crypto Ready** - Bitcoin nativo

---

## 📞 Contato

**TSI Telecom**  
🌐 https://tsitelecom.com  
📧 contato@tsitelecom.com

---

*Desenvolvido com 💙 pela TSI Telecom | Versão 1.0.0*
