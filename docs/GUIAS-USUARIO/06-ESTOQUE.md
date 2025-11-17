# Guia do Usuário: Gestão de Estoque

**Módulo:** Estoque  
**Roles permitidas:** ADMIN, MEMBER (com permissão)  
**Versão:** 4.0.0

---

## Visão Geral

O módulo de Estoque do Ortho+ permite controle completo de materiais odontológicos através de:

- Cadastro de produtos
- Controle de entradas e saídas
- Inventário físico periódico
- Alertas de estoque mínimo
- Scanner de código de barras (mobile)
- Integração com fornecedores

---

## Cadastro de Produtos

### Adicionar Novo Produto

1. Acesse **Estoque → Produtos**
2. Clique em **"+ Novo Produto"**
3. Preencha os dados:

```
Informações Básicas:
- Nome: "Braquete Metálico Roth 0.022"
- Código/SKU: BRQ-ROT-022
- Código de Barras: 7891234567890
- Categoria: Material Ortodôntico
- Subcategoria: Braquetes

Estoque:
- Quantidade Atual: 100 unidades
- Estoque Mínimo: 20 unidades
- Estoque Máximo: 200 unidades
- Unidade de Medida: Unidade

Financeiro:
- Custo Unitário: R$ 12,50
- Preço de Venda: R$ 25,00
- Margem de Lucro: 100%

Fornecedor:
- Fornecedor Principal: Dental Cremer
- Fornecedores Alternativos: Ortho Source

Localização:
- Depósito: Almoxarifado Principal
- Corredor: A
- Prateleira: 03
- Gaveta: 12
```

4. Clique em **"Salvar"**

### Categorias de Produtos

Categorias padrão do sistema:

- 📦 **Material Ortodôntico:** Braquetes, fios, elásticos
- 💉 **Material de Consumo:** Luvas, máscaras, seringas
- 🦷 **Material Restaurador:** Resinas, amalgama
- 💊 **Medicamentos:** Anestésicos, anti-inflamatórios
- 🔧 **Instrumental:** Pinças, alicates, espelhos
- 🖥️ **Equipamentos:** Cadeiras, fotopolimerizadores

---

## Movimentações de Estoque

### Entrada de Produtos (Compra)

1. **Estoque → Movimentações → + Nova Entrada**
2. Preencha:

```
- Tipo: ENTRADA
- Motivo: Compra de Fornecedor
- Fornecedor: Dental Cremer
- Nota Fiscal: NF-123456
- Data da NF: 10/12/2025

Produtos:
- Braquete Metálico Roth 0.022 | Qtd: 50 | Custo: R$ 12,50
- Fio Orthodôntico 0.018 | Qtd: 20 | Custo: R$ 45,00

Total da Compra: R$ 1.525,00
```

3. Clique em **"Confirmar Entrada"**
4. Estoque é atualizado automaticamente ✅

### Saída de Produtos (Uso em Procedimento)

1. **Estoque → Movimentações → + Nova Saída**
2. Selecione:

```
- Tipo: SAÍDA
- Motivo: Uso em Procedimento
- Paciente: João Silva
- Procedimento: Instalação de Aparelho Ortodôntico
- Dentista: Dr. Carlos Mendes

Materiais Utilizados:
- Braquete Metálico Roth 0.022 | Qtd: 20 unidades
- Resina Adesiva | Qtd: 1 unidade
- Fio Orthodôntico 0.016 | Qtd: 1 unidade
```

3. Clique em **"Confirmar Saída"**
4. Estoque é baixado automaticamente

### Ajustes de Estoque

Para corrigir divergências:

1. **Estoque → Ajustes**
2. Preencha:

```
- Produto: Braquete Metálico
- Quantidade no Sistema: 100
- Quantidade Física (contada): 95
- Diferença: -5 unidades
- Motivo: Perda / Quebra / Vencimento
- Observação: "Encontrados 5 braquetes danificados"
```

3. Clique em **"Aplicar Ajuste"**

---

## Inventário Físico

### Criar Novo Inventário

1. **Estoque → Inventário → + Novo Inventário**
2. Configure:

```
- Nome: Inventário Trimestral Q4/2025
- Data: 15/12/2025
- Responsável: Maria Santos
- Tipo: Completo (todos os produtos)
- Categoria: Todas / Específica
```

