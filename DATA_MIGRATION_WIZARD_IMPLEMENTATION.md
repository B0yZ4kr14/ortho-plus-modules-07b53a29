# Implementação Completa: Wizard de Migração de Dados

## Data: 2025-11-13

## 🎯 Objetivo
Criar sistema completo de migração de dados permitindo importar/exportar configurações de módulos, dados de pacientes e histórico clínico entre diferentes instalações do Ortho+.

---

## ✅ 1. Edge Functions Backend

### 1.1. Export Clinic Data
**Arquivo:** `supabase/functions/export-clinic-data/index.ts`

**Funcionalidades:**
- ✅ Exportação seletiva de dados:
  - Configurações de módulos (clinic_modules + module_catalog)
  - Dados de pacientes (prontuarios)
  - Histórico clínico (historico_clinico)
  - Prontuários completos (prontuarios + odontograma_teeth)
  - Agendamentos (appointments)
  - Dados financeiros (contas_receber + contas_pagar)
- ✅ Formato JSON estruturado com versionamento (v1.0.0)
- ✅ Metadados de exportação (timestamp, clinicId)
- ✅ Auditoria completa com `DATA_EXPORT` no audit_logs
- ✅ Restrição de acesso apenas para ADMIN
- ✅ Validação de autenticação e clinic_id

**Estrutura do JSON Exportado:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-11-13T10:30:00.000Z",
  "clinicId": "uuid-da-clinica",
  "data": {
    "modules": [...],
    "patients": [...],
    "prontuarios": [...],
    "odontogramas": [...],
    "historicoClinico": [...],
    "appointments": [...],
    "financeiro": {
      "contasReceber": [...],
      "contasPagar": [...]
    }
  }
}
```

### 1.2. Import Clinic Data
**Arquivo:** `supabase/functions/import-clinic-data/index.ts`

**Funcionalidades:**
- ✅ Importação com tratamento de conflitos:
  - `skipConflicts`: Pula registros duplicados
  - `overwriteExisting`: Sobrescreve registros existentes
  - `mergeData`: Mescla dados novos com existentes
- ✅ Validação de estrutura do arquivo JSON
- ✅ Geração de novos IDs para evitar conflitos de UUID
- ✅ Importação transacional de módulos via `upsert`
- ✅ Importação de prontuários + odontogramas associados
- ✅ Mapeamento automático de module_keys para IDs do catálogo
- ✅ Relatório detalhado de importação (imported, skipped, errors)
- ✅ Auditoria completa com `DATA_IMPORT` no audit_logs
- ✅ Restrição de acesso apenas para ADMIN

**Algoritmo de Importação:**
1. Validar estrutura do JSON
2. Para cada tipo de dado:
   - Buscar registros existentes
   - Aplicar estratégia de conflito (skip/overwrite/merge)
   - Inserir/atualizar no banco
3. Registrar resultados (sucesso, erros, pulados)
4. Criar log de auditoria

---

## ✅ 2. Frontend - Wizard Interativo

### 2.1. DataMigrationWizard Component
**Arquivo:** `src/components/settings/DataMigrationWizard.tsx`

**Características:**
- ✅ Wizard multi-step com progress indicator visual
- ✅ Dois modos: `export` e `import`
- ✅ UI profissional com cards elevados e badges
- ✅ Feedback visual em tempo real (progress bar)
- ✅ Validação de arquivos JSON

**Fluxo de Exportação (3 steps):**

**Step 1 - Seleção de Dados:**
- Checkboxes para cada tipo de dado:
  - 📦 Configurações de Módulos
  - 👥 Dados de Pacientes
  - 📋 Prontuários Eletrônicos (PEP)
  - 📚 Histórico Clínico
  - 📅 Agendamentos
  - 💰 Dados Financeiros
- Seleção de formato (JSON completo)

**Step 2 - Confirmação:**
- Preview dos dados selecionados (badges)
- Barra de progresso durante exportação
- Status de conclusão

**Step 3 - Resultado:**
- Ícone de sucesso
- Download automático do arquivo JSON
- Botão "Concluir"

**Fluxo de Importação (4 steps):**

**Step 1 - Upload de Arquivo:**
- Área de drop com border-dashed
- Input de arquivo com filtro .json
- Preview do nome do arquivo selecionado

**Step 2 - Preview dos Dados:**
- Cards mostrando metadados:
  - Versão do arquivo
  - Data de exportação
- Lista de conteúdo:
  - Quantidade de módulos
  - Quantidade de pacientes
  - Quantidade de prontuários
  - Quantidade de agendamentos

**Step 3 - Opções de Importação:**
- 3 checkboxes para estratégia de conflito:
  - ✅ Ignorar Conflitos (pular duplicados)
  - ✅ Sobrescrever Existentes (atualizar)
  - ✅ Mesclar Dados (combinar)
- Barra de progresso durante importação

**Step 4 - Resultado:**
- Card de resumo com badges:
  - ✅ Registros importados (verde)
  - ⚠️ Registros ignorados (cinza)
  - ❌ Erros (vermelho)
- Detalhamento por tipo de dado

---

## ✅ 3. Integração na Página de Configurações

### 3.1. Atualização da Página
**Arquivo:** `src/pages/Configuracoes.tsx`

**Melhorias:**
- ✅ Card "Migração de Dados" adicionado na aba Database
- ✅ Dois botões side-by-side:
  - 📥 Exportar Dados
  - 📤 Importar Dados
- ✅ Estados para controlar abertura dos wizards
- ✅ Integração perfeita com tabs existentes

**Localização:**
- Aba: **Banco de Dados**
- Posição: Primeiro card antes de BackupStatsDashboard

---

## ✅ 4. Configuração Supabase

### 4.1. Config.toml
**Arquivo:** `supabase/config.toml`

**Edge Functions Adicionadas:**
```toml
[functions.export-clinic-data]
verify_jwt = true

