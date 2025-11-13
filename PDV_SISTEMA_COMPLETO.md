# Sistema Completo de PDV com Gamificação e TEF - Documentação Técnica

## 📋 Visão Geral

O sistema de PDV (Ponto de Venda) do Ortho+ é uma solução completa e profissional para gestão de vendas em clínicas odontológicas, incluindo:

- ✅ **Operação de Caixa**: Abertura, movimentação (vendas, sangrias, suprimentos) e fechamento
- ✅ **Integração TEF**: Pagamentos com cartão via Transferência Eletrônica de Fundos
- ✅ **Emissão Fiscal**: NFCe (Nota Fiscal de Consumidor Eletrônica) com integração SEFAZ
- ✅ **Metas de Vendas**: Sistema de definição e acompanhamento de metas por vendedor
- ✅ **Gamificação**: Ranking em tempo real, pontuação e competição saudável
- ✅ **Premiações Automáticas**: Distribuição automática de bônus quando metas são atingidas
- ✅ **Sangria Inteligente**: Sugestões baseadas em IA para reduzir riscos de roubo
- ✅ **Dashboard Executivo**: Consolidação de KPIs, metas, rankings e transações

---

## 🗄️ Estrutura de Banco de Dados

### Tabelas Criadas

#### 1. **vendedor_metas**
Armazena as metas de vendas definidas para cada vendedor.

```sql
CREATE TABLE vendedor_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  vendedor_id UUID NOT NULL REFERENCES auth.users(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  meta_valor DECIMAL(10,2) NOT NULL,
  meta_quantidade INTEGER,
  valor_atingido DECIMAL(10,2) DEFAULT 0,
  quantidade_atingida INTEGER DEFAULT 0,
  percentual_atingido DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'EM_ANDAMENTO',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Usuários podem ver metas da sua clínica
- Admins podem gerenciar todas as metas

#### 2. **vendedor_premiacoes**
Registra premiações automáticas quando metas são atingidas.

```sql
CREATE TABLE vendedor_premiacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id UUID NOT NULL REFERENCES vendedor_metas(id),
  tipo_premiacao TEXT NOT NULL,
  valor_premiacao DECIMAL(10,2),
  descricao TEXT,
  entregue BOOLEAN DEFAULT FALSE,
  data_entrega TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **vendedor_ranking**
Armazena o ranking de vendedores por período (diário, semanal, mensal).

```sql
CREATE TABLE vendedor_ranking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  vendedor_id UUID NOT NULL REFERENCES auth.users(id),
  periodo TEXT NOT NULL, -- DIA, SEMANA, MES
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  total_vendas DECIMAL(10,2) DEFAULT 0,
  total_transacoes INTEGER DEFAULT 0,
  pontos INTEGER DEFAULT 0,
  posicao INTEGER,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **tef_transacoes**
Registra todas as transações via TEF (pagamentos com cartão).

```sql
CREATE TABLE tef_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  caixa_movimento_id UUID REFERENCES caixa_movimentos(id),
  tipo_pagamento TEXT NOT NULL, -- CREDITO, DEBITO
  valor DECIMAL(10,2) NOT NULL,
  nsu TEXT,
  codigo_autorizacao TEXT,
  bandeira TEXT,
  ultimos_digitos TEXT,
  comprovante_estabelecimento TEXT,
  comprovante_cliente TEXT,
  status TEXT DEFAULT 'PENDENTE',
  mensagem_erro TEXT,
  data_transacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. **tef_config**
Configurações de integração com operadoras TEF.

```sql
CREATE TABLE tef_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  operadora TEXT NOT NULL, -- STONE, CIELO, REDE, etc
  merchant_id TEXT NOT NULL,
  terminal_id TEXT NOT NULL,
  ambiente TEXT DEFAULT 'HOMOLOGACAO',
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. **caixa_movimentos** (Atualizado)
Estendido para incluir informações de sangria inteligente.

```sql
ALTER TABLE caixa_movimentos ADD COLUMN sugerido_por_ia BOOLEAN DEFAULT FALSE;
ALTER TABLE caixa_movimentos ADD COLUMN risco_calculado DECIMAL(5,2);
ALTER TABLE caixa_movimentos ADD COLUMN horario_risco TEXT;
```

#### 7. **caixa_incidentes**
Registra histórico de incidentes de segurança (assaltos, roubos) para análise de risco.

```sql
CREATE TABLE caixa_incidentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  data_incidente TIMESTAMPTZ NOT NULL,
  dia_semana INTEGER NOT NULL,
  horario_incidente TIME NOT NULL,
  tipo_incidente TEXT NOT NULL, -- ASSALTO, ROUBO, FURTO
  valor_perdido DECIMAL(10,2),
  valor_caixa_momento DECIMAL(10,2),
  descricao TEXT,
  boletim_ocorrencia TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. **fechamento_caixa**
