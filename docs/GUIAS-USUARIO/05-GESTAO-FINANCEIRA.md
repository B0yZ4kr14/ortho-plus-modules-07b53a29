# Guia do Usuário: Gestão Financeira

**Módulo:** Financeiro  
**Roles permitidas:** ADMIN, MEMBER (com permissão)  
**Versão:** 4.0.0

---

## Visão Geral

O módulo Financeiro do Ortho+ permite gestão completa do fluxo de caixa da clínica através de:

- Contas a Receber (pacientes)
- Contas a Pagar (fornecedores)
- Fluxo de Caixa (entradas e saídas)
- Split de Pagamentos (divisão entre profissionais)
- Recebimentos em Criptomoedas
- Emissão de NFe/NFCe

---

## Conceitos Básicos

### Categorias Financeiras

O sistema organiza transações em categorias padrão:

| Tipo | Categorias Principais |
|------|----------------------|
| **Receitas** | Consultas, Procedimentos, Produtos, Planos, Mensalidades |
| **Despesas** | Salários, Aluguel, Material, Equipamentos, Marketing, Impostos |

Você pode criar categorias customizadas em **Configurações → Categorias**.

---

## Contas a Receber

### Registrar Novo Recebimento

1. Acesse **Financeiro → Contas a Receber**
2. Clique no botão **"+ Nova Conta"**
3. Preencha os campos:

```
- Paciente: Selecione da lista
- Descrição: Ex: "Consulta de avaliação ortodôntica"
- Valor: R$ 150,00
- Data de Vencimento: 15/12/2025
- Categoria: Consultas
- Forma de Pagamento: PIX / Cartão / Dinheiro / Crypto
```

4. Clique em **"Salvar"**

### Receber Pagamento

Quando o paciente efetuar o pagamento:

1. Localize a conta na listagem
2. Clique no ícone **"Receber" (✓)**
3. Confirme:
   - Valor recebido (pode ser diferente se houver desconto)
   - Data de recebimento
   - Observações (opcional)
4. Clique em **"Confirmar Recebimento"**

A conta muda de status **PENDENTE** → **PAGA** ✅

### Parcelamento

Para criar recebimento parcelado:

1. No formulário, marque **"Parcelar"**
2. Informe:
   - Número de parcelas: 3x
   - Valor total: R$ 450,00
   - Primeira parcela vence em: 15/12/2025

O sistema cria automaticamente 3 contas:
- Parcela 1/3: R$ 150,00 (15/12/2025)
- Parcela 2/3: R$ 150,00 (15/01/2026)
- Parcela 3/3: R$ 150,00 (15/02/2026)

---

## Contas a Pagar

### Registrar Nova Despesa

1. Acesse **Financeiro → Contas a Pagar**
2. Clique em **"+ Nova Conta"**
3. Preencha:

```
- Fornecedor: Ex: "Dental Cremer"
- Descrição: "Material ortodôntico - braquetes"
- Valor: R$ 2.500,00
- Data de Vencimento: 20/12/2025
- Categoria: Material Odontológico
- Forma de Pagamento: Boleto
```

4. Clique em **"Salvar"**

### Efetuar Pagamento

1. Localize a conta na listagem
2. Clique em **"Pagar" (✓)**
3. Confirme data e valor do pagamento
4. Status muda para **PAGA** ✅

### Contas Recorrentes

Para despesas fixas mensais:

1. Marque **"Recorrente"**
2. Escolha frequência: Mensal / Trimestral / Anual
3. Data de início: 01/12/2025
4. Sistema cria automaticamente as próximas contas

---

## Fluxo de Caixa

### Visualizar Fluxo

Acesse **Financeiro → Fluxo de Caixa** para ver:

- 📈 Gráfico de Receitas vs Despesas
- 💰 Saldo atual
- 📊 Projeção futura (baseada em contas pendentes)
- 🔍 Filtros por período

### Relatórios Financeiros

**DRE (Demonstração do Resultado do Exercício):**
- Receitas totais
- Despesas totais
- Lucro líquido
- Margem de lucro %

**Fluxo de Caixa Projetado:**
- Próximos 30/60/90 dias
- Entradas esperadas
- Saídas programadas
- Saldo projetado

---

## Split de Pagamentos

### Configurar Divisão

Para procedimentos realizados por múltiplos profissionais:

1. No recebimento, ative **"Split de Pagamento"**
2. Adicione profissionais:

```
- Dr. João Silva: 60% (R$ 90,00)
- Dra. Maria Santos: 40% (R$ 60,00)
- Total: R$ 150,00
```

3. O sistema divide automaticamente no repasse

### Relatório de Repasses

Acesse **Financeiro → Split → Relatório de Repasses** para:
- Ver valores a repassar por profissional
- Gerar comprovantes
- Exportar para folha de pagamento

---

## Recebimentos em Criptomoedas

### Configurar Carteira

1. Acesse **Financeiro → Crypto Pagamentos → Configurar**
2. Escolha método:
   - **Exchange:** Conecte Binance/Coinbase
   - **Carteira Própria:** Insira endereço BTC/USDT/ETH
   - **BTCPay Server:** Configure seu servidor

