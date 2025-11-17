# Tutorial: Como Fazer Inventário de Estoque

**Nível:** Intermediário  
**Tempo estimado:** 30-45 minutos  
**Módulo:** Estoque → Inventário

---

## Objetivo

Neste tutorial, você aprenderá a realizar um inventário físico completo do estoque da clínica, identificar divergências e ajustar automaticamente as quantidades no sistema.

---

## Pré-requisitos

- Ter role **ADMIN** ou **MEMBER** com permissão "Estoque"
- Módulo "Inventário" ativado
- Produtos cadastrados no sistema
- (Opcional) App mobile instalado para usar scanner

---

## Quando Fazer Inventário?

**Recomendações:**

| Tipo de Produto | Frequência Sugerida |
|-----------------|---------------------|
| **Alto Valor** (> R$ 500) | Mensal |
| **Alto Giro** (uso diário) | Trimestral |
| **Medicamentos** (com validade) | Mensal |
| **Estoque Geral Completo** | Semestral ou Anual |

---

## Passo 1: Criar Novo Inventário

1. Acesse **Estoque → Inventário**
2. Clique em **"+ Novo Inventário"**
3. Preencha o formulário:

```
Nome do Inventário: Inventário Trimestral Q4/2025
Data: 15/12/2025
Responsável: Maria Santos (selecionar da lista)
Tipo de Inventário:
  ☑️ Completo (todos os produtos)
  ☐ Parcial (apenas algumas categorias)

Se Parcial, selecionar categorias:
  ☐ Material Ortodôntico
  ☐ Material de Consumo
  ☐ Medicamentos
```

4. Clique em **"Criar e Iniciar Contagem"**

---

## Passo 2: Realizar Contagem Física

Você tem **duas opções** para realizar a contagem:

### Opção A: Via Sistema Web (Computador)

1. Na lista de inventários, clique em **"Iniciar Contagem"** no inventário criado
2. Sistema exibe lista de todos os produtos:

```
┌─────────────────────────────────────────────────────┐
│ Produto: Braquete Metálico Roth 0.022               │
│ Código: BRQ-ROT-022                                 │
│ Localização: Almoxarifado - Corredor A - Prat. 03  │
│                                                     │
│ Quantidade no Sistema: 100 unidades                 │
│ Quantidade Física Contada: [ _____ ]               │
│                                                     │
│ [Próximo Produto]                                   │
└─────────────────────────────────────────────────────┘
```

3. Para cada produto:
   - Vá até o local físico
   - Conte as unidades
   - Digite a quantidade no campo "Quantidade Física"
   - Clique em **"Próximo Produto"**

4. Repita até finalizar todos os produtos

---

### Opção B: Via App Mobile com Scanner (Recomendado)

**Vantagens:** Mais rápido, menos erros, uso de código de barras

**Passos:**

1. Abra o app **Ortho+ Mobile**
2. Acesse **Estoque → Scanner de Inventário**
3. Selecione o inventário: "Inventário Trimestral Q4/2025"
4. Para cada produto:
   - **Escaneie o código de barras** do produto
   - Sistema mostra:
     ```
     Produto: Braquete Metálico Roth 0.022
     Quantidade no Sistema: 100
     ```
   - Digite a quantidade física contada: `95`
   - Clique em **"Confirmar"**
   - Sistema salva automaticamente e sincroniza em tempo real

5. Continue escaneando e contando todos os produtos

**Dica:** Use ordem física (corredor por corredor) para não perder itens

---

## Passo 3: Revisar Divergências

Após contagem completa:

1. Clique em **"Finalizar Contagem"**
2. Sistema mostra resumo:

```
┌─────────────────────────────────────────────────────┐
│ RESUMO DO INVENTÁRIO                                │
│                                                     │
│ Total de Produtos Contados: 247                     │
│ Produtos com Divergência: 23 (9.3%)                │
│ Produtos OK (sem divergência): 224 (90.7%)         │
│                                                     │
│ Divergências por Criticidade:                      │
│   🔴 CRÍTICA (> 20%): 3 produtos                   │
│   🟡 ALTA (10-20%): 8 produtos                     │
│   🟢 NORMAL (< 10%): 12 produtos                   │
│                                                     │
│ Valor Total das Divergências: R$ 3.456,78          │
└─────────────────────────────────────────────────────┘
```