[functions.import-clinic-data]
verify_jwt = true
```

**Segurança:**
- ✅ JWT verification obrigatória
- ✅ Validação de role ADMIN no código
- ✅ Auditoria automática de todas as operações

---

## 🎯 Casos de Uso

### Caso 1: Backup Completo de Dados
**Cenário:** Admin quer backup completo antes de atualização crítica
**Ação:**
1. Acessar Configurações → Banco de Dados
2. Clicar em "Exportar Dados"
3. Selecionar todos os dados
4. Exportar em JSON
5. Arquivo baixado automaticamente

### Caso 2: Migração Entre Ambientes
**Cenário:** Migrar dados de ambiente de teste para produção
**Ação:**
1. **Ambiente Teste:** Exportar dados selecionados
2. **Ambiente Produção:** Importar dados
3. Escolher "Ignorar Conflitos" para evitar duplicatas
4. Revisar resumo de importação

### Caso 3: Replicação de Configuração
**Cenário:** Nova clínica quer mesma configuração de módulos de clínica existente
**Ação:**
1. **Clínica A:** Exportar apenas "Configurações de Módulos"
2. **Clínica B:** Importar com "Sobrescrever Existentes"
3. Todos os módulos ativados automaticamente na Clínica B

### Caso 4: Restauração de Backup
**Cenário:** Perda de dados acidental, precisa restaurar
**Ação:**
1. Localizar arquivo de backup (JSON)
2. Acessar Importar Dados
3. Escolher "Sobrescrever Existentes"
4. Validar resumo de importação
5. Dados restaurados com sucesso

---

## 🔒 Segurança e Auditoria

### Logs de Auditoria
**Tabela:** `audit_logs`

**Eventos Rastreados:**
- `DATA_EXPORT` - Com detalhes de:
  - Opções selecionadas
  - Quantidade de registros exportados por tipo
  - Timestamp da operação
  
- `DATA_IMPORT` - Com detalhes de:
  - Clínica de origem (sourceClinicId)
  - Opções de conflito aplicadas
  - Quantidade de registros importados/pulados/erros
  - Timestamp da operação

### Controle de Acesso
- ✅ Apenas usuários com role `ADMIN` podem exportar/importar
- ✅ Validação de JWT em todas as requisições
- ✅ Validação de clinic_id do usuário
- ✅ RLS policies garantem isolamento de dados

---

## 📊 Benefícios

### Para Administradores:
1. **Backup Granular** - Escolher exatamente quais dados exportar
2. **Migração Segura** - Estratégias de conflito previnem perda de dados
3. **Auditoria Completa** - Rastreamento de todas as operações
4. **UX Intuitiva** - Wizard guiado passo a passo
5. **Validação Prévia** - Preview de dados antes de importar

### Para o Negócio:
1. **Disaster Recovery** - Restauração rápida de backups
2. **Multi-Environment** - Migração fácil entre ambientes
3. **Onboarding Rápido** - Replicar configurações para novas clínicas
4. **Compliance LGPD** - Exportação completa de dados de pacientes
5. **Escalabilidade** - Facilita gestão de múltiplas clínicas

---

## 🚀 Melhorias Futuras Sugeridas

### Opcional:
1. **Validação de Integridade** - Checksums MD5/SHA256 dos arquivos
2. **Compressão** - Arquivos .zip para exportações grandes
3. **Migração Incremental** - Exportar apenas mudanças desde último backup
4. **Agendamento** - Exportações automáticas periódicas
5. **Múltiplos Formatos** - CSV, Excel além de JSON
6. **Encryption** - Criptografia dos arquivos exportados
7. **Cloud Storage** - Upload direto para S3/Drive
8. **Diff Viewer** - Comparar dados antes de importar

---

## ✨ Resumo Técnico

| Componente | Status | Tecnologia |
|------------|--------|------------|
| Export Edge Function | ✅ Implementado | Deno + Supabase |
| Import Edge Function | ✅ Implementado | Deno + Supabase |
| DataMigrationWizard | ✅ Implementado | React + TypeScript |
| UI Integration | ✅ Integrado | Configurações Page |
| Auditoria | ✅ Completa | audit_logs table |
| Validação | ✅ Implementada | TypeScript + Zod |

**Total de Linhas de Código:** ~500 linhas
**Arquivos Criados:** 3
**Arquivos Modificados:** 2

---

## 🎉 Conclusão

O **Wizard de Migração de Dados** foi implementado com sucesso! O sistema agora permite:
- ✅ Exportar dados granularmente em JSON estruturado
- ✅ Importar dados com controle total de conflitos
- ✅ Preview completo antes de importar
- ✅ Auditoria completa de todas as operações
- ✅ UX profissional com wizard multi-step
- ✅ Validação e tratamento de erros robusto

**Sistema 100% pronto para migração segura de dados entre instalações do Ortho+!** 🚀
