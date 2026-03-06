-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link_acao TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  lida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view notifications from their clinic"
  ON public.notifications
  FOR SELECT
  USING (
    clinic_id = get_user_clinic_id(auth.uid())
    AND (user_id IS NULL OR user_id = auth.uid())
  );

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    clinic_id = get_user_clinic_id(auth.uid())
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Create index for performance
CREATE INDEX idx_notifications_clinic_user ON public.notifications(clinic_id, user_id, lida);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Insert sample notifications for testing
INSERT INTO public.notifications (clinic_id, user_id, tipo, titulo, mensagem, link_acao)
SELECT 
  c.id,
  NULL,
  'SYSTEM',
  'Bem-vindo ao Ortho+',
  'Sistema de gestão odontológica completo está pronto para uso!',
  '/dashboard'
FROM public.clinics c
LIMIT 1;