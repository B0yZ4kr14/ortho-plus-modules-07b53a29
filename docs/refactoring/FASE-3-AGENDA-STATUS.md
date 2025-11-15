# 📋 FASE 3: AGENDA (Agendamento Inteligente) - STATUS

## 📊 Status Geral: 🔄 0% INICIANDO

**Iniciado em:** 2025-11-15  
**Previsão:** 5-6 horas  
**Prioridade:** 🔴 ALTA (Essencial para operação)  
**Objetivo:** Implementar módulo de agendamento com Clean Architecture

---

## 📋 ESCOPO DO MÓDULO

### Funcionalidades Core
1. **Agendamento de Consultas**
   - Criar, editar, cancelar agendamentos
   - Visualização em calendário (dia, semana, mês)
   - Conflito de horários
   - Recorrência de agendamentos

2. **Gestão de Disponibilidade**
   - Horários de trabalho dos dentistas
   - Bloqueio de horários
   - Férias e ausências

3. **Automação WhatsApp**
   - Confirmação automática 24h antes
   - Lembretes 2h antes
   - Reagendamento via WhatsApp

4. **Integração com PEP**
   - Link direto paciente → prontuário
   - Histórico de consultas
   - Procedimentos realizados

---

## ⏳ T3.A.1: Domain Layer (0% - PENDENTE)

### Entidades
- ⏳ `Appointment.ts` (Aggregate Root)
  - Props: id, patient, dentist, datetime, duration, status, type, notes
  - Validações: horário futuro, duração mínima, conflitos
  - Methods: confirm, cancel, reschedule, markAsCompleted, markAsNoShow

- ⏳ `DentistSchedule.ts`
  - Props: dentist, dayOfWeek, startTime, endTime, breakStart, breakEnd
  - Validações: horários válidos, não sobreposição
  - Methods: isAvailable, getAvailableSlots

- ⏳ `BlockedTime.ts`
  - Props: dentist, startDatetime, endDatetime, reason
  - Methods: isActive, overlaps

### Value Objects
- ⏳ `TimeSlot.ts` (startTime, endTime, duration)
- ⏳ `AppointmentStatus.ts` (AGENDADO, CONFIRMADO, REALIZADO, CANCELADO, FALTOU)

### Interfaces de Repositório
- ⏳ `IAppointmentRepository.ts`
  - save, findById, findByPatient, findByDentist, findByDateRange, update, delete
  - findConflicts, getAvailableSlots

- ⏳ `IDentistScheduleRepository.ts`
  - save, findByDentist, findByDayOfWeek, update, delete

- ⏳ `IBlockedTimeRepository.ts`
  - save, findByDentist, findByDateRange, delete

---

## ⏳ T3.A.2: Infrastructure Layer (0% - PENDENTE)

### Repositories
- ⏳ `AppointmentRepositorySupabase.ts`
  - Implementa IAppointmentRepository
  - CRUD completo
  - Queries especializadas (conflitos, disponibilidade)

- ⏳ `DentistScheduleRepositorySupabase.ts`
  - Implementa IDentistScheduleRepository
  - CRUD de horários de trabalho

- ⏳ `BlockedTimeRepositorySupabase.ts`
  - Implementa IBlockedTimeRepository
  - Gestão de bloqueios

### Mappers
- ⏳ `AppointmentMapper.ts`
  - toDomain: Row → Appointment
  - toPersistence: Appointment → Insert

- ⏳ `DentistScheduleMapper.ts`
  - toDomain: Row → DentistSchedule
  - toPersistence: DentistSchedule → Insert

- ⏳ `BlockedTimeMapper.ts`
  - toDomain: Row → BlockedTime
  - toPersistence: BlockedTime → Insert

---

## ⏳ T3.A.3: Application Layer (0% - PENDENTE)

### Use Cases
- ⏳ `CreateAppointmentUseCase.ts`
  - Validações de input
  - Verificação de conflitos
  - Criação de entidade Appointment
  - Persistência via repository
  - Trigger de notificação

- ⏳ `RescheduleAppointmentUseCase.ts`
  - Busca agendamento existente
  - Validação de novo horário
  - Atualização
  - Notificação de mudança

- ⏳ `CancelAppointmentUseCase.ts`
  - Busca agendamento
  - Validação de status
  - Cancelamento
  - Notificação

- ⏳ `GetAvailableSlotsUseCase.ts`
  - Busca horários do dentista
  - Filtra bloqueios e agendamentos existentes
  - Retorna slots disponíveis

- ⏳ `ConfirmAppointmentUseCase.ts`
  - Confirmação de presença
  - Atualização de status
  - Registro de confirmação