### Receber em Crypto

1. No cadastro de recebimento, selecione forma de pagamento **"Bitcoin"** ou **"USDT"**
2. Sistema gera QR Code com endereço de pagamento
3. Paciente escaneia e envia
4. Sistema monitora blockchain e confirma automaticamente

### Conversão Automática

Ative **"Conversão Automática para BRL"** para:
- Receber crypto
- Sistema vende automaticamente na exchange
- Recebe BRL na conta bancária

---

## Emissão de NFe/NFCe

### Configurar NFe

1. Acesse **Configurações → NFe**
2. Insira dados fiscais:
   - CNPJ da clínica
   - Certificado Digital A1
   - Senha do certificado

### Emitir Nota Fiscal

Após receber pagamento:

1. Clique em **"Emitir NFe"**
2. Sistema preenche automaticamente:
   - Dados do paciente
   - Serviço prestado
   - Valor
3. Clique em **"Transmitir para SEFAZ"**
4. NFe é autorizada e enviada por email ao paciente

---

## Conciliação Bancária

### Importar Extrato

1. Acesse **Financeiro → Conciliação Bancária**
2. Clique em **"Importar Extrato"**
3. Escolha formato: OFX / CSV
4. Faça upload do arquivo do banco

### Conciliar Transações

Sistema compara automaticamente:
- Extrato bancário ↔ Lançamentos do sistema
- Transações iguais: ✅ Conciliadas automaticamente
- Divergências: ⚠️ Requer atenção manual

---

## Categorias e Centros de Custo

### Criar Categoria Customizada

1. **Configurações → Categorias Financeiras**
2. Clique em **"+ Nova Categoria"**
3. Preencha:
   - Nome: "Marketing Digital"
   - Tipo: Despesa
   - Cor: 🟦 Azul
4. Salvar

### Centros de Custo

Para clínicas com múltiplas unidades:

1. **Configurações → Centros de Custo**
2. Crie centros: "Unidade Centro", "Unidade Bairro"
3. Ao lançar despesa/receita, associe ao centro

---

## Relatórios Financeiros

### Relatórios Disponíveis

| Relatório | Descrição |
|-----------|-----------|
| **DRE** | Receitas, despesas e lucro por período |
| **Fluxo de Caixa** | Entradas e saídas diárias |
| **Contas a Receber** | Valores pendentes de pacientes |
| **Contas a Pagar** | Valores a pagar a fornecedores |
| **Inadimplência** | Contas vencidas e não pagas |
| **Split de Pagamentos** | Repasses por profissional |

### Exportar Relatório

1. Selecione o relatório desejado
2. Escolha período: Último mês / Trimestre / Ano
3. Formato: PDF / Excel / CSV
4. Clique em **"Exportar"**

---

## Alertas e Notificações

### Configurar Alertas

**Financeiro → Configurações → Alertas**

Ative notificações para:
- 🔔 Contas a vencer (3 dias antes)
- 🚨 Contas vencidas (inadimplência)
- 💰 Saldo baixo em conta (< R$ 5.000)
- 📊 Meta mensal atingida

---

## Integrações

### Software Contábil

Envie dados automaticamente para:
- TOTVS
- SAP
- Conta Azul
- Omie

**Configuração:**
1. **Integrações → Contabilidade**
2. Escolha o software
3. Insira credenciais da API
4. Ative sincronização automática

### Open Banking

Conecte sua conta bancária:
1. **Financeiro → Open Banking**
2. Selecione seu banco
3. Autorize acesso (redirecionamento seguro)
4. Sistema importa extratos automaticamente

---

## Dicas e Boas Práticas

✅ **Organize por categoria:** Facilita relatórios e análise de gastos

✅ **Registre TUDO:** Mesmo pequenas despesas devem ser lançadas

✅ **Concilie semanalmente:** Evite acúmulo de divergências

✅ **Use recorrentes:** Automatize despesas fixas (aluguel, salários)

✅ **Monitore inadimplência:** Cobre ativamente contas vencidas

✅ **Projete fluxo:** Sempre veja 60 dias à frente

---

## Troubleshooting

**❌ Não consigo emitir NFe:**
- Verifique validade do certificado digital
- Confirme configuração do CNPJ
- Teste conexão com SEFAZ em Configurações

**❌ Split não está dividindo corretamente:**
- Verifique se soma das % = 100%
- Confirme cadastro dos profissionais

**❌ Conciliação não está encontrando transações:**
- Verifique formato do extrato (OFX recomendado)
- Confirme período do extrato vs lançamentos

---

## Próximos Passos

- [Tutorial: Como Configurar NFe](../TUTORIAIS/04-CONFIGURAR-NFE.md)
- [Guia: Recebimentos em Criptomoedas](07-RECEBIMENTOS-CRYPTO.md)
- [Guia: Controle de Inadimplência](08-CONTROLE-INADIMPLENCIA.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