3. Clique em **"Iniciar Contagem"**

### Realizar Contagem

**Opção 1: Via Sistema Web**

1. Abra o inventário criado
2. Para cada produto:
   - Digite a quantidade física contada
   - Sistema compara automaticamente com quantidade no sistema
   - Divergências são destacadas em vermelho ⚠️

**Opção 2: Via Scanner Mobile**

1. Abra o app mobile Ortho+
2. Acesse **Estoque → Scanner**
3. Escaneie o código de barras de cada produto
4. Digite a quantidade física
5. Dados sincronizam automaticamente com sistema

### Analisar Divergências

Após contagem:

1. **Inventário → Análise de Divergências**
2. Sistema mostra:

```
Produto: Braquete Metálico Roth 0.022
- Quantidade no Sistema: 100
- Quantidade Física: 95
- Divergência: -5 (-5%)
- Status: CRÍTICA ⚠️
- Ação Sugerida: Ajustar estoque

Produto: Luvas de Procedimento
- Quantidade no Sistema: 500
- Quantidade Física: 515
- Divergência: +15 (+3%)
- Status: NORMAL ✅
```

3. Clique em **"Gerar Ajustes Automáticos"**
4. Sistema cria movimentações de ajuste para corrigir divergências

### Relatório de Inventário

Exporte relatório em PDF com:
- Lista completa de produtos contados
- Divergências encontradas
- Valor total das perdas
- Gráfico de acuracidade por categoria
- Produtos críticos (divergência > 10%)

---

## Scanner de Código de Barras (Mobile)

### Configurar App Mobile

1. Baixe o app **Ortho+ Mobile** (Android/iOS)
2. Faça login com suas credenciais
3. Ative permissão de câmera
4. Acesse **Estoque → Scanner**

### Usar Scanner

**Para consultar produto:**
1. Aponte câmera para código de barras
2. Sistema mostra dados do produto:
   - Nome
   - Quantidade em estoque
   - Localização física
   - Preço

**Para dar entrada rápida:**
1. Escaneie código de barras
2. Digite quantidade recebida
3. Confirme entrada
4. Estoque atualizado em tempo real ✅

**Para dar saída rápida:**
1. Escaneie código de barras
2. Digite quantidade utilizada
3. Selecione motivo (Procedimento / Perda)
4. Confirme saída

---

## Alertas de Estoque

### Configurar Alertas

1. **Estoque → Configurações → Alertas**
2. Configure gatilhos:

```
Estoque Mínimo:
- Produto atinge estoque mínimo configurado
- Notificação: Email + WhatsApp
- Destinatário: Gerente de Estoque

Estoque Crítico:
- Produto com quantidade < 10% do estoque mínimo
- Notificação: Email + SMS + WhatsApp
- Destinatário: Gerente + Diretor

Produto Vencido:
- Produto com validade expirada
- Notificação: Email diário (relatório)
- Ação: Bloquear uso no sistema

Produto Próximo do Vencimento:
- Validade em até 30 dias
- Notificação: Email semanal
- Ação: Destacar na listagem (cor amarela)
```

### Visualizar Alertas

**Dashboard de Alertas Ativos:**

Acesse **Estoque → Alertas** para ver:

- 🔴 **Crítico (3):** Produtos zerados
- 🟡 **Atenção (7):** Produtos abaixo do mínimo
- 🟠 **Vencimento (2):** Produtos vencidos
- ⏰ **Vencendo (5):** Validade < 30 dias

---

## Compras Automáticas

### Configurar Compra Automática

Para produtos de alta rotação:

1. Acesse produto → **Editar**
2. Ative **"Compra Automática"**
3. Configure:

```
- Estoque de Reposição: 50 unidades
- Quantidade de Compra: 100 unidades
- Fornecedor: Dental Cremer
- Prazo de Entrega: 7 dias
```

Sistema gera pedido automaticamente quando estoque ≤ 50.

### Gestão de Pedidos

**Estoque → Pedidos de Compra**

Visualize:
- Pedidos pendentes
- Pedidos em trânsito
- Pedidos recebidos
- Status de aprovação

---

## Validade de Produtos

### Controle de Lotes