- ⏳ `MarkAsCompletedUseCase.ts`
  - Marcar como realizado
  - Link com procedimento no PEP
  - Trigger para próximo agendamento

---

## ⏳ T3.A.4: Presentation Layer (0% - PENDENTE)

### Hooks
- ⏳ `useAppointments.ts`
  - Query para buscar agendamentos
  - Mutations para CRUD
  - Filtros (por data, dentista, paciente)
  - Toast notifications

- ⏳ `useAvailableSlots.ts`
  - Query para buscar horários disponíveis
  - Filtros dinâmicos
  - Loading states

- ⏳ `useDentistSchedule.ts`
  - Query para horários de trabalho
  - Mutation para configurar horários
  - Toast notifications

---

## ⏳ T3.A.5: UI Layer (0% - PENDENTE)

### Componentes
- ⏳ `Calendar.tsx` - Calendário principal (dia/semana/mês)
- ⏳ `AppointmentCard.tsx` - Card de agendamento
- ⏳ `AppointmentForm.tsx` - Formulário de novo agendamento
- ⏳ `TimeSlotPicker.tsx` - Seletor de horários disponíveis
- ⏳ `DentistScheduleConfig.tsx` - Configuração de horários do dentista
- ⏳ `AppointmentDetails.tsx` - Detalhes e ações do agendamento

### Página
- ⏳ `pages/Agenda.tsx`
  - Visualizações (dia, semana, mês)
  - Filtros (dentista, status)
  - Ações rápidas
  - Integração com todos componentes

---

## ⏳ T3.A.6: DI Container (0% - PENDENTE)

- ⏳ Registrar AppointmentRepository
- ⏳ Registrar DentistScheduleRepository
- ⏳ Registrar BlockedTimeRepository
- ⏳ Registrar todos Use Cases (7)

---

## ⏳ T3.A.7: Database Schema (0% - PENDENTE)

### Tabelas Necessárias
```sql
-- appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL,
  dentist_id UUID NOT NULL,
  scheduled_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'AGENDADO',
  appointment_type TEXT NOT NULL,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  no_show BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- dentist_schedules
CREATE TABLE dentist_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  dentist_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 (Domingo a Sábado)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dentist_id, day_of_week)
);

-- blocked_times
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  dentist_id UUID NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- appointment_confirmations (já existe, reutilizar)
-- appointment_reminders (já existe, reutilizar)
```

---

## 📈 Progresso Detalhado

### Arquivos Criados: 0/26 (0%)
```
⏳ Domain Layer (5 arquivos)
⏳ Infrastructure Layer (6 arquivos)
⏳ Application Layer (7 arquivos)
⏳ Presentation Layer (3 arquivos)
⏳ UI Layer (7 arquivos)
⏳ DI Container (registros)
⏳ Database Migration
```

---

## 🎯 Próximas Ações

1. ⏳ Criar Database Schema (tabelas + RLS policies)
2. ⏳ Implementar Domain Layer (entidades)
3. ⏳ Implementar Infrastructure Layer (repositories)
4. ⏳ Implementar Application Layer (use cases)
5. ⏳ Implementar Presentation Layer (hooks)
6. ⏳ Implementar UI Layer (componentes)
7. ⏳ Registrar no DI Container
8. ⏳ Adicionar rota em App.tsx (já existe /agenda-clinica)
9. ⏳ Testar integração completa

---

## 📝 Observações Técnicas

### Domínio Agenda
- **Appointment Status Flow:** AGENDADO → CONFIRMADO → REALIZADO/CANCELADO/FALTOU
- **Conflitos:** Mesmo dentista não pode ter 2 agendamentos simultâneos
- **Durações:** Múltiplos de 15 minutos (15, 30, 45, 60, 90, 120)
- **Horários:** Respeitar horário de trabalho do dentista e bloqueios

### Regras de Negócio
- ✅ Não pode agendar no passado
- ✅ Não pode agendar fora do horário de trabalho
- ✅ Não pode agendar em horário bloqueado
- ✅ Não pode ter conflito de horários
- ✅ Confirmação deve ser feita até 2h antes
- ✅ Cancelamento deve ter motivo se < 24h antes

### Integrações
- **WhatsApp:** Confirmação e lembretes (tabelas já existem)
- **PEP:** Link para prontuário do paciente
- **Notificações:** Toast para ações do usuário

---

**Última Atualização:** 2025-11-15 00:00  
**Próximo Milestone:** Iniciar Domain Layer  
**Status:** Planejamento completo, pronto para iniciar implementação
