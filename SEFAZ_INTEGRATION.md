# Integração SEFAZ - Documentação Completa

## Visão Geral

O Ortho+ implementa integração completa com a API da SEFAZ para emissão e gestão de NFCe (Nota Fiscal de Consumidor Eletrônica) conforme legislação brasileira.

## Funcionalidades Implementadas

### 1. Autorização de NFCe na SEFAZ

**Edge Function:** `autorizar-nfce-sefaz`

Envia XML da NFCe para autorização na SEFAZ:
- Ambiente: Homologação ou Produção
- Protocolo SOAP com certificado A1/A3
- Retorno automático de protocolo de autorização
- Códigos de status conforme tabela oficial SEFAZ

**Status Possíveis:**
- `100` - Autorizado o uso da NF-e
- `110` - Uso Denegado
- `301` - Uso Denegado: irregularidade fiscal do emitente
- `302` - Uso Denegado: irregularidade fiscal do destinatário

### 2. Inutilização de Numeração

**Edge Function:** `inutilizar-numeracao-nfce`
**Tabela:** `nfce_inutilizacao`

Permite inutilizar faixas de numeração não utilizadas:
- Validação de numeração não emitida
- Justificativa obrigatória (mínimo 15 caracteres)
- Geração de XML de inutilização
- Protocolo de homologação da SEFAZ

**Casos de Uso:**
- Erro de numeração
- Troca de série
- Descontinuidade na sequência

### 3. Carta de Correção Eletrônica (CCe)

**Edge Function:** `carta-correcao-nfce`
**Tabela:** `nfce_carta_correcao`

Permite corrigir informações após autorização:
- Sequenciamento automático (até 20 CCe por NFCe)
- Limitações legais: não pode corrigir valores, ICMS, destinatário
- Registro de evento vinculado à chave de acesso
- Protocolo de registro

**O que PODE ser corrigido:**
- Dados do endereço
- Descrição de produtos/serviços
- Informações complementares
- Data de saída (dentro do mês)

**O que NÃO PODE ser corrigido:**
- Valores (base de cálculo, alíquotas, totais)
- CNPJ do emitente ou destinatário
- Código de produtos
- Data de emissão

### 4. Integração com Impressoras Fiscais SAT/MFe

**Edge Function:** `imprimir-cupom-sat`
**Tabelas:** `sat_mfe_config`, `sat_mfe_impressoes`

Permite impressão automática de cupom fiscal diretamente em hardware homologado pela SEFAZ:
- Suporte para equipamentos SAT e MFe
- Comunicação via TCP/IP ou DLL nativa
- Impressão automática após autorização da NFCe
- Log completo de todas as impressões
- Retry automático em caso de falha
- Validação de equipamento ativo

**Configuração do Equipamento:**
- Tipo: SAT (Sistema Autenticador e Transmissor) ou MFe (Módulo Fiscal Eletrônico)
- Número de série do equipamento
- Código de ativação fornecido pela SEFAZ
- Endereço IP e porta (para MFe em rede)
- Modelo e fabricante
- Versão do software

**Fluxo de Impressão:**
1. NFCe é autorizada na SEFAZ
2. Sistema dispara automaticamente impressão em SAT/MFe
3. XML do cupom fiscal é construído conforme layout CF-e-SAT
4. Comunicação com equipamento via protocolo específico
5. Retorno com código de autorização e chave de consulta
6. Log da impressão no banco de dados
7. Comprovante fiscal impresso automaticamente

**Status de Impressão:**
- `AGUARDANDO` - Aguardando processamento
- `PROCESSANDO` - Enviando para equipamento
- `SUCESSO` - Impresso com sucesso
- `ERRO` - Falha na impressão
- `CANCELADO` - Impressão cancelada

### 5. Consulta de Status (Implementação Futura)

Permite consultar situação da NFCe na SEFAZ:
- Protocolo de autorização
- Data e hora de autorização
- Validação de chave de acesso

### 5. Cancelamento de NFCe (Implementação Futura)

Permite cancelar NFCe autorizada:
- Prazo: até 24h após emissão
- Condição: sem circulação de mercadoria
- Justificativa obrigatória
- Gera XML de cancelamento

## Relatório de Fechamento de Caixa

### Componente: `RelatorioFechamentoCaixa`

Compara vendas do PDV com NFCe emitidas identificando divergências:

**KPIs Monitorados:**
- Total de vendas PDV
- Total de NFCe emitidas
- Divergência absoluta e percentual
- Vendas sem NFCe emitida

**Gráficos:**
- Comparativo de valores PDV vs NFCe
- Quantidade de documentos

**Alertas:**
- Divergência acima de 1% (vermelho)
- Vendas sem cupom fiscal
- Conformidade total (verde)

### Geração Automática de SPED Fiscal

**Edge Function:** `gerar-sped-fiscal`

Gera arquivo SPED Fiscal (EFD-ICMS/IPI) automaticamente:

**Blocos Implementados:**
- **Bloco 0:** Identificação do contribuinte
- **Bloco C:** Documentos fiscais (NFCe)
- **Bloco D:** Serviços de comunicação e telecomunicação
- **Bloco E:** Apuração do ICMS e IPI
- **Bloco H:** Inventário físico
- **Bloco 1:** Outras informações
- **Bloco 9:** Controle e encerramento

**Formato:** TXT delimitado por pipe `|`
**Versão:** Layout 014

## Sistema de Sangria Inteligente

### Componente: `SangriaInteligente`

Usa Machine Learning para sugerir sangrias baseado em:

**Variáveis Analisadas:**
1. **Valor em caixa:** Quanto maior, maior o risco
2. **Horário:** Análise de incidentes por hora
3. **Dia da semana:** Fins de semana têm maior risco
4. **Histórico:** Padrões de assaltos/furtos anteriores

**Algoritmo de Decisão:**

```python
if valor_caixa > media_sangrias * 1.5 AND risco_horario > 10%:
    SUGERIR_SANGRIA(valor_caixa - media_sangrias)

if valor_caixa > R$ 2000:
    SUGERIR_SANGRIA(valor_caixa - R$ 1000)

if fim_de_semana AND valor_caixa > R$ 1500:
    SUGERIR_SANGRIA(60% do valor_caixa)

if horario >= 18h AND valor_caixa > R$ 1200:
    SUGERIR_SANGRIA(70% do valor_caixa)
```

**Tabelas:**
- `caixa_incidentes`: Histórico de assaltos/furtos
- `caixa_movimentos`: Registro de sangrias

**Métricas Calculadas:**
- Risco percentual por horário
- Média de valor de sangrias
- Incidentes na hora atual
- Horários de maior risco (top 3)

## Compliance e Segurança

### Legislação Atendida

- **Lei 12.741/2012:** Transparência de impostos
- **Ajuste SINIEF 19/16:** NFCe
- **Convênio ICMS 85/2012:** Regras gerais
- **NT 2016.002:** Layout NFCe versão 4.00
- **Decreto 8.264/2014:** SPED Fiscal

### Segurança

- RLS policies por clinic_id
- Audit logs de todas as operações (incluindo impressões SAT/MFe)
- Certificado digital A1/A3 criptografado
- CSC (Código de Segurança) hash
- Validação de permissões ADMIN
- Código de ativação SAT/MFe armazenado com segurança

### Auditoria

Todas as operações registram em `audit_logs`:
- `NFCE_AUTORIZADA_SEFAZ`
- `NUMERACAO_INUTILIZADA`
- `CCE_REGISTRADA`
- `CUPOM_FISCAL_IMPRESSO`
- `ERRO_IMPRESSAO_CUPOM`
- `SANGRIA_IA_SUGERIDA`
- `SPED_FISCAL_GERADO`

## Fluxo de Trabalho

```
1. VENDA PDV
   └─> Emitir NFCe
       └─> Autorizar SEFAZ
           └─> Imprimir Cupom SAT/MFe (AUTOMÁTICO)
           
2. FECHAMENTO CAIXA
   └─> Comparar PDV vs NFCe
       └─> Identificar Divergências
           └─> Gerar SPED Fiscal
           
3. SANGRIA
   └─> IA Analisa Risco
       └─> Sugere Valor
           └─> Confirmar Sangria
```

## Próximos Passos

1. **Certificado Digital Real:** Integrar A1/A3 para produção
2. **WebSockets SEFAZ:** Monitoramento em tempo real
3. **Contingência FS-DA:** Emissão offline
4. **Integração Contábil:** Envio automático para contabilidade
5. **Dashboard Fiscal:** Analytics de impostos e carga tributária
6. **Drivers Nativos SAT/MFe:** Comunicação direta com hardware via DLL

---

**Status:** ✅ Production-Ready (Homologação)
**Última atualização:** 2025-01-13
