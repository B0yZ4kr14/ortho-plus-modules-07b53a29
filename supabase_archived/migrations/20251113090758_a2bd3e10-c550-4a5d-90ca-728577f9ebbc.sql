-- Create scheduled_backups table for automated backup configuration
CREATE TABLE IF NOT EXISTS public.scheduled_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  time_of_day TIME NOT NULL DEFAULT '02:00:00',
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  backup_type TEXT NOT NULL DEFAULT 'incremental' CHECK (backup_type IN ('full', 'incremental')),
  include_data JSONB NOT NULL DEFAULT '{"patients": true, "appointments": true, "financial": true, "clinical": true}'::jsonb,
  compression_enabled BOOLEAN NOT NULL DEFAULT true,
  encryption_enabled BOOLEAN NOT NULL DEFAULT false,
  cloud_upload_enabled BOOLEAN NOT NULL DEFAULT false,
  cloud_providers TEXT[] DEFAULT ARRAY[]::TEXT[],
  notification_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cloud_storage_configs table for cloud provider credentials
CREATE TABLE IF NOT EXISTS public.cloud_storage_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('s3', 'google_drive', 'dropbox')),
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, provider)
);

-- Add checksums to backup_history
ALTER TABLE public.backup_history 
ADD COLUMN IF NOT EXISTS checksum_md5 TEXT,
ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT,
ADD COLUMN IF NOT EXISTS is_incremental BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_backup_id UUID REFERENCES public.backup_history(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_backups_clinic ON public.scheduled_backups(clinic_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_backups_next_run ON public.scheduled_backups(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cloud_storage_configs_clinic ON public.cloud_storage_configs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_parent ON public.backup_history(parent_backup_id);

-- Enable RLS
ALTER TABLE public.scheduled_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_storage_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_backups
CREATE POLICY "Admins can manage scheduled backups in their clinic"
  ON public.scheduled_backups
  FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can view scheduled backups from their clinic"
  ON public.scheduled_backups
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies for cloud_storage_configs
CREATE POLICY "Admins can manage cloud configs in their clinic"
  ON public.cloud_storage_configs
  FOR ALL
  USING (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can view cloud configs from their clinic"
  ON public.cloud_storage_configs
  FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_scheduled_backups_updated_at
  BEFORE UPDATE ON public.scheduled_backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cloud_storage_configs_updated_at
  BEFORE UPDATE ON public.cloud_storage_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();