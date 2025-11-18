-- Add marketing tracking fields to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_campaign VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_source VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_event VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_promoter VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_telemarketing_agent VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS referral_source VARCHAR(200);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_marketing_campaign ON patients(marketing_campaign);
CREATE INDEX IF NOT EXISTS idx_patients_marketing_source ON patients(marketing_source);

-- Create patient status history table
CREATE TABLE IF NOT EXISTS patient_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS idx_patient_status_history_patient ON patient_status_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_status_history_date ON patient_status_history(changed_at DESC);

-- Enable RLS for status history
ALTER TABLE patient_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history of patients in their clinic"
  ON patient_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
      WHERE p.id = patient_status_history.patient_id AND pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert status history for patients in their clinic"
  ON patient_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
      WHERE p.id = patient_status_history.patient_id AND pr.id = auth.uid()
    )
  );

-- Update existing status values
UPDATE patients SET status = 'PROSPECT' WHERE status IN ('ativo', 'active', 'novo') OR status IS NULL;
UPDATE patients SET status = 'INATIVO' WHERE status IN ('inativo', 'inactive');
UPDATE patients SET status = 'TRATAMENTO' WHERE status IN ('tratamento', 'treatment', 'em_tratamento');
UPDATE patients SET status = 'CONCLUIDO' WHERE status IN ('concluido', 'completed', 'finalizado');

-- Set default status
ALTER TABLE patients ALTER COLUMN status SET DEFAULT 'PROSPECT';