3. Clique em **"Ver Divergências Detalhadas"**

---

## Passo 4: Analisar Divergências

Sistema exibe tabela com produtos que apresentaram diferença:

| Produto | Sistema | Físico | Divergência | Criticidade | Valor Perda |
|---------|---------|--------|-------------|-------------|-------------|
| Braquete Metálico | 100 | 95 | -5 (-5%) | 🟢 Normal | R$ 62,50 |
| Luvas P | 500 | 515 | +15 (+3%) | 🟢 Normal | R$ 0,00 |
| Anestésico | 50 | 35 | -15 (-30%) | 🔴 Crítica | R$ 450,00 |

**Análise:**

- **Divergência Negativa (-):** Produto está faltando (perda, uso não registrado, furto)
- **Divergência Positiva (+):** Produto sobrou (entrada não registrada, contagem anterior errada)
- **Criticidade:**
  - 🔴 **Crítica:** > 20% de diferença
  - 🟡 **Alta:** 10-20% de diferença
  - 🟢 **Normal:** < 10% de diferença

---

## Passo 5: Investigar Divergências Críticas

Para divergências críticas (🔴), investigue antes de ajustar:

**Perguntas a fazer:**

1. **Houve uso não registrado?**
   - Verificar se dentistas esqueceram de dar baixa
   - Conferir agenda (consultas realizadas no período)

2. **Houve quebra/perda não informada?**
   - Conversar com equipe
   - Verificar produtos vencidos

3. **Erro de contagem?**
   - Recontar fisicamente o produto
   - Verificar se produto está em múltiplas localizações

4. **Entrada não registrada?**
   - Verificar notas fiscais recentes
   - Checar se compra foi lançada no sistema

**Adicionar Observações:**

```
Produto: Anestésico Mepivacaína 2%
Divergência: -15 unidades (-30%)

Observação: 
"Após investigação, identificamos que Dr. Carlos utilizou 
10 unidades em procedimentos de emergência no último 
fim de semana e esqueceu de registrar. Outras 5 unidades 
foram encontradas vencidas e descartadas."
```

---

## Passo 6: Gerar Ajustes Automáticos

Após análise das divergências:

1. Clique em **"Gerar Ajustes Automáticos"**
2. Sistema exibe confirmação:

```
┌─────────────────────────────────────────────────────┐
│ CONFIRMAÇÃO DE AJUSTES                              │
│                                                     │
│ Serão criadas 23 movimentações de AJUSTE:          │
│                                                     │
│ • Braquete Metálico: -5 unidades                   │
│ • Luvas P: +15 unidades                            │
│ • Anestésico: -15 unidades                         │
│ ... (mais 20 produtos)                             │
│                                                     │
│ Essas movimentações irão corrigir as quantidades   │
│ do sistema para refletir o estoque físico real.    │
│                                                     │
│ ⚠️ Esta ação não pode ser desfeita!                │
│                                                     │
│ [Cancelar]  [Confirmar Ajustes]                    │
└─────────────────────────────────────────────────────┘
```

3. Clique em **"Confirmar Ajustes"**

**O que acontece:**

Sistema cria automaticamente movimentações de estoque tipo **AJUSTE**:

```sql
-- Exemplo de movimentação criada
INSERT INTO estoque_movimentacoes (
  produto_id,
  tipo,
  quantidade,
  motivo,
  user_id
) VALUES (
  'braquete-metalico-id',
  'AJUSTE',
  -5,  -- Negativo = redução
  'Ajuste de inventário Q4/2025 - Perda identificada',
  'maria-santos-id'
);
```

Resultado: **Quantidades no sistema agora batem com o físico!** ✅

---

## Passo 7: Exportar Relatório PDF

Para documentação e compliance:

1. Clique em **"Gerar Relatório PDF"**
2. Relatório inclui:

```
📄 RELATÓRIO DE INVENTÁRIO

Clínica: Ortho Plus Centro
Data: 15/12/2025
Responsável: Maria Santos
Tipo: Completo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO

Total de Produtos: 247
Divergências: 23 (9.3%)
Acuracidade: 90.7%
Valor das Perdas: R$ 3.456,78

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DIVERGÊNCIAS CRÍTICAS

1. Anestésico Mepivacaína 2%
   Sistema: 50 | Físico: 35 | Dif: -15 (-30%)
   Valor Perda: R$ 450,00
   Obs: Uso não registrado + descarte de vencidos

[... mais divergências ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRÁFICOS

[Gráfico de Pizza: Distribuição de Criticidade]
[Gráfico de Barras: Top 10 Produtos com Maior Perda]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSINATURA

____________________________
Maria Santos (Responsável)

____________________________
Dr. Carlos Mendes (Gestor)
```

