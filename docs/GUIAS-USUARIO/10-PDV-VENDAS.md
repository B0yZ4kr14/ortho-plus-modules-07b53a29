# Guia do Usuário: PDV e Vendas

**Módulo:** PDV (Ponto de Venda)  
**Roles permitidas:** ADMIN, MEMBER (com permissão)  
**Versão:** 4.0.0

---

## Visão Geral

O módulo PDV (Ponto de Venda) permite gerenciar vendas de produtos odontológicos na clínica, incluindo:

- Abertura e fechamento de caixa
- Registro de vendas com múltiplos métodos de pagamento
- Emissão automática de NFCe (Cupom Fiscal)
- Integração com TEF (cartões)
- Sangria e suprimento de caixa
- Controle de vendedores e metas
- Relatórios de vendas e performance

---

## Abertura de Caixa

### Iniciar Expediente

1. Acesse **PDV → Caixa**
2. Clique em **"Abrir Caixa"**
3. Preencha:

```
Operador: Maria Santos (seu usuário)
Data: 15/12/2025 (automático)
Valor Inicial em Dinheiro: R$ 100,00
  (Troco inicial para o dia)

Observações: Caixa aberto para expediente normal
```

4. Clique em **"Confirmar Abertura"**

**Status do Caixa:** 🟢 ABERTO

---

## Realizar Venda

### Passo 1: Adicionar Produtos

1. Na tela do PDV, comece a digitar nome/código do produto:
   ```
   Busca: [braq___]
   
   Sugestões:
   - Braquete Metálico Roth 0.022 (R$ 12,50)
   - Braquete Cerâmico (R$ 25,00)
   ```

2. Clique no produto desejado ou pressione ENTER
3. Digite quantidade: `10`
4. Produto é adicionado ao carrinho:

```
┌─────────────────────────────────────────┐
│ CARRINHO DE VENDAS                      │
├─────────────────────────────────────────┤
│ Produto              Qtd  Unit.  Total  │
│ Braquete Metálico    10   12,50  125,00 │
│                                         │
│ [Remover] [Editar Qtd] [Desconto]      │
├─────────────────────────────────────────┤
│ Subtotal:                   R$ 125,00   │
│ Desconto:                   R$ 0,00     │
│ TOTAL:                      R$ 125,00   │
└─────────────────────────────────────────┘
```

**Atalhos de Teclado:**
- `F2`: Buscar produto por código de barras
- `F3`: Aplicar desconto
- `F4`: Cancelar item
- `F5`: Finalizar venda
- `ESC`: Limpar carrinho

### Passo 2: Aplicar Desconto (Opcional)

1. Clique em **"Desconto"** ou pressione `F3`
2. Escolha tipo:
   - **Percentual:** `10%` → R$ 12,50 de desconto
   - **Valor fixo:** `R$ 15,00` de desconto

3. Se desconto > 10%, sistema pede autorização de gerente:
   ```
   ⚠️ Desconto acima de 10% requer autorização
   
   Gerente: [Selecionar]
   Senha: [********]
   Motivo: Cliente fidelidade
   
   [Cancelar] [Autorizar]
   ```

### Passo 3: Identificar Cliente (Opcional)

```
Cliente: [Buscar por CPF/Nome___]

☑️ João Silva (CPF: 123.456.789-00)
☐ Venda sem identificação (CPF na nota)
```

**Vantagens de identificar cliente:**
- Emitir NFCe com CPF automaticamente
- Rastrear histórico de compras
- Programa de fidelidade

---

## Finalizar Venda

### Escolher Forma de Pagamento

1. Clique em **"Finalizar"** (F5)
2. Escolha método de pagamento:

```
┌─────────────────────────────────────────┐
│ TOTAL A PAGAR: R$ 125,00                │
├─────────────────────────────────────────┤
│                                         │
│ [💵 Dinheiro]  [💳 Débito]  [💳 Crédito]│
│                                         │
│ [📱 PIX]  [🪙 Cripto]  [🔁 Parcelado]   │
│                                         │
└─────────────────────────────────────────┘
```

### Opção 1: Dinheiro

```
Total: R$ 125,00
Valor Recebido: R$ 150,00

━━━━━━━━━━━━━━━━━━━━━━━━
Troco: R$ 25,00
━━━━━━━━━━━━━━━━━━━━━━━━
```

Sistema abre gaveta do caixa automaticamente (se conectado).

### Opção 2: Cartão (Débito/Crédito via TEF)

1. Selecione **"Débito"** ou **"Crédito"**
2. Sistema se comunica com máquina de cartão:
   ```
   🔄 Conectando com TEF...
   
   Máquina: Cielo LIO
   Valor: R$ 125,00
   
   Aguarde o cliente inserir/aproximar o cartão...
   ```