Para produtos com validade (medicamentos):

1. No cadastro, ative **"Controlar Lote"**
2. A cada entrada, registre:

```
- Número do Lote: L123456
- Data de Fabricação: 01/10/2025
- Data de Validade: 01/10/2027
- Quantidade: 50 unidades
```

Sistema controla FIFO (First In, First Out) automaticamente.

### Relatório de Vencimentos

**Estoque → Relatórios → Vencimentos**

Filtre por:
- Vencidos: Últimos 30 dias
- Vencendo: Próximos 30/60/90 dias

Ações disponíveis:
- Exportar lista
- Enviar para descarte
- Solicitar devolução ao fornecedor

---

## Integração com Fornecedores

### Cadastrar Fornecedor

1. **Estoque → Fornecedores → + Novo**
2. Preencha:

```
- Razão Social: Dental Cremer S.A.
- CNPJ: 12.345.678/0001-90
- Contato: (11) 3456-7890
- Email: vendas@dentalcremer.com.br
- Prazo de Entrega Médio: 7 dias
- Condições de Pagamento: 30/60 dias
- Desconto por Volume: 5% acima de R$ 5.000
```

### Pedido de Compra

**Criar Pedido:**

1. **Estoque → Pedidos → + Novo Pedido**
2. Selecione fornecedor
3. Adicione produtos:

```
- Braquete Metálico | Qtd: 100 | R$ 12,50
- Fio Orthodôntico | Qtd: 50 | R$ 45,00

Total: R$ 3.500,00
```

4. Clique em **"Enviar Pedido por Email"**
5. Sistema envia automaticamente para fornecedor

**Receber Pedido:**

Quando produtos chegarem:

1. Localize o pedido em **"Pendentes"**
2. Clique em **"Receber Pedido"**
3. Confira produtos recebidos
4. Clique em **"Confirmar Recebimento"**
5. Estoque é atualizado automaticamente

---

## Relatórios de Estoque

### Relatórios Disponíveis

| Relatório | Descrição |
|-----------|-----------|
| **Posição de Estoque** | Quantidade atual de todos os produtos |
| **Movimentações** | Todas as entradas e saídas por período |
| **Curva ABC** | Produtos por valor de estoque (A: 80%, B: 15%, C: 5%) |
| **Giro de Estoque** | Velocidade de venda de cada produto |
| **Produtos Parados** | Produtos sem movimentação há 90+ dias |
| **Análise de Perdas** | Produtos perdidos/vencidos e seu valor |

### Exportar Relatório

1. Selecione o relatório
2. Escolha período
3. Formato: PDF / Excel / CSV
4. Clique em **"Gerar Relatório"**

---

## Dicas e Boas Práticas

✅ **Faça inventário periódico:**
- Mensal: Produtos de alto valor
- Trimestral: Estoque completo

✅ **Configure estoque mínimo realista:**
- Analise consumo médio dos últimos 3 meses
- Considere prazo de entrega do fornecedor
- Adicione margem de segurança de 20%

✅ **Use FIFO rigorosamente:**
- Sempre use produtos mais antigos primeiro
- Reduz perdas por vencimento

✅ **Organize fisicamente:**
- Etiquete prateleiras com códigos
- Agrupe produtos por categoria
- Facilita contagem e localização

✅ **Registre imediatamente:**
- Não deixe movimentações para "depois"
- Erro de 1 dia = dados incorretos

---

## Troubleshooting

**❌ Estoque negativo apareceu:**
- Causa comum: Saída não registrada anteriormente
- Solução: Crie ajuste manual corrigindo quantidade

**❌ Scanner não lê código de barras:**
- Limpe câmera do celular
- Verifique iluminação do ambiente
- Confirme que código está cadastrado no produto

**❌ Divergências grandes no inventário:**
- Investigue produtos mais valiosos primeiro
- Verifique se há movimentações não registradas
- Confira se produtos foram trocados de local

---

## Próximos Passos

- [Tutorial: Como Fazer Inventário](../TUTORIAIS/03-COMO-FAZER-INVENTARIO.md)
- [Guia: Dashboard de Inventário](09-DASHBOARD-INVENTARIO.md)
- [Guia: Integração com Fornecedores](10-FORNECEDORES.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