3. PDF é gerado e baixado automaticamente

---

## Passo 8: Agendar Próximo Inventário

Para não esquecer:

1. Clique em **"Agendar Próximo Inventário"**
2. Preencha:

```
Tipo: Completo
Frequência: Trimestral
Próxima Data: 15/03/2026 (3 meses a partir de hoje)
Responsável: Maria Santos
Notificar 7 dias antes: ✅
```

3. Sistema criará automaticamente o próximo inventário e enviará notificações

---

## Boas Práticas

### ✅ Preparação

- **Avisar a equipe:** Comunique que haverá inventário (evita movimentações durante contagem)
- **Escolher horário:** Fazer fora do expediente ou em momento de pouco movimento
- **Equipe dedicada:** Designar pessoas específicas para a contagem
- **Organização física:** Antes do inventário, organize produtos por categoria

### ✅ Durante a Contagem

- **Não interromper:** Evite pausas longas (risco de perder o controle)
- **Marcar contados:** Use etiquetas/marcações para saber quais já foram contados
- **Dupla verificação:** Produtos de alto valor devem ser contados por 2 pessoas
- **Fotografar:** Tirar fotos de produtos com grande divergência (evidência)

### ✅ Após o Inventário

- **Reunião de feedback:** Discutir com equipe as divergências encontradas
- **Ações corretivas:** Implementar melhorias (ex: treinamento sobre baixa de estoque)
- **Monitorar tendências:** Acompanhar se divergências melhoram nos próximos inventários
- **Documentar:** Guardar relatório PDF para auditoria futura

---

## Indicadores de Sucesso

**Meta de Acuracidade:** 95%

```
Acuracidade = (Produtos OK / Total de Produtos) × 100

Exemplo:
- Total: 247 produtos
- OK (sem divergência): 224
- Acuracidade: (224 / 247) × 100 = 90.7%

Status: 🟡 Abaixo da meta (95%)
Ação: Investigar causas das divergências e implementar melhorias
```

**Evolução:**

| Inventário | Data | Acuracidade | Tendência |
|------------|------|-------------|-----------|
| Q1/2025 | 15/03 | 87% | - |
| Q2/2025 | 15/06 | 89% | ↗️ Melhorando |
| Q3/2025 | 15/09 | 92% | ↗️ Melhorando |
| Q4/2025 | 15/12 | 90.7% | ↘️ Piorou |

---

## Troubleshooting

### ❌ Divergências muito altas (> 20%)

**Causas comuns:**
- Uso de produtos sem registro de baixa
- Produtos armazenados em múltiplos locais
- Erro na contagem anterior

**Solução:**
1. Recontar fisicamente
2. Verificar se há produtos "escondidos" em outros locais
3. Treinar equipe sobre importância de registrar saídas

### ❌ Não encontrei o produto no estoque físico

**Possíveis razões:**
- Produto foi usado e não baixado
- Produto foi movido para outro local
- Produto foi descartado (vencido)

**Solução:**
1. Buscar em outros locais possíveis
2. Perguntar à equipe
3. Se confirmada falta, registrar divergência como **-100%**
4. Adicionar observação: "Produto não localizado"

### ❌ Sistema está lento durante contagem via app mobile

**Solução:**
1. Verificar conexão de internet
2. Fechar e reabrir o app
3. Limpar cache do app
4. Se persistir, usar modo web (computador)

---

## Conclusão

Inventário realizado com sucesso! 🎉

**Próximos passos:**
- Acompanhar acuracidade do estoque
- Implementar melhorias identificadas
- Agendar próximo inventário

---

## Referências

- [Guia: Gestão de Estoque](../GUIAS-USUARIO/06-ESTOQUE.md)
- [Guia: Dashboard de Inventário](../GUIAS-USUARIO/09-DASHBOARD-INVENTARIO.md)
- [Tutorial: Como Usar Scanner Mobile](04-SCANNER-MOBILE-ESTOQUE.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](../GUIAS-USUARIO/13-FAQ-CLINICA.md)
