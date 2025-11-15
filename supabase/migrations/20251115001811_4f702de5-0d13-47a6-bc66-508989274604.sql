-- Tabela de horários de trabalho dos dentistas
CREATE TABLE IF NOT EXISTS public.dentist_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL,
  CONSTRAINT unique_dentist_day UNIQUE(dentist_id, day_of_week),
  CONSTRAINT valid_work_hours CHECK (start_time < end_time),
  CONSTRAINT valid_break_hours CHECK (
    (break_start IS NULL AND break_end IS NULL) OR
    (break_start IS NOT NULL AND break_end IS NOT NULL AND break_start < break_end)
  )
);

-- Tabela de bloqueios de horário (férias, folgas, etc)
CREATE TABLE IF NOT EXISTS public.blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_blocked_period CHECK (start_datetime < end_datetime)
);

-- Enable RLS
ALTER TABLE public.dentist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies para dentist_schedules
CREATE POLICY "Users can view schedules from their clinic"
  ON public.dentist_schedules FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create schedules in their clinic"
  ON public.dentist_schedules FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedules in their clinic"
  ON public.dentist_schedules FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules in their clinic"
  ON public.dentist_schedules FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies para blocked_times
CREATE POLICY "Users can view blocked times from their clinic"
  ON public.blocked_times FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create blocked times in their clinic"
  ON public.blocked_times FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocked times in their clinic"
  ON public.blocked_times FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dentist_schedules_dentist ON public.dentist_schedules(dentist_id);
CREATE INDEX IF NOT EXISTS idx_dentist_schedules_clinic ON public.dentist_schedules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dentist_schedules_day ON public.dentist_schedules(day_of_week);

CREATE INDEX IF NOT EXISTS idx_blocked_times_dentist ON public.blocked_times(dentist_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_clinic ON public.blocked_times(clinic_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_dates ON public.blocked_times(start_datetime, end_datetime);