Registra fechamentos de caixa com comparação PDV vs NFCe e geração de SPED Fiscal.

```sql
CREATE TABLE fechamento_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  caixa_movimento_id UUID NOT NULL REFERENCES caixa_movimentos(id),
  data_fechamento DATE NOT NULL,
  total_vendas_pdv DECIMAL(10,2) DEFAULT 0,
  quantidade_vendas_pdv INTEGER DEFAULT 0,
  total_nfce_emitidas DECIMAL(10,2) DEFAULT 0,
  quantidade_nfce INTEGER DEFAULT 0,
  vendas_sem_nfce INTEGER DEFAULT 0,
  divergencia DECIMAL(10,2) DEFAULT 0,
  percentual_divergencia DECIMAL(5,2),
  total_sangrias DECIMAL(10,2) DEFAULT 0,
  total_suprimentos DECIMAL(10,2) DEFAULT 0,
  arquivo_sped_path TEXT,
  arquivo_sped_gerado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 Edge Functions Implementadas

### 1. **processar-metas-gamificacao**
**Rota**: `POST /functions/v1/processar-metas-gamificacao`

Processa automaticamente o progresso de metas e atualiza ranking de vendedores.

**Fluxo:**
1. Para cada meta ativa, calcula valor/quantidade atingidos
2. Atualiza percentual e status da meta
3. Se meta atingida (100%), cria premiação automática
4. Atualiza ranking do vendedor no período
5. Envia notificações

**Execução**: Cron job diário (via `pg_cron`)

```typescript
// Exemplo de chamada
const { data, error } = await supabase.functions.invoke('processar-metas-gamificacao', {
  body: { clinic_id: clinicId }
});
```

### 2. **processar-pagamento-tef**
**Rota**: `POST /functions/v1/processar-pagamento-tef`

Processa transações TEF com integração à operadora configurada.

**Fluxo:**
1. Valida configuração TEF da clínica
2. Envia requisição para operadora (Stone, Cielo, Rede)
3. Processa resposta (aprovada/negada)
4. Registra transação em `tef_transacoes`
5. Gera comprovantes (estabelecimento e cliente)
6. Retorna status e dados para impressão

**Exemplo de Uso:**

```typescript
const { data, error } = await supabase.functions.invoke('processar-pagamento-tef', {
  body: {
    clinic_id: clinicId,
    caixa_movimento_id: caixaId,
    tipo_pagamento: 'CREDITO', // ou 'DEBITO'
    valor: 150.00,
    parcelas: 3
  }
});

if (data.status === 'APROVADA') {
  // Imprimir comprovante
  console.log(data.comprovante_estabelecimento);
  console.log(data.comprovante_cliente);
}
```

### 3. **sugerir-sangria-ia**
**Rota**: `POST /functions/v1/sugerir-sangria-ia`

Analisa risco de roubo e sugere sangrias preventivas baseado em:
- Histórico de incidentes da clínica
- Horário atual vs horários de maior risco
- Volume de dinheiro em caixa
- Padrões de sangrias anteriores

**Fluxo:**
1. Consulta histórico de incidentes (`caixa_incidentes`)
2. Identifica horários de maior risco
3. Verifica saldo atual do caixa
4. Calcula score de risco (0-100)
5. Se risco > 70, sugere sangria
6. Retorna valor sugerido e justificativa

**Exemplo de Resposta:**

```json
{
  "sugerir_sangria": true,
  "valor_sugerido": 500.00,
  "risco_calculado": 85,
  "horario_risco": "18h-20h",
  "motivo": "Alto volume em caixa (R$ 1.200) durante horário crítico (18h-20h). Histórico mostra 3 incidentes neste período nos últimos 6 meses."
}
```

### 4. **gerar-sped-fiscal**
**Rota**: `POST /functions/v1/gerar-sped-fiscal`

Gera arquivo SPED Fiscal (Sistema Público de Escrituração Digital) compilando NFCe emitidas no período.

**Fluxo:**
1. Consulta NFCe autorizadas no período
2. Consulta configuração fiscal da clínica
3. Gera blocos do SPED (0000, C100, C170, C190, etc)
4. Valida estrutura do arquivo
5. Salva `.txt` em Storage
6. Registra em `fechamento_caixa`

**Exemplo de Uso:**

```typescript
const { data, error } = await supabase.functions.invoke('gerar-sped-fiscal', {
  body: {
    clinic_id: clinicId,
    data_inicio: '2025-01-01',
    data_fim: '2025-01-31'
  }
});

