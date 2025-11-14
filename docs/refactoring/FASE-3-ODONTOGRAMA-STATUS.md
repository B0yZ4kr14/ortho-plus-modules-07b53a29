# FASE 3 - Módulo ODONTOGRAMA (Status)

## 📊 Progresso Geral

```
[▓▓▓░░░░░░░] 25% - Camada de Domínio (Em Progresso)
```

---

## 🎯 Objetivo

Refatorar o módulo **ODONTOGRAMA** seguindo o "Golden Pattern" estabelecido nos módulos AGENDA e ORCAMENTOS, implementando arquitetura limpa em 4 camadas:

1. **Domain** (Entities + Repository Interfaces)
2. **Application** (Use Cases)
3. **Infrastructure** (Repositories + Mappers)
4. **Presentation** (Custom Hooks)

---

## 📋 Camadas

### 1. Domain Layer (Em Progresso - 25%)

#### Entidades
- [ ] `Odontograma` - Entidade principal que representa o odontograma completo do paciente
- [ ] `HistoricoOdontograma` - Entidade para representar entradas de histórico

#### Repository Interfaces
- [ ] `IOdontogramaRepository` - Interface do repositório

---

### 2. Application Layer (0%)

#### Use Cases
- [ ] `GetOdontogramaUseCase` - Buscar odontograma por prontuário
- [ ] `UpdateToothStatusUseCase` - Atualizar status de um dente
- [ ] `UpdateToothSurfaceUseCase` - Atualizar superfície de um dente
- [ ] `AddHistoryEntryUseCase` - Adicionar entrada no histórico

---

### 3. Infrastructure Layer (0%)

#### Repositories
- [ ] `SupabaseOdontogramaRepository`

#### Mappers
- [ ] `OdontogramaMapper`
- [ ] `HistoricoOdontogramaMapper`

#### DI Container
- [ ] Registrar repositórios
- [ ] Registrar Use Cases

---

### 4. Presentation Layer (0%)

#### Custom Hooks
- [ ] `useOdontograma` - Hook principal para gerenciar odontograma
  - Buscar odontograma
  - Atualizar status de dentes
  - Atualizar superfícies
  - Gerenciar histórico

---

## 📝 Notas

- Seguindo arquitetura limpa (Domain → Application → Infrastructure → Presentation)
- Validações de domínio centralizadas nas entidades
- Use Cases orquestram lógica de negócio
- Hooks abstraem complexidade para UI
- DI Container gerencia dependências
