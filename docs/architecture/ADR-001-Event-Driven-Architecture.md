# ADR-001: Event-Driven Architecture

## Status
✅ **Aceito** - 2025-11-15

## Contexto
O sistema Ortho+ é um SaaS B2B multitenant para clínicas odontológicas com 17+ módulos integrados. Precisávamos de uma arquitetura que permitisse:
- Desacoplamento entre módulos
- Auditoria completa de ações
- Notificações em tempo real
- Escalabilidade futura
- Manutenibilidade

## Decisão
Adotar **Event-Driven Architecture** com Domain Events + Event Bus (pub/sub pattern).

### Componentes Implementados
1. **DomainEvent** (classe base abstrata)
2. **EventBus** (singleton com pub/sub)
3. **AggregateRoot** (emite eventos)
4. **Event Handlers** (NotificationHandler, AuditLogHandler, EmailNotificationHandler)

### Padrão de Uso
```typescript
// 1. Criar evento
const event = new TransactionCreatedEvent({
  transactionId: transaction.id,
  clinicId: clinicId,
  amount: 1000,
  type: 'RECEITA'
});

// 2. Publicar evento
await eventBus.publish(event);

// 3. Handlers são executados automaticamente
// - NotificationHandler → Toast para usuário
// - AuditLogHandler → Log no banco
// - EmailNotificationHandler → Email (futuro)
```

## Consequências

### Positivas ✅
- **Desacoplamento:** Handlers não conhecem uns aos outros
- **Testabilidade:** Fácil mockar Event Bus em testes
- **Auditoria:** Log automático de todos os eventos
- **Escalabilidade:** Handlers podem rodar em paralelo ou serem movidos para workers
- **Rastreabilidade:** Event log mantém histórico (últimos 1000 eventos)

### Negativas ⚠️
- **Complexidade inicial:** Curva de aprendizado para novos desenvolvedores
- **Debugging:** Fluxo assíncrono pode ser mais difícil de debugar
- **Overhead:** Pequeno overhead de performance por evento (negligível)

### Riscos Mitigados 🛡️
- **Event loop infinito:** Event Bus não permite eventos circulares
- **Memory leak:** Log limitado a 1000 eventos (FIFO)
- **Handler failure:** Try/catch em todos os handlers + log de erros

## Alternativas Consideradas

### 1. Callbacks Diretos
❌ **Rejeitado:** Alto acoplamento, difícil de testar

### 2. Redux/Zustand com Middleware
❌ **Rejeitado:** Muito overhead para eventos de domínio, focado em UI state

### 3. RxJS Observables
❌ **Rejeitado:** Complexidade excessiva, curva de aprendizado íngreme

## Implementação

### Event Bus Bootstrap
```typescript
// src/main.tsx
bootstrapEventBus(); // Registra todos os handlers
```

### Criação de Novo Evento
```typescript
// 1. Criar interface de dados
export interface MyEventData {
  entityId: string;
  clinicId: string;
}

// 2. Criar classe de evento
export class MyEvent extends DomainEvent {
  constructor(public readonly data: MyEventData) {
    super();
  }
  get aggregateId(): string { return this.data.entityId; }
  get eventName(): string { return 'MyEvent'; }
}

// 3. Publicar evento
await eventBus.publish(new MyEvent({ ... }));
```

### Criação de Novo Handler
```typescript
export class MyHandler implements IEventHandler<MyEvent> {
  async handle(event: MyEvent): Promise<void> {
    // Lógica do handler
  }
}

// Registrar no bootstrap
eventBus.subscribe('MyEvent', new MyHandler());
```

## Métricas de Sucesso
- ✅ 5 eventos implementados
- ✅ 3 handlers implementados
- ✅ 100% dos eventos logados no audit_logs
- ✅ Notificações em tempo real funcionando
- ⏳ 0% de eventos perdidos (target: <0.01%)

## Referências
- [Martin Fowler - Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Domain-Driven Design - Evans](https://www.domainlanguage.com/ddd/)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)

## Autores
- Equipe de Arquitetura Ortho+

## Revisão
Próxima revisão: **Q1 2026** (avaliar Event Sourcing completo)
