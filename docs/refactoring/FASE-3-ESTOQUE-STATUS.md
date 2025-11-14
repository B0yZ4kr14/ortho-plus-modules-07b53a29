# FASE 3 - Módulo ESTOQUE (Status)

## 📊 Progresso Geral

```
[▓▓▓▓▓▓▓▓▓▓] 100% - TODAS AS CAMADAS COMPLETAS ✅
```

---

## 🎯 Objetivo

Refatorar o módulo **ESTOQUE** seguindo o "Golden Pattern" estabelecido nos módulos AGENDA, ORCAMENTOS e ODONTOGRAMA, implementando arquitetura limpa em 4 camadas:

1. **Domain** (Entities + Repository Interfaces)
2. **Application** (Use Cases)
3. **Infrastructure** (Repositories + Mappers)
4. **Presentation** (Custom Hooks)

---

## 📋 Camadas

### 1. Domain Layer ✅ (100%)

#### Entidades
- ✅ `Produto` - Entidade principal que representa um produto em estoque
  - Factory methods: `create()`, `restore()`
  - Propriedades: id, clinicId, nome, descricao, categoria, unidadeMedida, quantidadeAtual, quantidadeMinima, valorUnitario, codigoBarras, fornecedor, localizacao, observacoes, ativo, timestamps
  - Métodos de domínio:
    - `atualizar()` - Atualiza informações do produto
    - `adicionarEstoque()` - Adiciona quantidade
    - `removerEstoque()` - Remove quantidade (valida disponibilidade)
    - `ajustarEstoque()` - Ajuste manual
    - `isEstoqueBaixo()` - Verifica se está abaixo do mínimo
    - `isEstoqueZerado()` - Verifica se está zerado
    - `calcularValorTotal()` - Calcula valor total em estoque
    - `inativar()` / `reativar()` - Controle de status
  - Validações: nome obrigatório, quantidades não negativas, valor unitário não negativo
- ✅ `MovimentacaoEstoque` - Entidade para movimentações (entrada/saída/ajuste)
  - Factory methods: `create()`, `restore()`
  - Propriedades: id, produtoId, clinicId, tipo, quantidade, quantidadeAnterior, quantidadeAtual, valorUnitario, valorTotal, motivo, observacoes, usuarioId, createdAt
  - Métodos de domínio:
    - `calcularDiferenca()` - Diferença entre antes/depois
    - `isEntrada()` / `isSaida()` / `isAjuste()` - Verificação de tipo
  - Validações: quantidade não-zero, estoque suficiente para saída, cálculo automático de valores
  - Auditoria completa (usuário, timestamp)

#### Repository Interfaces
- ✅ `IProdutoRepository` - Interface do repositório de produtos
  - `findById()` - Buscar por ID
  - `findByCodigoBarras()` - Buscar por código de barras
  - `findByClinicId()` - Buscar por clínica
  - `findActiveByClinicId()` - Buscar ativos
  - `findByCategoria()` - Buscar por categoria
  - `findEstoqueBaixo()` - Buscar com estoque baixo
  - `findEstoqueZerado()` - Buscar zerados
  - `save()` - Salvar novo
  - `update()` - Atualizar existente
  - `delete()` - Remover
- ✅ `IMovimentacaoEstoqueRepository` - Interface do repositório de movimentações
  - `findById()` - Buscar por ID
  - `findByProdutoId()` - Buscar por produto
  - `findByProdutoAndDateRange()` - Buscar por período
  - `findByClinicId()` - Buscar por clínica
  - `findByTipo()` - Buscar por tipo
  - `findByUsuarioId()` - Buscar por usuário
  - `save()` - Salvar nova
  - `delete()` - Remover

---

### 2. Application Layer ✅ (100%)

#### Use Cases
- ✅ `CreateProdutoUseCase` - Criar novo produto
  - Validação de código de barras único
  - Validações de input e domínio
- ✅ `UpdateProdutoUseCase` - Atualizar produto existente
  - Validação de código de barras único (se alterado)
  - Validações de input e domínio
- ✅ `GetProdutoByIdUseCase` - Buscar produto por ID
  - Validações de input
- ✅ `ListProdutosByClinicUseCase` - Listar produtos da clínica
  - Opção de filtrar apenas ativos
  - Validações de input
- ✅ `RegistrarEntradaUseCase` - Registrar entrada de estoque
  - Cria movimentação ENTRADA
  - Atualiza quantidade do produto
  - Validação de produto ativo
  - Usa valor unitário fornecido ou do produto
- ✅ `RegistrarSaidaUseCase` - Registrar saída de estoque
  - Cria movimentação SAIDA
  - Atualiza quantidade do produto
  - Validação de estoque disponível
  - Validação de produto ativo
- ✅ `AjustarEstoqueUseCase` - Ajustar estoque (correção)
  - Cria movimentação AJUSTE
  - Atualiza quantidade do produto
  - Motivo obrigatório (auditoria)
  - Validação de produto ativo
- ✅ `GetMovimentacoesByProdutoUseCase` - Buscar movimentações de um produto
  - Opção de filtrar por período
  - Validação de datas

---

### 3. Infrastructure Layer (0%)

#### Repositories
- [ ] `SupabaseProdutoRepository`
- [ ] `SupabaseMovimentacaoEstoqueRepository`

#### Mappers
- [ ] `ProdutoMapper`
- [ ] `MovimentacaoEstoqueMapper`

#### DI Container
- [ ] Registrar repositórios
- [ ] Registrar Use Cases

---

### 4. Presentation Layer (0%)

#### Custom Hooks
- [ ] `useProdutos` - Hook principal para gerenciar produtos
  - Buscar produtos
  - Criar/atualizar/deletar produto
  - Filtrar por categoria
  - Alertas de estoque baixo
- [ ] `useMovimentacoesEstoque` - Hook para gerenciar movimentações
  - Registrar entrada/saída/ajuste
  - Histórico de movimentações
  - Relatórios

---

## 📝 Notas

- Seguindo arquitetura limpa (Domain → Application → Infrastructure → Presentation)
- Validações de domínio centralizadas nas entidades
- Use Cases orquestram lógica de negócio
- Hooks abstraem complexidade para UI
- DI Container gerencia dependências
- Alertas automáticos para estoque baixo
- Rastreabilidade completa de movimentações