// Retorna URL do arquivo .txt gerado
console.log(data.arquivo_path);
```

### 5. **autorizar-nfce-sefaz**
**Rota**: `POST /functions/v1/autorizar-nfce-sefaz`

Envia NFCe para autorização na SEFAZ em produção.

### 6. **inutilizar-numeracao-nfce**
**Rota**: `POST /functions/v1/inutilizar-numeracao-nfce`

Inutiliza faixa de numeração de NFCe não utilizada.

### 7. **carta-correcao-nfce**
**Rota**: `POST /functions/v1/carta-correcao-nfce`

Emite Carta de Correção Eletrônica (CC-e) para NFCe já autorizada.

---

## 🎨 Componentes Frontend

### 1. **MetasGamificacao.tsx**
**Rota**: `/pdv/metas`

Dashboard individual de vendedor mostrando:
- Metas pessoais (período, valor, progresso)
- Ranking em tempo real (dia, semana, mês)
- Badges e conquistas
- Premiações recebidas

### 2. **DashboardExecutivoPDV.tsx** (NOVO)
**Rota**: `/pdv/executivo`

Dashboard consolidado para gestores com:
- **KPIs Principais**:
  - Total de vendas do mês
  - Ticket médio
  - Metas atingidas
  - Transações TEF
  - Vendedores ativos
  
- **Gráficos**:
  - Vendas por vendedor (barra)
  - Evolução metas vs atingido (linha, 6 meses)
  - Transações TEF por método (pizza)
  - Top 5 vendedores do mês (ranking)

### 3. **IntegracaoTEF.tsx**
**Rota**: Componente reutilizável

Interface para processar pagamentos com cartão:
- Seleção de tipo (crédito/débito)
- Entrada de valor
- Seleção de parcelas (crédito)
- Processamento via TEF
- Impressão automática de comprovantes

### 4. **SangriaInteligente.tsx**
**Rota**: Componente reutilizável

Interface para sangrias preventivas:
- Exibição de sugestão de IA
- Visualização de risco calculado
- Input de valor e motivo
- Registro de sangria no caixa

### 5. **RelatorioFechamentoCaixa.tsx**
**Rota**: Componente reutilizável

Relatório gerencial comparando:
- Vendas PDV vs NFCe emitidas
- Divergências identificadas
- Botão para gerar SPED Fiscal

---

## 📊 Módulos no Catálogo

Os seguintes módulos foram adicionados ao `module_catalog` para ativação/desativação:

| Module Key | Nome | Categoria |
|-----------|------|-----------|
| `PDV_METAS` | Metas de Vendas por Vendedor | PDV & Vendas |
| `PDV_GAMIFICACAO` | Gamificação e Ranking de Vendas | PDV & Vendas |
| `PDV_TEF` | Integração TEF (Pagamentos com Cartão) | PDV & Vendas |
| `PDV_PREMIACOES` | Premiações Automáticas | PDV & Vendas |
| `PDV_SEFAZ` | Integração SEFAZ (NFCe Produção) | PDV & Vendas |
| `PDV_SANGRIA_IA` | Sangria Inteligente com IA | PDV & Vendas |
| `PDV_FECHAMENTO` | Fechamento de Caixa e SPED Fiscal | PDV & Vendas |
| `PDV_DASHBOARD` | Dashboard de Vendas PDV | PDV & Vendas |
| `PDV_FISCAL` | Configuração Fiscal e Emissão NFCe | PDV & Vendas |
| `BACKUP_REPLICATION` | Replicação Geo-Distribuída de Backups | Infraestrutura |

---

## 🔐 Segurança e Compliance

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS baseadas em:
- `clinic_id`: Isolamento multi-tenant
- `app_role`: Controle de acesso (ADMIN vs MEMBER)

### Auditoria
Todas as ações críticas são registradas em `audit_logs`:
- Abertura/fechamento de caixa
- Sangrias e suprimentos
- Transações TEF
- Emissão de NFCe
- Atingimento de metas

### Conformidade Fiscal
- **NFCe**: Emissão conforme layout SEFAZ 4.00
- **SPED Fiscal**: Geração automática conforme EFD-ICMS/IPI
- **Backup**: Retenção mínima de 5 anos conforme legislação

---

## 🚀 Fluxo de Uso Completo

### 1. Abertura de Caixa
```sql
INSERT INTO caixa_movimentos (clinic_id, tipo, valor_inicial, status, created_by)
VALUES (clinic_id, 'ABERTURA', 100.00, 'ABERTO', user_id);
```

### 2. Venda com TEF
```typescript
// 1. Registrar venda
const venda = await supabase.from('caixa_movimentos').insert({
  clinic_id, tipo: 'VENDA', valor: 150.00, caixa_id
});

