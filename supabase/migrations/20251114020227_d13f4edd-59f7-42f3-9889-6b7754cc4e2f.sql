-- =====================================================
-- FASE 5 - T5.2: Módulo AGENDA (Agenda Inteligente)
-- Criação de tabelas para agendamento com automação WhatsApp
-- =====================================================

-- Table: dentist_schedules (Horários dos dentistas)
CREATE TABLE IF NOT EXISTS public.dentist_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Table: room_availability (Disponibilidade de salas)
CREATE TABLE IF NOT EXISTS public.room_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  equipment JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: appointment_confirmations (Confirmações de agendamento)
CREATE TABLE IF NOT EXISTS public.appointment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  confirmation_method TEXT NOT NULL, -- 'WHATSAPP', 'SMS', 'EMAIL', 'PHONE'
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'CONFIRMED', 'FAILED'
  message_content TEXT,
  phone_number TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: appointment_reminders (Lembretes de consulta)
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'WHATSAPP', 'SMS', 'EMAIL'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'SENT', 'FAILED'
  message_template TEXT NOT NULL,
  phone_number TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.dentist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

-- dentist_schedules policies
CREATE POLICY "Users can view dentist_schedules from their clinic"
  ON public.dentist_schedules FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create dentist_schedules in their clinic"
  ON public.dentist_schedules FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update dentist_schedules from their clinic"
  ON public.dentist_schedules FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete dentist_schedules from their clinic"
  ON public.dentist_schedules FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- room_availability policies
CREATE POLICY "Users can view room_availability from their clinic"
  ON public.room_availability FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create room_availability in their clinic"
  ON public.room_availability FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update room_availability from their clinic"
  ON public.room_availability FOR UPDATE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete room_availability from their clinic"
  ON public.room_availability FOR DELETE
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- appointment_confirmations policies
CREATE POLICY "Users can view confirmations from their clinic"
  ON public.appointment_confirmations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_confirmations.appointment_id
        AND appointments.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create confirmations in their clinic"
  ON public.appointment_confirmations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_confirmations.appointment_id
        AND appointments.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "System can update confirmations"
  ON public.appointment_confirmations FOR UPDATE
  USING (true);

-- appointment_reminders policies
CREATE POLICY "Users can view reminders from their clinic"
  ON public.appointment_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_reminders.appointment_id
        AND appointments.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can create reminders in their clinic"
  ON public.appointment_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_reminders.appointment_id
        AND appointments.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "System can update reminders"
  ON public.appointment_reminders FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete reminders from their clinic"
  ON public.appointment_reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_reminders.appointment_id
        AND appointments.clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_dentist_schedules_updated_at
  BEFORE UPDATE ON public.dentist_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_availability_updated_at
  BEFORE UPDATE ON public.room_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DATA (Exemplo para demo)
-- =====================================================

-- Inserir horários padrão para dentistas (segunda a sexta, 8h-18h)
-- Nota: Substitua os IDs por valores reais da sua clínica de demonstração
-- Este é apenas um exemplo de como os dados podem ser estruturados

COMMENT ON TABLE public.dentist_schedules IS 'Horários de trabalho dos dentistas por dia da semana';
COMMENT ON TABLE public.room_availability IS 'Salas disponíveis para atendimento na clínica';
COMMENT ON TABLE public.appointment_confirmations IS 'Confirmações de agendamento enviadas via WhatsApp/SMS/Email';
COMMENT ON TABLE public.appointment_reminders IS 'Lembretes automáticos de consultas agendadas';