3. Cliente insere cartão
4. Digite senha no PIN pad
5. Sistema aguarda autorização:
   ```
   ✅ TRANSAÇÃO APROVADA
   
   Operadora: Mastercard
   NSU: 123456
   Código Autorização: 789012
   
   [Imprimir Comprovante]
   ```

**Se crédito, perguntar parcelas:**
```
Parcelar em quantas vezes?
☑️ À vista
☐ 2x sem juros
☐ 3x sem juros
☐ 4x a 12x (com juros)
```

### Opção 3: PIX

1. Sistema gera QR Code automaticamente:
   ```
   ┌───────────────────────┐
   │                       │
   │   [QR CODE AQUI]      │
   │                       │
   │  Valor: R$ 125,00     │
   │  Expira em: 5:00      │
   └───────────────────────┘
   
   Copiar chave PIX: [copiar]
   ```

2. Cliente escaneia ou copia chave PIX
3. Sistema aguarda confirmação de pagamento
4. Após pagamento confirmado:
   ```
   ✅ Pagamento PIX confirmado!
   ```

### Opção 4: Criptomoedas

1. Cliente escolhe moeda: Bitcoin / USDT / ETH
2. Sistema gera endereço de pagamento:
   ```
   Valor: R$ 125,00
   Equivalente: 0.00234 BTC
   
   Endereço: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
   
   [QR Code]
   
   ⏳ Aguardando confirmação na blockchain...
   ```

3. Após confirmação:
   ```
   ✅ Pagamento confirmado!
   TxID: abc123def456...
   ```

---

## Emissão de NFCe (Cupom Fiscal)

Após pagamento confirmado, sistema emite NFCe automaticamente:

```
🖨️ Emitindo NFCe...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ORTHO PLUS CENTRO
   CNPJ: 12.345.678/0001-90
   Av. Paulista, 1234 - São Paulo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUPOM FISCAL ELETRÔNICO - SAT

Nº: 000123       Série: 001
Data: 15/12/2025  Hora: 14:32

ITEM  DESCRIÇÃO        QTD  UNIT   TOTAL
001   Braquete Metal.  10   12,50  125,00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL R$                         125,00

FORMA DE PAGAMENTO
Dinheiro                         125,00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Consulte pela Chave de Acesso:
35250112345678000190590010000123001234567890

[QR CODE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Obrigado pela preferência!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

NFCe é impressa automaticamente na impressora fiscal.

---

## Sangria de Caixa

**Quando fazer:** Quando há muito dinheiro no caixa (acima de R$ 500)

1. Clique em **"Sangria"**
2. Preencha:
   ```
   Valor da Sangria: R$ 300,00
   Motivo: Excesso de numerário no caixa
   Responsável pelo Recolhimento: Gerente João
   Observações: Depósito bancário será feito amanhã
   ```

3. Sistema registra movimento:
   ```
   ✅ Sangria realizada
   
   Novo saldo em caixa: R$ 250,00
   ```

**IA Sugere Sangria Automaticamente:**

Se sistema detectar horário de risco (final do expediente) + valor alto:

```
⚠️ SUGESTÃO DE SANGRIA

Valor em caixa: R$ 850,00
Horário: 18:30 (pico de risco de assalto)

Baseado em dados históricos, recomendamos
realizar sangria de R$ 650,00 agora.

[Ignorar] [Realizar Sangria]
```

---

## Suprimento de Caixa

**Quando fazer:** Quando falta troco

1. Clique em **"Suprimento"**
2. Preencha:
   ```
   Valor do Suprimento: R$ 100,00
   Origem: Cofre da clínica
   Responsável: Maria Santos
   Observações: Reposição de troco
   ```

3. Sistema registra movimento

---

## Fechamento de Caixa

### Encerrar Expediente

1. Clique em **"Fechar Caixa"**
2. Sistema exibe resumo do dia:

```
┌──────────────────────────────────────────────┐
│ FECHAMENTO DE CAIXA - 15/12/2025            │
├──────────────────────────────────────────────┤
│                                              │
│ Abertura:         08:00   Troco: R$ 100,00  │
│ Fechamento:       18:30                      │
│                                              │
│ VENDAS DO DIA                                │
│ Total de Vendas:  47      Valor: R$ 5.840,00│
│                                              │
│ POR FORMA DE PAGAMENTO:                      │
│ 💵 Dinheiro:     12 vendas    R$ 1.200,00   │
│ 💳 Débito:       18 vendas    R$ 2.340,00   │
│ 💳 Crédito:      15 vendas    R$ 2.100,00   │
│ 📱 PIX:           2 vendas    R$ 200,00     │
│                                              │
│ MOVIMENTAÇÕES:                               │
│ ➕ Suprimentos:               R$ 100,00     │
│ ➖ Sangrias:                  R$ 300,00     │
│                                              │
│ SALDO ESPERADO EM CAIXA:      R$ 1.100,00   │
│                                              │
└──────────────────────────────────────────────┘
```

3. **Contagem Física de Dinheiro:**
   ```
   Digite o valor real contado no caixa:
   R$ [1.095,00___]
   
   Divergência: R$ 5,00 a menos (quebra)
   ```

4. Se houver divergência:
   ```
   ⚠️ Divergência de Caixa Detectada
   
   Esperado: R$ 1.100,00
   Contado:  R$ 1.095,00
   Falta:    R$ 5,00 (0.45%)
   
   Justificativa: [Quebra de caixa normal___]
   
   [Cancelar] [Confirmar Fechamento]
   ```

5. Clique em **"Confirmar Fechamento"**
6. Sistema gera relatório PDF do fechamento

---

## Gamificação e Metas

### Metas de Vendas

Cada vendedor tem metas mensais configuradas:

```
┌────────────────────────────────────────┐
│ METAS - MARIA SANTOS - DEZ/2025       │
├────────────────────────────────────────┤
│                                        │
│ Meta Mensal: R$ 50.000,00              │
│ Vendido até agora: R$ 32.500,00        │
│ Progresso: 65% ████████░░░░░           │
│                                        │
│ Faltam: R$ 17.500,00(12 dias úteis)  │
│ Média/dia necessária: R$ 1.458,33      │
│                                        │
│ Status: 🟡 NO PRAZO                    │
└────────────────────────────────────────┘
```

### Ranking de Vendedores

```
🏆 RANKING DO MÊS (Dezembro/2025)

