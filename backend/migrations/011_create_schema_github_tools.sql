-- Migration: 011 - Create Schema github_tools
-- Módulo: GITHUB TOOLS (Administração)
-- Descrição: Schema para integração e gestão de repositórios GitHub

-- ============================================================================
-- 1. CREATE SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS github_tools;

-- ============================================================================
-- 2. ENUMS
-- ============================================================================
CREATE TYPE github_tools.repo_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNAL');
CREATE TYPE github_tools.webhook_event_type AS ENUM (
  'PUSH',
  'PULL_REQUEST',
  'ISSUES',
  'RELEASE',
  'DEPLOYMENT',
  'WORKFLOW_RUN'
);

-- ============================================================================
-- 3. GITHUB CONNECTIONS (Credenciais OAuth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- OAuth info
  github_username TEXT NOT NULL,
  github_user_id BIGINT NOT NULL, -- GitHub user ID numérico
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  refresh_token_encrypted TEXT,
  
  -- Permissions granted
  scopes TEXT[] NOT NULL, -- ['repo', 'workflow', 'admin:org']
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  
  -- Context
  connected_by UUID NOT NULL REFERENCES auth.users(id),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_clinic_github_user UNIQUE (clinic_id, github_user_id)
);

CREATE INDEX idx_github_connections_clinic ON github_tools.github_connections(clinic_id);

-- ============================================================================
-- 4. REPOSITORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES github_tools.github_connections(id) ON DELETE CASCADE,
  
  -- Repository info
  github_repo_id BIGINT NOT NULL UNIQUE,
  full_name TEXT NOT NULL, -- "owner/repo"
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  
  -- Metadata
  description TEXT,
  visibility github_tools.repo_visibility NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  
  -- URLs
  html_url TEXT NOT NULL,
  clone_url TEXT NOT NULL,
  
  -- Stats
  stars_count INTEGER NOT NULL DEFAULT 0,
  forks_count INTEGER NOT NULL DEFAULT 0,
  open_issues_count INTEGER NOT NULL DEFAULT 0,
  
  -- Configuration
  is_tracked BOOLEAN NOT NULL DEFAULT true, -- Se está sendo monitorado
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Last sync
  last_synced_at TIMESTAMPTZ,
  last_commit_sha TEXT,
  last_commit_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repositories_clinic ON github_tools.repositories(clinic_id);
CREATE INDEX idx_repositories_connection ON github_tools.repositories(connection_id);
CREATE INDEX idx_repositories_tracked ON github_tools.repositories(is_tracked);

-- ============================================================================
-- 5. BRANCHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- Branch info
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  
  -- Latest commit
  latest_commit_sha TEXT NOT NULL,
  latest_commit_message TEXT,
  latest_commit_author TEXT,
  latest_commit_at TIMESTAMPTZ,
  
  -- Tracking
  is_tracked BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_repo_branch UNIQUE (repository_id, name)
);

CREATE INDEX idx_branches_repo ON github_tools.branches(repository_id);

-- ============================================================================
-- 6. COMMITS
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES github_tools.branches(id) ON DELETE SET NULL,
  
  -- Commit info
  sha TEXT NOT NULL,
  message TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_github_username TEXT,
  
  -- Timestamps
  committed_at TIMESTAMPTZ NOT NULL,
  
  -- Stats
  additions INTEGER NOT NULL DEFAULT 0,
  deletions INTEGER NOT NULL DEFAULT 0,
  changed_files INTEGER NOT NULL DEFAULT 0,
  
  -- URLs
  html_url TEXT NOT NULL,
  
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_repo_commit UNIQUE (repository_id, sha)
);

CREATE INDEX idx_commits_repo ON github_tools.commits(repository_id, committed_at DESC);
CREATE INDEX idx_commits_sha ON github_tools.commits(sha);

-- ============================================================================
-- 7. PULL REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- PR info
  github_pr_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  state TEXT NOT NULL, -- 'OPEN', 'CLOSED', 'MERGED'
  
  -- Branches
  head_branch TEXT NOT NULL,
  base_branch TEXT NOT NULL,
  
  -- Author
  author_github_username TEXT NOT NULL,
  
  -- Review
  is_draft BOOLEAN NOT NULL DEFAULT false,
  mergeable BOOLEAN,
  
  -- Counts
  commits_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  changed_files_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  merged_at TIMESTAMPTZ,
  
  -- URLs
  html_url TEXT NOT NULL,
  
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_repo_pr UNIQUE (repository_id, github_pr_number),
  CONSTRAINT valid_pr_state CHECK (state IN ('OPEN', 'CLOSED', 'MERGED'))
);

CREATE INDEX idx_pull_requests_repo ON github_tools.pull_requests(repository_id);
CREATE INDEX idx_pull_requests_state ON github_tools.pull_requests(state);

-- ============================================================================
-- 8. WORKFLOWS (GitHub Actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- Workflow info
  github_workflow_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL, -- ex: '.github/workflows/ci.yml'
  state TEXT NOT NULL, -- 'ACTIVE', 'DISABLED'
  
  -- Stats
  total_runs INTEGER NOT NULL DEFAULT 0,
  successful_runs INTEGER NOT NULL DEFAULT 0,
  failed_runs INTEGER NOT NULL DEFAULT 0,
  
  -- Last run
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT, -- 'SUCCESS', 'FAILURE', 'CANCELLED'
  last_run_duration_seconds INTEGER,
  
  -- URLs
  html_url TEXT NOT NULL,
  
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_repo_workflow UNIQUE (repository_id, github_workflow_id)
);

