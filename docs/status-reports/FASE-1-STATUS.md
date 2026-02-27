# FASE 1: Foundation - Clean Architecture

## Status: ✅ CONCLUÍDA

### Objetivo
Estabelecer a base arquitetural do projeto com Clean Architecture, separação de camadas e padrões SOLID.

---

## T1.1: Estrutura de Pastas ✅

**Status:** Concluída

**Estrutura Criada:**
```
src/
├── domain/                 # Camada de Domínio (Business Logic)
│   ├── entities/          # Entidades de negócio
│   ├── value-objects/     # Value Objects (Email, CPF, Phone, ModuleKey)
│   └── repositories/      # Interfaces de repositórios
├── application/           # Camada de Aplicação (Use Cases)
│   └── use-cases/
│       ├── patient/       # Use cases de Patient
│       ├── module/        # Use cases de Module
│       └── user/          # Use cases de User
├── infrastructure/        # Camada de Infraestrutura
│   ├── repositories/      # Implementações Supabase
│   ├── mappers/          # Data Mappers (DB ↔ Domain)
│   ├── errors/           # Custom Errors
│   └── di/               # Dependency Injection
└── presentation/          # Camada de Apresentação (React)
    └── (páginas e componentes existentes)
```

**Métricas:**
- 5 diretórios criados
- Estrutura alinhada com Clean Architecture
- Separação clara de responsabilidades

---

## T1.2: Camada de Infraestrutura ✅

**Status:** Concluída com adaptações

**Componentes Implementados:**

### 1. Sistema de Erros Customizados
- `DomainError` (base class)
- `ValidationError`
- `NotFoundError`
- `UnauthorizedError`
- `InfrastructureError`

### 2. Mappers (Database ↔ Domain)
- `PatientMapper` - Mapeia `prontuarios` → `Patient`
- `ModuleMapper` - Mapeia `module_catalog` + `clinic_modules` → `Module`
- `UserMapper` - Mapeia `profiles` → `User`

**Lição Aprendida:**
Adaptamos os mappers ao schema **real** do Supabase ao invés de criar novos schemas. A tabela `prontuarios` foi usada como fonte de dados de pacientes.

### 3. Repositories Supabase
- `SupabasePatientRepository` implementa `IPatientRepository`
- `SupabaseModuleRepository` implementa `IModuleRepository`
- `SupabaseUserRepository` implementa `IUserRepository`

**Adaptações Realizadas:**
- Usado `any` com type assertions para campos adicionados via migration (`app_role`, `is_active`, `phone`)
- Filtros aplicados via código JavaScript ao invés de queries SQL com campos não regenerados
- Método `maybeSingle()` usado para evitar erros em registros não encontrados

**Métricas:**
- 3 repositórios implementados
- 3 mappers criados
- 5 classes de erro customizadas
- 100% dos métodos das interfaces implementados

---

## T1.3: Camada de Aplicação (Use Cases) ✅

**Status:** Concluída

**Use Cases Implementados:**

### Patient (4 use cases)
1. `CreatePatientUseCase` - Criar novo paciente com validações
2. `GetPatientByIdUseCase` - Buscar paciente por ID com controle de acesso
3. `ListPatientsByClinicUseCase` - Listar pacientes da clínica
4. `UpdatePatientUseCase` - Atualizar dados do paciente

### Module (2 use cases)
1. `GetActiveModulesUseCase` - Buscar módulos ativos da clínica
2. `ToggleModuleStateUseCase` - Ativar/Desativar módulos (ADMIN only)

### User (3 use cases)
1. `GetUserByIdUseCase` - Buscar usuário por ID
2. `UpdateUserUseCase` - Atualizar dados do usuário
3. `ListUsersByClinicUseCase` - Listar usuários da clínica

**Padrões Aplicados:**
- ✅ Cada use case tem responsabilidade única
- ✅ DTOs para entrada de dados
- ✅ Validações de negócio centralizadas
- ✅ Controle de acesso (multi-tenancy) em todos os use cases
- ✅ Uso de métodos de domínio das entidades
- ✅ Erros customizados para diferentes cenários