// 2. Processar TEF
const tef = await supabase.functions.invoke('processar-pagamento-tef', {
  body: { clinic_id, caixa_movimento_id: venda.id, tipo_pagamento: 'CREDITO', valor: 150.00 }
});

// 3. Emitir NFCe
const nfce = await supabase.functions.invoke('emitir-nfce', {
  body: { clinic_id, venda_id: venda.id, produtos: [...] }
});
```

### 3. Sangria Inteligente
```typescript
// 1. Consultar sugestão
const { data: sugestao } = await supabase.functions.invoke('sugerir-sangria-ia', {
  body: { clinic_id, caixa_id }
});

// 2. Se sugestão positiva, executar sangria
if (sugestao.sugerir_sangria) {
  await supabase.from('caixa_movimentos').insert({
    clinic_id, tipo: 'SANGRIA', valor: sugestao.valor_sugerido,
    caixa_id, sugerido_por_ia: true, risco_calculado: sugestao.risco_calculado
  });
}
```

### 4. Fechamento de Caixa
```typescript
// 1. Consolidar vendas
const { data: vendas } = await supabase.from('caixa_movimentos')
  .select('valor').eq('tipo', 'VENDA').eq('caixa_id', caixaId);

const totalVendas = vendas.reduce((sum, v) => sum + v.valor, 0);

// 2. Consolidar NFCe
const { data: nfce } = await supabase.from('nfce_emitidas')
  .select('valor_total').eq('caixa_id', caixaId);

const totalNFCe = nfce.reduce((sum, n) => sum + n.valor_total, 0);

// 3. Registrar fechamento
await supabase.from('fechamento_caixa').insert({
  clinic_id, caixa_movimento_id: caixaId,
  total_vendas_pdv: totalVendas,
  total_nfce_emitidas: totalNFCe,
  divergencia: totalVendas - totalNFCe
});

// 4. Gerar SPED Fiscal
await supabase.functions.invoke('gerar-sped-fiscal', {
  body: { clinic_id, data_inicio, data_fim }
});
```

### 5. Processamento de Metas (Automático)
```sql
-- Cron job diário às 23:59
SELECT cron.schedule('processar-metas-diario', '59 23 * * *', 
  $$ SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/processar-metas-gamificacao',
    headers := '{"Authorization": "Bearer [key]"}'::jsonb
  ) $$
);
```

---

## 📈 Métricas e KPIs

O sistema rastreia automaticamente:

### Vendas
- Total de vendas (dia/semana/mês/ano)
- Ticket médio
- Vendas por vendedor
- Vendas por método de pagamento

### Metas
- Metas ativas vs concluídas
- Percentual médio de atingimento
- Tempo médio para atingir meta
- Taxa de atingimento da equipe

### TEF
- Taxa de aprovação de transações
- Ticket médio por bandeira
- Volume por operadora
- Taxa de erro por tipo

### Segurança
- Sangrias automáticas vs manuais
- Score médio de risco
- Incidentes por período
- Efetividade das sangrias preventivas

### Fiscal
- NFCe emitidas vs vendas registradas
- Taxa de conformidade (100% = sem divergências)
- Tempo médio de autorização SEFAZ
- Volume de CC-e emitidas

---

## 🔄 Próximos Passos Sugeridos

1. **Integração com Impressoras Fiscais**: Conectar diretamente com hardware fiscal
2. **App Mobile para Vendedores**: Acompanhamento de metas em tempo real
3. **Notificações Push**: Alertas de metas atingidas, sangrias sugeridas
4. **Machine Learning Avançado**: Previsão de vendas, detecção de fraudes
5. **Integração ERP**: Sincronização com sistemas contábeis externos

---

## 📚 Referências Técnicas

- [Layout NFCe 4.00 - SEFAZ](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Guia Prático EFD-ICMS/IPI](http://sped.rfb.gov.br/pasta/show/1573)
- [Protocolo TEF - ABECS](https://www.abecs.org.br/)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## ✅ Checklist de Implementação

- [x] Tabelas de banco de dados criadas
- [x] RLS policies configuradas
- [x] Edge Functions implementadas
- [x] Componentes frontend criados
- [x] Rotas adicionadas no App.tsx
- [x] Módulos adicionados ao catálogo
- [x] Dashboard executivo implementado
- [x] Documentação técnica completa
- [x] Erros de build corrigidos

---

**Status**: ✅ Sistema 100% implementado e operacional
**Última atualização**: 2025-11-13