🥇 1º - Maria Santos     R$ 32.500 (130% da meta)
🥈 2º - João Oliveira    R$ 28.000 (112% da meta)
🥉 3º - Ana Costa        R$ 24.500 (98% da meta)
   4º - Pedro Silva      R$ 22.000 (88% da meta)
```

### Premiações Automáticas

Quando meta é atingida:

```
🎉 PARABÉNS! VOCÊ BATEU SUA META!

Maria Santos atingiu 100% da meta mensal!

Prêmio: R$ 500,00 (bônus)
Adicionado automaticamente ao próximo pagamento.

[Compartilhar Conquista] [Fechar]
```

---

## Relatórios de Vendas

### Dashboard de Vendas

**PDV → Relatórios → Dashboard**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE GERAL - DEZEMBRO/2025

Total de Vendas: R$ 145.000,00
Ticket Médio: R$ 124,35
Vendas/Dia: R$ 4.833,33

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAS DE PAGAMENTO MAIS USADAS
1. Débito: 42%
2. Crédito: 35%
3. Dinheiro: 18%
4. PIX: 5%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HORÁRIOS DE PICO
🔥 14:00-16:00 (32% das vendas)
   10:00-12:00 (28% das vendas)
   16:00-18:00 (25% das vendas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUTOS MAIS VENDIDOS
1. Braquete Metálico (1.234 un)
2. Fio Ortodôntico (856 un)
3. Elástico (645 un)
```

### Exportar Relatório

1. Clique em **"Exportar"**
2. Escolha formato: PDF / Excel
3. Escolha período: Hoje / Esta Semana / Este Mês / Customizado
4. Clique em **"Gerar Relatório"**

---

## Conciliação com Banco

**PDV → Relatórios → Conciliação Bancária**

Sistema compara vendas registradas com extrato bancário:

```
┌────────────────────────────────────────────┐
│ CONCILIAÇÃO - 15/12/2025                   │
├────────────────────────────────────────────┤
│                                            │
│ VENDAS REGISTRADAS (PIX):   R$ 3.450,00   │
│ EXTRATO BANCÁRIO (PIX):     R$ 3.450,00   │
│ Divergência:                R$ 0,00 ✅     │
│                                            │
│ VENDAS REGISTRADAS (Déb):   R$ 5.230,00   │
│ EXTRATO BANCÁRIO (Déb):     R$ 5.180,00   │
│ Divergência:                R$ 50,00 ⚠️    │
│                                            │
│ [Ver Detalhes da Divergência]              │
└────────────────────────────────────────────┘
```

---

## Segurança e Controle

### Permissões

- **Vendedor:** Pode realizar vendas, sem acesso a fechamento
- **Gerente:** Acesso total incluindo fechamento e relatórios
- **Administrador:** Configurações e acesso a dados históricos

### Auditoria

Todas as ações são registradas:
```
15/12/2025 14:32 - Maria Santos - VENDA - R$ 125,00
15/12/2025 15:15 - Maria Santos - SANGRIA - R$ 300,00
15/12/2025 18:30 - Maria Santos - FECHAMENTO - Divergência: -R$ 5,00
```

---

## Próximos Passos

- [Tutorial: Como Configurar NFCe](../TUTORIAIS/05-CONFIGURAR-NFCE.md)
- [Guia: Gestão Financeira](05-GESTAO-FINANCEIRA.md)
- [Guia: Integração com TEF](11-INTEGRACAO-TEF.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