**Métricas:**
- 9 use cases implementados
- 100% com validação de permissões
- 100% usando entidades de domínio
- 0 dependências de framework na camada de aplicação

---

## T1.4: Dependency Injection Container ✅

**Status:** Concluída

**Componentes Implementados:**

### 1. Container DI Simples
`src/infrastructure/di/Container.ts`
- Implementa padrão Service Locator
- Suporte a Singletons
- Suporte a Factory functions
- Método `createScope()` para testes

### 2. Service Keys
`src/infrastructure/di/ServiceKeys.ts`
- Constantes tipadas para todos os serviços
- Evita typos com strings hardcoded
- Facilita refatoração

### 3. Bootstrap
`src/infrastructure/di/bootstrap.ts`
- Configuração centralizada de dependências
- Único lugar onde implementações concretas são referenciadas
- Auto-executa ao importar

### 4. Public API
`src/infrastructure/di/index.ts`
- Exporta container e helpers
- `useService<T>(key)` para uso em componentes React

**Como Usar:**
```typescript
import { container, SERVICE_KEYS } from '@/infrastructure/di';

// Em componentes React
const createPatient = container.resolve(SERVICE_KEYS.CREATE_PATIENT_USE_CASE);
const result = await createPatient.execute({ ... });

// Em testes
const scope = container.createScope();
scope.register(SERVICE_KEYS.PATIENT_REPOSITORY, mockRepository);
```

**Métricas:**
- 1 container implementado
- 12 serviços registrados
- Suporte a factory functions e singletons
- API simples e tipada

---

## Resumo da FASE 1

### ✅ Objetivos Alcançados
1. ✅ Estrutura de pastas Clean Architecture
2. ✅ Camada de Domínio (Entities, Value Objects, Interfaces)
3. ✅ Camada de Infraestrutura (Repositories, Mappers, Errors)
4. ✅ Camada de Aplicação (Use Cases)
5. ✅ Dependency Injection Container

### 📊 Métricas Finais
- **Entidades de Domínio:** 3 (Patient, Module, User)
- **Value Objects:** 4 (Email, CPF, Phone, ModuleKey)
- **Interfaces de Repositório:** 3
- **Implementações de Repositório:** 3 (Supabase)
- **Use Cases:** 9
- **Mappers:** 3
- **Erros Customizados:** 5
- **Serviços no DI Container:** 12

### 🎯 Benefícios Conquistados
1. **Testabilidade:** Use cases isolados, fácil criar mocks
2. **Manutenibilidade:** Lógica de negócio centralizada nos use cases
3. **Flexibilidade:** Trocar Supabase por outro DB requer apenas novos repositories
4. **Type Safety:** TypeScript em todas as camadas
5. **SOLID:** Cada classe tem responsabilidade única

### 📝 Lições Aprendidas
1. **Schema Real vs Planejado:** Adaptar mappers ao schema existente foi mais pragmático que criar novas tabelas
2. **Type Assertions:** Uso estratégico de `any` para campos não regenerados nos types do Supabase
3. **Simplicidade no DI:** Container simples é suficiente, não precisamos de libs complexas
4. **Domain-First:** Começar pelo domínio facilita o resto da implementação

---

## Próxima Fase

### FASE 2: Módulo de Gestão de Módulos (Backend)

**Objetivos:**
1. Criar tabela `module_dependencies` para grafo de dependências
2. Implementar Edge Function `getMyModules` com cálculo de `can_activate` e `can_deactivate`
3. Implementar Edge Function `toggleModuleState` com verificação praxeológica
4. Implementar Edge Function `requestNewModule` (solicitar cotação)

**Tarefas:**
- T2.1: Criar schema de `module_dependencies` e popular seed data
- T2.2: Implementar Edge Function `getMyModules`
- T2.3: Implementar Edge Function `toggleModuleState`
- T2.4: Implementar Edge Function `requestNewModule`
- T2.5: Testes de integração das Edge Functions

**Estimativa:** ~4-6 iterações

---

**Última Atualização:** 2025-11-14
**Status:** FASE 1 CONCLUÍDA - Pronto para FASE 2
