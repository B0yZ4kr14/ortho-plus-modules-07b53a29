-- Adicionar colunas para suporte a novos tipos de backup e destinos

-- Adicionar tipo de backup (full, incremental, differential)
ALTER TABLE backup_history 
ADD COLUMN IF NOT EXISTS backup_type TEXT DEFAULT 'full' CHECK (backup_type IN ('full', 'incremental', 'differential'));

-- Adicionar coluna para indicar se inclui dump PostgreSQL
ALTER TABLE backup_history 
ADD COLUMN IF NOT EXISTS includes_postgres_dump BOOLEAN DEFAULT false;

-- Adicionar configurações de destino (FTP, Storj, local)
ALTER TABLE scheduled_backups
ADD COLUMN IF NOT EXISTS backup_type TEXT DEFAULT 'full' CHECK (backup_type IN ('full', 'incremental', 'differential'));

ALTER TABLE scheduled_backups
ADD COLUMN IF NOT EXISTS storage_destination TEXT DEFAULT 'local' CHECK (storage_destination IN ('local', 's3', 'google_drive', 'dropbox', 'ftp', 'storj'));

ALTER TABLE scheduled_backups
ADD COLUMN IF NOT EXISTS storage_config JSONB DEFAULT '{}';

ALTER TABLE scheduled_backups
ADD COLUMN IF NOT EXISTS local_path TEXT;

ALTER TABLE scheduled_backups
ADD COLUMN IF NOT EXISTS includes_postgres_dump BOOLEAN DEFAULT true;

-- Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_backup_history_backup_type ON backup_history(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_history_clinic_created ON backup_history(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_backups_destination ON scheduled_backups(storage_destination);

COMMENT ON COLUMN backup_history.backup_type IS 'Tipo de backup: full (completo), incremental (apenas mudanças desde último backup) ou differential (mudanças desde último backup full)';
COMMENT ON COLUMN backup_history.includes_postgres_dump IS 'Indica se o backup inclui dump completo do banco de dados PostgreSQL';
COMMENT ON COLUMN scheduled_backups.backup_type IS 'Tipo de backup agendado: full, incremental ou differential';
COMMENT ON COLUMN scheduled_backups.storage_destination IS 'Destino do backup: local, s3, google_drive, dropbox, ftp ou storj';
COMMENT ON COLUMN scheduled_backups.storage_config IS 'Configurações JSON do destino de armazenamento (credenciais FTP, Storj access grant, etc)';
COMMENT ON COLUMN scheduled_backups.local_path IS 'Caminho local no servidor onde os backups devem ser salvos';
COMMENT ON COLUMN scheduled_backups.includes_postgres_dump IS 'Indica se deve incluir dump completo do PostgreSQL no backup agendado';