CREATE INDEX idx_workflows_repo ON github_tools.workflows(repository_id);

-- ============================================================================
-- 9. DEPLOYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- Deployment info
  github_deployment_id BIGINT NOT NULL UNIQUE,
  environment TEXT NOT NULL, -- 'production', 'staging', 'development'
  
  -- Ref deployed
  ref TEXT NOT NULL, -- branch, tag, ou commit SHA
  sha TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILURE', 'ERROR'
  
  -- Metadata
  description TEXT,
  payload JSONB,
  
  -- Author
  deployed_by_github_username TEXT,
  
  -- Timestamps
  deployed_at TIMESTAMPTZ NOT NULL,
  
  -- URLs
  html_url TEXT,
  
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_deployment_status CHECK (
    status IN ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILURE', 'ERROR')
  )
);

CREATE INDEX idx_deployments_repo ON github_tools.deployments(repository_id, deployed_at DESC);
CREATE INDEX idx_deployments_environment ON github_tools.deployments(environment);

-- ============================================================================
-- 10. WEBHOOKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- Webhook info
  github_webhook_id BIGINT UNIQUE,
  webhook_url TEXT NOT NULL,
  secret_encrypted TEXT NOT NULL,
  
  -- Events
  subscribed_events github_tools.webhook_event_type[] NOT NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT, -- 'SUCCESS', 'FAILED'
  
  -- Stats
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  successful_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_clinic ON github_tools.webhooks(clinic_id);
CREATE INDEX idx_webhooks_repo ON github_tools.webhooks(repository_id);

-- ============================================================================
-- 11. WEBHOOK EVENTS LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_tools.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES github_tools.webhooks(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES github_tools.repositories(id) ON DELETE CASCADE,
  
  -- Event info
  event_type github_tools.webhook_event_type NOT NULL,
  event_action TEXT, -- ex: 'opened', 'synchronize', 'closed'
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- Headers
  github_delivery_id TEXT NOT NULL UNIQUE,
  github_event TEXT NOT NULL,
  
  -- Processing
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_webhook ON github_tools.webhook_events(webhook_id, received_at DESC);
CREATE INDEX idx_webhook_events_processed ON github_tools.webhook_events(processed);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE github_tools.github_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY github_connections_clinic_isolation ON github_tools.github_connections
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE github_tools.repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY repositories_clinic_isolation ON github_tools.repositories
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE github_tools.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_clinic_isolation ON github_tools.branches
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM github_tools.repositories
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

ALTER TABLE github_tools.commits ENABLE ROW LEVEL SECURITY;
CREATE POLICY commits_clinic_isolation ON github_tools.commits
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM github_tools.repositories
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

ALTER TABLE github_tools.pull_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY pull_requests_clinic_isolation ON github_tools.pull_requests
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM github_tools.repositories
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

ALTER TABLE github_tools.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflows_clinic_isolation ON github_tools.workflows
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM github_tools.repositories
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

ALTER TABLE github_tools.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployments_clinic_isolation ON github_tools.deployments
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM github_tools.repositories
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

ALTER TABLE github_tools.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhooks_clinic_isolation ON github_tools.webhooks
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE github_tools.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_clinic_isolation ON github_tools.webhook_events
  FOR ALL USING (
    webhook_id IN (
      SELECT id FROM github_tools.webhooks
      WHERE clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ============================================================================
-- 13. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION github_tools.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_github_connections_updated
  BEFORE UPDATE ON github_tools.github_connections
  FOR EACH ROW EXECUTE FUNCTION github_tools.update_updated_at();

CREATE TRIGGER trg_repositories_updated
  BEFORE UPDATE ON github_tools.repositories
  FOR EACH ROW EXECUTE FUNCTION github_tools.update_updated_at();

CREATE TRIGGER trg_branches_updated
  BEFORE UPDATE ON github_tools.branches
  FOR EACH ROW EXECUTE FUNCTION github_tools.update_updated_at();

CREATE TRIGGER trg_webhooks_updated
  BEFORE UPDATE ON github_tools.webhooks
  FOR EACH ROW EXECUTE FUNCTION github_tools.update_updated_at();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON SCHEMA github_tools IS 'Módulo GitHub Tools - Integração completa com GitHub para DevOps e CI/CD';
COMMENT ON TABLE github_tools.github_connections IS 'Conexões OAuth com contas GitHub';
COMMENT ON TABLE github_tools.repositories IS 'Repositórios sincronizados';
COMMENT ON TABLE github_tools.commits IS 'Histórico de commits rastreados';
COMMENT ON TABLE github_tools.workflows IS 'GitHub Actions workflows monitorizados';
COMMENT ON TABLE github_tools.deployments IS 'Histórico de deployments rastreados';
COMMENT ON TABLE github_tools.webhooks IS 'Webhooks configurados para receber eventos GitHub';
