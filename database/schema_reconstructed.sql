-- Auto-generated DDL from Types.ts


CREATE SCHEMA IF NOT EXISTS tenant_data;


CREATE SCHEMA IF NOT EXISTS auth;


CREATE TABLE IF NOT EXISTS tenant_data.__InternalSupabase (
  abuse_type TEXT NOT NULL,
  auto_blocked BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  details JSONB NULL,
  endpoint TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  resolved BOOLEAN NULL,
  resolved_at TEXT NULL,
  resolved_by TEXT NULL,
  severity TEXT NOT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.admin_configurations (
  clinic_id UUID NOT NULL,
  config_data JSONB NOT NULL,
  config_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.analises_radiograficas (
  ai_model_version TEXT NULL,
  ai_processing_time_ms NUMERIC NULL,
  auto_approved BOOLEAN NULL,
  clinic_id UUID NOT NULL,
  confidence_score NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  feedback_comments TEXT NULL,
  feedback_rating NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_storage_path TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  observacoes_dentista TEXT NULL,
  patient_id UUID NOT NULL,
  problemas_detectados NUMERIC NULL,
  prontuario_id UUID NULL,
  resultado_ia JSONB NULL,
  revisado_em TEXT NULL,
  revisado_por TEXT NULL,
  revisado_por_dentista BOOLEAN NULL,
  status_analise TEXT NOT NULL,
  tipo_radiografia TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.analises_radiograficas_history (
  ai_model_version TEXT NULL,
  analise_id UUID NOT NULL,
  confidence_score NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problemas_detectados NUMERIC NULL,
  resultado_ia JSONB NOT NULL,
  versao NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.appointment_confirmations (
  appointment_id UUID NOT NULL,
  confirmation_method TEXT NOT NULL,
  confirmed_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  error_message TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_content TEXT NULL,
  phone_number TEXT NULL,
  sent_at TEXT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.appointment_reminders (
  appointment_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  error_message TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_template TEXT NOT NULL,
  phone_number TEXT NULL,
  reminder_type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.appointments (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  dentist_id UUID NOT NULL,
  description TEXT NULL,
  end_time TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  start_time TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  treatment_id UUID NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.architecture_decision_records (
  adr_number NUMERIC NOT NULL,
  alternatives_considered TEXT NULL,
  clinic_id UUID NOT NULL,
  consequences TEXT NOT NULL,
  context TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  decided_at TEXT NULL,
  decided_by TEXT NULL,
  decision TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  superseded_by_adr_id UUID NULL,
  supersedes_adr_id UUID NULL,
  tags TEXT[] NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.audit_logs (
  action TEXT NOT NULL,
  action_type TEXT NULL,
  affected_records JSONB NULL,
  clinic_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  details JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  target_module_id UUID NULL,
  user_agent TEXT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.audit_trail (
  action TEXT NOT NULL,
  clinic_id UUID NULL,
  entity_id UUID NULL,
  entity_type TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  new_values JSONB NULL,
  old_values JSONB NULL,
  sensitivity_level TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  user_agent TEXT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.backup_history (
  backup_type TEXT NOT NULL,
  checksum_md5 TEXT NULL,
  checksum_sha256 TEXT NULL,
  clinic_id UUID NOT NULL,
  completed_at TEXT NULL,
  compression_ratio NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  error_message TEXT NULL,
  file_path TEXT NULL,
  file_size_bytes NUMERIC NULL,
  format TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  includes_postgres_dump BOOLEAN NULL,
  metadata JSONB NULL,
  parent_backup_id UUID NULL,
  restore_tested_at TEXT NULL,
  retention_policy_id UUID NULL,
  status TEXT NOT NULL,
  transfer_speed_mbps NUMERIC NULL,
  verified_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.backup_replications (
  backup_id UUID NOT NULL,
  checksum_md5 TEXT NULL,
  completed_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  error_message TEXT NULL,
  file_size_bytes NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  region TEXT NOT NULL,
  replication_status TEXT NOT NULL,
  source_clinic_id UUID NOT NULL,
  started_at TEXT NULL,
  storage_path TEXT NULL,
  storage_provider TEXT NOT NULL,
  target_clinic_id UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.backup_retention_policies (
  auto_delete_enabled BOOLEAN NULL,
  backup_type TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keep_daily NUMERIC NOT NULL,
  keep_monthly NUMERIC NOT NULL,
  keep_weekly NUMERIC NOT NULL,
  keep_yearly NUMERIC NOT NULL,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.backup_verification_log (
  backup_id UUID NOT NULL,
  details JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  verified_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.bi_dashboards (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default BOOLEAN NOT NULL,
  is_public BOOLEAN NOT NULL,
  layout JSONB NULL,
  name TEXT NOT NULL,
  refresh_interval_minutes NUMERIC NULL,
  shared_with TEXT[] NULL,
  tags TEXT[] NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.bi_data_cache (
  cache_key TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data JSONB NOT NULL,
  expires_at TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.bi_metrics (
  aggregation_period TEXT NOT NULL,
  calculation_type TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_sources TEXT[] NULL,
  description TEXT NULL,
  formula TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_calculated_at TEXT NULL,
  metadata JSONB NULL,
  metric_key TEXT NOT NULL,
  name TEXT NOT NULL,
  trend NUMERIC NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  value NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.bi_reports (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NULL,
  format TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  last_generated_at TEXT NULL,
  name TEXT NOT NULL,
  next_generation_at TEXT NULL,
  parameters JSONB NULL,
  recipients TEXT[] NULL,
  report_type TEXT NOT NULL,
  schedule JSONB NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.bi_widgets (
  cache_duration_minutes NUMERIC NULL,
  chart_type TEXT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dashboard_id UUID NOT NULL,
  data_source TEXT NOT NULL,
  display_config JSONB NULL,
  height NUMERIC NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  query_config JSONB NOT NULL,
  refresh_on_load BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  widget_type TEXT NOT NULL,
  width NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.blocked_times (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NOT NULL,
  dentist_id UUID NOT NULL,
  end_datetime TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  start_datetime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.budget_approvals (
  acao TEXT NOT NULL,
  alteracoes_realizadas JSONB NULL,
  budget_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo TEXT NULL,
  usuario_id UUID NOT NULL,
  valor_orcamento NUMERIC NOT NULL,
  versao NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.budget_items (
  budget_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dente_regiao TEXT NULL,
  desconto_percentual NUMERIC NULL,
  desconto_valor NUMERIC NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  ordem NUMERIC NOT NULL,
  procedimento_id UUID NULL,
  quantidade NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.budget_versions (
  budget_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_data JSONB NOT NULL,
  versao NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.budgets (
  aprovado_em TEXT NULL,
  aprovado_por TEXT NULL,
  clinic_id UUID NOT NULL,
  contrato_id UUID NULL,
  convertido_contrato BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_expiracao TEXT NULL,
  desconto_percentual NUMERIC NULL,
  desconto_valor NUMERIC NULL,
  descricao TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo_rejeicao TEXT NULL,
  numero_orcamento TEXT NOT NULL,
  observacoes TEXT NULL,
  patient_id UUID NOT NULL,
  rejeitado_em TEXT NULL,
  rejeitado_por TEXT NULL,
  status TEXT NOT NULL,
  tipo_plano TEXT NOT NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  validade_dias NUMERIC NOT NULL,
  valor_subtotal NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.caixa_incidentes (
  boletim_ocorrencia TEXT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  data_incidente TEXT NOT NULL,
  descricao TEXT NULL,
  dia_semana NUMERIC NOT NULL,
  horario_incidente TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  tipo_incidente TEXT NOT NULL,
  valor_caixa_momento NUMERIC NULL,
  valor_perdido NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.caixa_movimentos (
  aberto_em TEXT NULL,
  caixa_id UUID NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NOT NULL,
  diferenca NUMERIC NULL,
  fechado_em TEXT NULL,
  horario_risco TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo_sangria TEXT NULL,
  observacoes TEXT NULL,
  risco_calculado NUMERIC NULL,
  status TEXT NOT NULL,
  sugerido_por_ia BOOLEAN NULL,
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  valor_esperado NUMERIC NULL,
  valor_final NUMERIC NULL,
  valor_inicial NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campaign_metrics (
  bounce_rate NUMERIC NULL,
  campaign_id UUID NOT NULL,
  click_rate NUMERIC NULL,
  conversion_rate NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date TEXT NOT NULL,
  open_rate NUMERIC NULL,
  revenue_generated NUMERIC NULL,
  total_clicked NUMERIC NULL,
  total_converted NUMERIC NULL,
  total_delivered NUMERIC NULL,
  total_errors NUMERIC NULL,
  total_opened NUMERIC NULL,
  total_sent NUMERIC NULL,
  unsubscribe_count NUMERIC NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campaign_sends (
  campaign_id UUID NOT NULL,
  clicked_at TEXT NULL,
  converted_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  delivered_at TEXT NULL,
  error_code TEXT NULL,
  error_message TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_content TEXT NULL,
  metadata JSONB NULL,
  opened_at TEXT NULL,
  patient_id UUID NOT NULL,
  recipient_contact TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  retry_count NUMERIC NULL,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campaign_templates (
  category TEXT NULL,
  clinic_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default BOOLEAN NULL,
  name TEXT NOT NULL,
  subject TEXT NULL,
  template_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  variables JSONB NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campaign_triggers (
  campaign_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  delay_days NUMERIC NULL,
  delay_hours NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  trigger_condition JSONB NOT NULL,
  trigger_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campanha_envios (
  aberto_em TEXT NULL,
  campanha_id UUID NOT NULL,
  clicado_em TEXT NULL,
  convertido_em TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  destinatario_id UUID NOT NULL,
  destinatario_tipo TEXT NOT NULL,
  email TEXT NULL,
  enviado_em TEXT NULL,
  erro_mensagem TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_envio TEXT NOT NULL,
  telefone TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campanhas_inadimplencia (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_envio TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inadimplente_id UUID NULL,
  mensagem_enviada TEXT NULL,
  resposta_recebida BOOLEAN NULL,
  status TEXT NOT NULL,
  tipo_campanha TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_recuperado NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.campanhas_marketing (
  clinic_id UUID NOT NULL,
  conteudo_template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_fim TEXT NULL,
  data_inicio TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  segmento_alvo JSONB NULL,
  status TEXT NOT NULL,
  taxa_abertura NUMERIC NULL,
  taxa_clique NUMERIC NULL,
  taxa_conversao NUMERIC NULL,
  tipo TEXT NOT NULL,
  total_aberturas NUMERIC NULL,
  total_cliques NUMERIC NULL,
  total_conversoes NUMERIC NULL,
  total_destinatarios NUMERIC NULL,
  total_enviados NUMERIC NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.clinic_modules (
  clinic_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  module_catalog_id UUID NOT NULL,
  subscribed_at TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.clinics (
  auto_cleanup_enabled BOOLEAN NULL,
  backup_retention_days NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.cloud_storage_configs (
  clinic_id UUID NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  provider TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.collection_actions (
  action_date TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_content TEXT NULL,
  overdue_account_id UUID NOT NULL,
  response_received TEXT NULL,
  scheduled_for TEXT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.collection_automation_config (
  action_type TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  days_trigger NUMERIC NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  message_template TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.contas_pagar (
  anexo_url TEXT NULL,
  categoria TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  data_emissao TEXT NOT NULL,
  data_pagamento TEXT NULL,
  data_vencimento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  forma_pagamento TEXT NULL,
  fornecedor TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  parcela_numero NUMERIC NULL,
  parcela_total NUMERIC NULL,
  periodicidade TEXT NULL,
  recorrente BOOLEAN NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor NUMERIC NOT NULL,
  valor_pago NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.contas_receber (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  data_emissao TEXT NOT NULL,
  data_pagamento TEXT NULL,
  data_vencimento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  forma_pagamento TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  parcela_numero NUMERIC NULL,
  parcela_total NUMERIC NULL,
  patient_id UUID NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor NUMERIC NOT NULL,
  valor_pago NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.contrato_anexos (
  caminho_storage TEXT NOT NULL,
  contrato_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mime_type TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tamanho_bytes NUMERIC NOT NULL,
  uploaded_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.contrato_templates (
  ativo BOOLEAN NOT NULL,
  clinic_id UUID NOT NULL,
  conteudo_html TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo_tratamento TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  variaveis_disponiveis JSONB NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.contratos (
  assinado_em TEXT NULL,
  assinatura_dentista_base64 TEXT NULL,
  assinatura_paciente_base64 TEXT NULL,
  cancelado_em TEXT NULL,
  clinic_id UUID NOT NULL,
  conteudo_html TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_inicio TEXT NOT NULL,
  data_termino TEXT NULL,
  hash_blockchain TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_assinatura TEXT NULL,
  motivo_cancelamento TEXT NULL,
  numero_contrato TEXT NOT NULL,
  orcamento_id UUID NULL,
  patient_id UUID NOT NULL,
  renovacao_automatica BOOLEAN NULL,
  status TEXT NOT NULL,
  template_id UUID NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_contrato NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crm_activities (
  activity_type TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  completed_date TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  outcome TEXT NULL,
  scheduled_date TEXT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crm_conversions (
  assigned_to TEXT NULL,
  clinic_id UUID NOT NULL,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC NULL,
  converted_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  time_to_convert_days NUMERIC NULL,
  total_interactions NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crm_interactions (
  attachments JSONB NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_type TEXT NOT NULL,
  lead_id UUID NOT NULL,
  next_action TEXT NULL,
  next_action_date TEXT NULL,
  outcome TEXT NULL,
  subject TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crm_leads (
  assigned_to TEXT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  email TEXT NULL,
  estimated_value NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_description TEXT NULL,
  name TEXT NOT NULL,
  next_contact_date TEXT NULL,
  notes TEXT NULL,
  phone TEXT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  tags TEXT[] NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crm_stages (
  average_time_days NUMERIC NULL,
  clinic_id UUID NOT NULL,
  color TEXT NULL,
  conversion_rate NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  name TEXT NOT NULL,
  order_index NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crypto_candlestick_data (
  close_price NUMERIC NOT NULL,
  close_time TEXT NOT NULL,
  coin_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  high_price NUMERIC NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interval TEXT NOT NULL,
  low_price NUMERIC NOT NULL,
  open_price NUMERIC NOT NULL,
  open_time TEXT NOT NULL,
  volume NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crypto_payments (
  amount_brl NUMERIC NOT NULL,
  checkout_link TEXT NULL,
  clinic_id UUID NOT NULL,
  confirmations NUMERIC NULL,
  confirmed_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NULL,
  crypto_amount NUMERIC NULL,
  crypto_currency TEXT NULL,
  currency TEXT NOT NULL,
  expires_at TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  metadata JSONB NULL,
  order_id UUID NOT NULL,
  qr_code_data TEXT NULL,
  status TEXT NOT NULL,
  transaction_id UUID NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.crypto_price_alerts (
  alert_type TEXT NOT NULL,
  auto_convert_on_trigger BOOLEAN NULL,
  cascade_enabled BOOLEAN NULL,
  cascade_group_id UUID NULL,
  cascade_order NUMERIC NULL,
  clinic_id UUID NOT NULL,
  coin_type TEXT NOT NULL,
  conversion_percentage NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  last_triggered_at TEXT NULL,
  notification_method TEXT[] NOT NULL,
  stop_loss_enabled BOOLEAN NULL,
  target_rate_brl NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.dentist_schedules (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  day_of_week NUMERIC NOT NULL,
  dentist_id UUID NOT NULL,
  end_time TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  start_time TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.estoque_pedidos (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_pedido TEXT NOT NULL,
  data_prevista_entrega TEXT NULL,
  data_recebimento TEXT NULL,
  fornecedor_id UUID NOT NULL,
  gerado_automaticamente BOOLEAN NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido TEXT NOT NULL,
  observacoes TEXT NULL,
  status TEXT NOT NULL,
  tipo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_total NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.estoque_pedidos_config (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dias_entrega_estimados NUMERIC NULL,
  gerar_automaticamente BOOLEAN NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ponto_pedido NUMERIC NOT NULL,
  produto_id UUID NOT NULL,
  quantidade_reposicao NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.estoque_pedidos_itens (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  pedido_id UUID NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  produto_id UUID NOT NULL,
  quantidade NUMERIC NOT NULL,
  quantidade_recebida NUMERIC NULL,
  valor_total NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.fechamento_caixa (
  arquivo_sped_gerado_em TEXT NULL,
  arquivo_sped_path TEXT NULL,
  caixa_movimento_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NOT NULL,
  data_fechamento TEXT NOT NULL,
  divergencia NUMERIC NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  percentual_divergencia NUMERIC NULL,
  quantidade_nfce NUMERIC NOT NULL,
  quantidade_vendas_pdv NUMERIC NOT NULL,
  total_nfce_emitidas NUMERIC NOT NULL,
  total_sangrias NUMERIC NOT NULL,
  total_suprimentos NUMERIC NOT NULL,
  total_vendas_pdv NUMERIC NOT NULL,
  vendas_sem_nfce NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.financial_categories (
  active BOOLEAN NULL,
  clinic_id UUID NOT NULL,
  color TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  icon TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.financial_transactions (
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  description TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes TEXT NULL,
  payment_method TEXT NULL,
  status TEXT NOT NULL,
  tags TEXT[] NULL,
  transaction_date TEXT NOT NULL,
  type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.fiscal_config (
  ambiente TEXT NOT NULL,
  certificado_digital TEXT NULL,
  clinic_id UUID NOT NULL,
  cnpj TEXT NOT NULL,
  codigo_regime_tributario NUMERIC NULL,
  contingencia_enabled BOOLEAN NULL,
  contingencia_motivo TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  csc_id UUID NULL,
  csc_token TEXT NULL,
  email_contabilidade TEXT NULL,
  endereco JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_estadual TEXT NULL,
  is_active BOOLEAN NULL,
  nome_fantasia TEXT NULL,
  numero_ultimo_nfce NUMERIC NULL,
  razao_social TEXT NOT NULL,
  regime_tributario TEXT NOT NULL,
  senha_certificado TEXT NULL,
  serie_nfce NUMERIC NULL,
  tipo_emissao TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.funcionarios (
  avatar_url TEXT NULL,
  cargo TEXT NOT NULL,
  celular TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  cpf TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_admissao TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  dias_trabalho NUMERIC NOT NULL,
  email TEXT NOT NULL,
  endereco JSONB NOT NULL,
  horario_trabalho JSONB NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  observacoes TEXT NULL,
  permissoes JSONB NOT NULL,
  rg TEXT NULL,
  salario NUMERIC NOT NULL,
  sexo TEXT NOT NULL,
  status TEXT NOT NULL,
  telefone TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.github_events (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  event_data JSONB NOT NULL,
  event_type TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.historico_clinico (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  dados_estruturados JSONB NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.inadimplentes (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dias_atraso NUMERIC NOT NULL,
  email TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_paciente TEXT NOT NULL,
  observacoes TEXT NULL,
  patient_id UUID NOT NULL,
  status TEXT NOT NULL,
  telefone TEXT NULL,
  ultima_cobranca TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_total_devido NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.integracao_contabil_config (
  api_key TEXT NULL,
  api_secret TEXT NULL,
  api_url TEXT NOT NULL,
  ativo BOOLEAN NOT NULL,
  clinic_id UUID NOT NULL,
  codigo_empresa TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email_contador TEXT NULL,
  enviar_nfce_dados BOOLEAN NOT NULL,
  enviar_sped_fiscal BOOLEAN NOT NULL,
  envio_automatico BOOLEAN NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  periodicidade_envio TEXT NOT NULL,
  software TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.integracao_contabil_envios (
  arquivo_path TEXT NULL,
  arquivo_size_bytes NUMERIC NULL,
  clinic_id UUID NOT NULL,
  config_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  enviado_em TEXT NULL,
  erro_mensagem TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_tentativas NUMERIC NOT NULL,
  periodo_referencia TEXT NOT NULL,
  response_data JSONB NULL,
  status TEXT NOT NULL,
  tentativas NUMERIC NOT NULL,
  tipo_documento TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.inventario_agendamentos (
  ativo BOOLEAN NOT NULL,
  categorias_ids TEXT[] NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  dia_execucao NUMERIC NULL,
  dia_semana NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  notificar_dias_antes NUMERIC NULL,
  notificar_responsavel BOOLEAN NULL,
  observacoes TEXT NULL,
  periodicidade TEXT NOT NULL,
  proxima_execucao TEXT NULL,
  responsavel TEXT NOT NULL,
  tipo_inventario TEXT NOT NULL,
  ultima_execucao TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.inventario_itens (
  contado_em TEXT NULL,
  contado_por TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  divergencia NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id UUID NOT NULL,
  lote TEXT NULL,
  observacoes TEXT NULL,
  percentual_divergencia NUMERIC NULL,
  produto_id UUID NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade_fisica NUMERIC NULL,
  quantidade_sistema NUMERIC NOT NULL,
  valor_divergencia NUMERIC NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.inventarios (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data TEXT NOT NULL,
  divergencias_encontradas NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itens_contados NUMERIC NULL,
  numero TEXT NOT NULL,
  observacoes TEXT NULL,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL,
  tipo TEXT NOT NULL,
  total_itens NUMERIC NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_divergencias NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lead_interacoes (
  agendou_avaliacao BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  proximo_passo TEXT NULL,
  resultado TEXT NULL,
  tipo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lead_tags (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  tag TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.leads (
  atribuido_a TEXT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  email TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interesse TEXT NULL,
  motivo_perda TEXT NULL,
  nome TEXT NOT NULL,
  observacoes TEXT NULL,
  origem TEXT NOT NULL,
  proximo_followup TEXT NULL,
  score_qualidade NUMERIC NULL,
  status_funil TEXT NOT NULL,
  telefone TEXT NULL,
  temperatura TEXT NOT NULL,
  ultimo_contato TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  utm_campaign TEXT NULL,
  utm_medium TEXT NULL,
  utm_source TEXT NULL,
  valor_estimado NUMERIC NULL,
  whatsapp TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lgpd_consents (
  accepted BOOLEAN NOT NULL,
  accepted_at TEXT NULL,
  accepted_by TEXT NULL,
  clinic_id UUID NOT NULL,
  consent_text TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NULL,
  metadata JSONB NULL,
  patient_id UUID NOT NULL,
  revoked BOOLEAN NULL,
  revoked_at TEXT NULL,
  revoked_by TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_agent TEXT NULL,
  version NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lgpd_data_consents (
  clinic_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TEXT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  revoked_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lgpd_data_exports (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  download_count NUMERIC NULL,
  downloaded_at TEXT NULL,
  error_message TEXT NULL,
  expires_at TEXT NULL,
  export_type TEXT NOT NULL,
  file_format TEXT NULL,
  file_path TEXT NULL,
  file_size_bytes NUMERIC NULL,
  generated_at TEXT NULL,
  generated_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  patient_id UUID NOT NULL,
  request_id UUID NULL,
  status TEXT NOT NULL,
  tables_included TEXT[] NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.lgpd_data_requests (
  clinic_id UUID NOT NULL,
  completed_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_export_id UUID NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  patient_id UUID NOT NULL,
  rejection_reason TEXT NULL,
  request_type TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  responded_at TEXT NULL,
  responded_by TEXT NULL,
  response TEXT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.login_attempts (
  attempted_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  device_fingerprint TEXT NULL,
  email TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NULL,
  ip_geolocation JSONB NULL,
  session_duration_seconds NUMERIC NULL,
  success BOOLEAN NOT NULL,
  user_agent TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.marketing_campaigns (
  campaign_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NULL,
  end_date TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_sent_at TEXT NULL,
  metadata JSONB NULL,
  name TEXT NOT NULL,
  schedule_config JSONB NULL,
  send_immediately BOOLEAN NULL,
  start_date TEXT NULL,
  status TEXT NOT NULL,
  target_audience JSONB NULL,
  template_id UUID NULL,
  trigger_config JSONB NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.module_catalog (
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT NULL,
  icon TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.module_configuration_templates (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT NULL,
  icon TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  modules JSONB NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.module_dependencies (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  depends_on_module_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.movimentacoes_estoque (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo TEXT NULL,
  observacoes TEXT NULL,
  produto_id UUID NOT NULL,
  quantidade NUMERIC NOT NULL,
  quantidade_anterior NUMERIC NOT NULL,
  quantidade_atual NUMERIC NOT NULL,
  tipo TEXT NOT NULL,
  usuario_id UUID NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.nfce_carta_correcao (
  clinic_id UUID NOT NULL,
  codigo_status TEXT NULL,
  correcao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NOT NULL,
  data_evento TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo TEXT NULL,
  nfce_id UUID NOT NULL,
  protocolo TEXT NULL,
  sequencia NUMERIC NOT NULL,
  status TEXT NOT NULL,
  xml_evento TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.nfce_contingencia (
  chave_acesso TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  emitido_em TEXT NOT NULL,
  erro_sincronizacao TEXT NULL,
  forma_pagamento TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itens JSONB NOT NULL,
  modo_contingencia TEXT NOT NULL,
  motivo_contingencia TEXT NOT NULL,
  numero_nfce NUMERIC NOT NULL,
  protocolo_autorizacao TEXT NULL,
  serie NUMERIC NOT NULL,
  sincronizado_em TEXT NULL,
  status_sincronizacao TEXT NOT NULL,
  tentativas_sincronizacao NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_total NUMERIC NOT NULL,
  venda_id UUID NULL,
  xml_nfce TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.nfce_emitidas (
  ambiente TEXT NOT NULL,
  chave_acesso TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  contingencia BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  data_cancelamento TEXT NULL,
  data_emissao TEXT NULL,
  error_message TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  motivo_cancelamento TEXT NULL,
  numero_nfce NUMERIC NOT NULL,
  pdf_url TEXT NULL,
  protocolo_autorizacao TEXT NULL,
  qrcode_url TEXT NULL,
  serie NUMERIC NOT NULL,
  status TEXT NOT NULL,
  tipo_emissao TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL,
  valor_total NUMERIC NOT NULL,
  venda_id UUID NOT NULL,
  xml_cancelamento TEXT NULL,
  xml_nfce TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.nfce_inutilizacao (
  ano NUMERIC NOT NULL,
  clinic_id UUID NOT NULL,
  codigo_status TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  created_by TEXT NOT NULL,
  data_inutilizacao TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  justificativa TEXT NOT NULL,
  motivo TEXT NULL,
  numero_final NUMERIC NOT NULL,
  numero_inicial NUMERIC NOT NULL,
  protocolo TEXT NULL,
  serie NUMERIC NOT NULL,
  status TEXT NOT NULL,
  xml_inutilizacao TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.notas_fiscais (
  chave_acesso TEXT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  data_emissao TEXT NOT NULL,
  data_recebimento TEXT NULL,
  destinatario_cnpj TEXT NULL,
  destinatario_nome TEXT NULL,
  emitente_cnpj TEXT NOT NULL,
  emitente_nome TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  observacoes TEXT NULL,
  pdf_url TEXT NULL,
  serie TEXT NULL,
  status TEXT NOT NULL,
  tipo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_icms NUMERIC NULL,
  valor_iss NUMERIC NULL,
  valor_total NUMERIC NOT NULL,
  xml_url TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.notifications (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lida BOOLEAN NOT NULL,
  lida_em TEXT NULL,
  link_acao TEXT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.odontogramas (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  history JSONB NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_updated TEXT NOT NULL,
  prontuario_id UUID NOT NULL,
  teeth JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.onboarding_analytics (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  event_type TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  step_name TEXT NULL,
  step_number NUMERIC NULL,
  time_spent_seconds NUMERIC NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.orcamento_itens (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dente_codigo TEXT NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  orcamento_id UUID NOT NULL,
  ordem NUMERIC NOT NULL,
  procedimento_id UUID NULL,
  quantidade NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.orcamento_pagamento (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  forma_pagamento TEXT[] NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_parcelas NUMERIC NULL,
  observacoes TEXT NULL,
  orcamento_id UUID NOT NULL,
  tipo_pagamento TEXT NOT NULL,
  valor_entrada NUMERIC NULL,
  valor_parcela NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.orcamento_visualizacoes (
  duracao_segundos NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NULL,
  orcamento_id UUID NOT NULL,
  user_agent TEXT NULL,
  visualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.orcamentos (
  aprovado_em TEXT NULL,
  aprovado_por TEXT NULL,
  clinic_id UUID NOT NULL,
  convertido_em TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_validade TEXT NOT NULL,
  desconto_percentual NUMERIC NULL,
  desconto_valor NUMERIC NULL,
  descricao TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo_rejeicao TEXT NULL,
  numero_orcamento TEXT NOT NULL,
  observacoes TEXT NULL,
  patient_id UUID NOT NULL,
  prontuario_id UUID NULL,
  rejeitado_em TEXT NULL,
  status TEXT NOT NULL,
  tipo_plano TEXT NOT NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  validade_dias NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.overdue_accounts (
  clinic_id UUID NOT NULL,
  conta_receber_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  days_overdue NUMERIC NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_amount NUMERIC NULL,
  original_amount NUMERIC NOT NULL,
  patient_id UUID NOT NULL,
  penalty_amount NUMERIC NULL,
  remaining_amount NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_accounts (
  ativo BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email TEXT NOT NULL,
  email_verificado BOOLEAN NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  senha_hash TEXT NOT NULL,
  token_verificacao TEXT NULL,
  ultimo_acesso TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_messages (
  anexos JSONB NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lida BOOLEAN NOT NULL,
  lida_em TEXT NULL,
  mensagem TEXT NOT NULL,
  patient_id UUID NOT NULL,
  remetente_id UUID NOT NULL,
  remetente_tipo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_notifications (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lida BOOLEAN NOT NULL,
  lida_em TEXT NULL,
  link_acao TEXT NULL,
  mensagem TEXT NOT NULL,
  patient_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idioma TEXT NULL,
  lembrete_consulta_horas NUMERIC NULL,
  notificacoes_email BOOLEAN NULL,
  notificacoes_push BOOLEAN NULL,
  notificacoes_sms BOOLEAN NULL,
  notificacoes_whatsapp BOOLEAN NULL,
  patient_id UUID NOT NULL,
  tema TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_sessions (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patient_status_history (
  changed_at TEXT NULL,
  changed_by TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  from_status TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes TEXT NULL,
  patient_id UUID NOT NULL,
  reason TEXT NULL,
  to_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.patients (
  address_city TEXT NULL,
  address_complement TEXT NULL,
  address_country TEXT NULL,
  address_neighborhood TEXT NULL,
  address_number TEXT NULL,
  address_state TEXT NULL,
  address_street TEXT NULL,
  address_zipcode TEXT NULL,
  alcohol_frequency TEXT NULL,
  allergies_list TEXT[] NULL,
  birth_date TEXT NOT NULL,
  bleeding_disorder_details TEXT NULL,
  blood_pressure_diastolic NUMERIC NULL,
  blood_pressure_systolic NUMERIC NULL,
  blood_type TEXT NULL,
  bmi NUMERIC NULL,
  campanha_origem_id UUID NULL,
  campanha_origem_nome TEXT NULL,
  canal_captacao TEXT NULL,
  cardiovascular_details TEXT NULL,
  cargo TEXT NULL,
  churn_risk_score NUMERIC NULL,
  clinic_id UUID NOT NULL,
  clinical_observations TEXT NULL,
  cnpj_empresa TEXT NULL,
  cpf TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  current_medications TEXT[] NULL,
  data_conversao TEXT NULL,
  data_primeiro_contato TEXT NULL,
  data_qualificacao TEXT NULL,
  data_sharing_consent BOOLEAN NULL,
  diabetes_controlled BOOLEAN NULL,
  diabetes_type TEXT NULL,
  education_level TEXT NULL,
  email TEXT NULL,
  emergency_contact_name TEXT NULL,
  emergency_contact_relationship TEXT NULL,
  empresa TEXT NULL,
  evento_captacao TEXT NULL,
  first_appointment_date TEXT NULL,
  full_name TEXT NOT NULL,
  gender TEXT NULL,
  gum_condition TEXT NULL,
  has_alcohol_habit BOOLEAN NULL,
  has_allergies BOOLEAN NULL,
  has_bleeding_disorder BOOLEAN NULL,
  has_cardiovascular_disease BOOLEAN NULL,
  has_diabetes BOOLEAN NULL,
  has_hepatitis BOOLEAN NULL,
  has_hiv BOOLEAN NULL,
  has_hypertension BOOLEAN NULL,
  has_medication_allergy BOOLEAN NULL,
  has_smoking_habit BOOLEAN NULL,
  has_systemic_disease BOOLEAN NULL,
  heart_rate NUMERIC NULL,
  height_cm NUMERIC NULL,
  hepatitis_type TEXT NULL,
  hypertension_controlled BOOLEAN NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_usage_consent BOOLEAN NULL,
  indicado_por TEXT NULL,
  indicado_por_dentista_id UUID NULL,
  indicado_por_paciente_id UUID NULL,
  is_breastfeeding BOOLEAN NULL,
  is_pregnant BOOLEAN NULL,
  last_appointment_date TEXT NULL,
  lgpd_consent BOOLEAN NULL,
  lgpd_consent_date TEXT NULL,
  main_complaint TEXT NULL,
  marital_status TEXT NULL,
  marketing_campaign TEXT NULL,
  marketing_event TEXT NULL,
  marketing_promoter TEXT NULL,
  marketing_source TEXT NULL,
  marketing_telemarketing_agent TEXT NULL,
  medication_allergies TEXT[] NULL,
  nationality TEXT NULL,
  occupation TEXT NULL,
  oral_hygiene_quality TEXT NULL,
  origem_lead TEXT NULL,
  pain_level NUMERIC NULL,
  patient_code TEXT NULL,
  payment_status TEXT NULL,
  phone_emergency TEXT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT NULL,
  preferred_payment_method TEXT NULL,
  pregnancy_trimester NUMERIC NULL,
  promotor_id UUID NULL,
  promotor_nome TEXT NULL,
  propensao_indicacao NUMERIC NULL,
  referral_source TEXT NULL,
  rg TEXT NULL,
  risk_level TEXT NULL,
  risk_score_anesthetic NUMERIC NULL,
  risk_score_medical NUMERIC NULL,
  risk_score_overall NUMERIC NULL,
  risk_score_surgical NUMERIC NULL,
  smoking_frequency TEXT NULL,
  social_name TEXT NULL,
  status TEXT NULL,
  systemic_diseases TEXT[] NULL,
  total_appointments NUMERIC NULL,
  total_debt NUMERIC NULL,
  total_paid NUMERIC NULL,
  treatment_consent BOOLEAN NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT NULL,
  valor_lifetime NUMERIC NULL,
  valor_ticket_medio NUMERIC NULL,
  weight_kg NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.payment_methods (
  active BOOLEAN NULL,
  clinic_id UUID NOT NULL,
  config JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  taxa_fixa NUMERIC NULL,
  taxa_percentual NUMERIC NULL,
  type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.payment_negotiations (
  accepted_at TEXT NULL,
  clinic_id UUID NOT NULL,
  completed_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  discount_amount NUMERIC NULL,
  discount_percentage NUMERIC NULL,
  first_payment_date TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installments NUMERIC NULL,
  negotiated_amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  overdue_account_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pdv_produtos (
  cest TEXT NULL,
  cfop TEXT NULL,
  clinic_id UUID NOT NULL,
  codigo TEXT NOT NULL,
  cofins_aliquota NUMERIC NULL,
  controla_estoque BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NULL,
  cst_cofins TEXT NULL,
  cst_icms TEXT NULL,
  cst_pis TEXT NULL,
  descricao TEXT NOT NULL,
  estoque_atual NUMERIC NULL,
  estoque_minimo NUMERIC NULL,
  icms_aliquota NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NULL,
  ncm TEXT NULL,
  origem_mercadoria NUMERIC NULL,
  pis_aliquota NUMERIC NULL,
  tipo TEXT NOT NULL,
  unidade_medida TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pdv_vendas (
  caixa_movimento_id UUID NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  forma_pagamento TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  numero_venda TEXT NOT NULL,
  observacoes TEXT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_total NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_anexos (
  caminho_storage TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  descricao TEXT NULL,
  historico_id UUID NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mime_type TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  prontuario_id UUID NOT NULL,
  tamanho_bytes NUMERIC NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  uploaded_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_assinaturas (
  assinatura_base64 TEXT NOT NULL,
  historico_id UUID NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NULL,
  prontuario_id UUID NOT NULL,
  signed_at TEXT NOT NULL,
  signed_by TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  user_agent TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_evolucoes (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_evolucao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  tratamento_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_odontograma (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  dente_codigo TEXT NOT NULL,
  faces_afetadas TEXT[] NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  prontuario_id UUID NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_odontograma_data (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes TEXT NULL,
  prontuario_id UUID NOT NULL,
  status TEXT NOT NULL,
  tooth_number NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_odontograma_history (
  changed_teeth NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  description TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL,
  snapshot_data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_tooth_surfaces (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odontograma_data_id UUID NOT NULL,
  status TEXT NOT NULL,
  surface TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.pep_tratamentos (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_conclusao TEXT NULL,
  data_inicio TEXT NOT NULL,
  dente_codigo TEXT NULL,
  descricao TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observacoes TEXT NULL,
  procedimento_id UUID NULL,
  prontuario_id UUID NOT NULL,
  status TEXT NOT NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_estimado NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.permission_audit_logs (
  action TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  details JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_catalog_id UUID NULL,
  target_user_id UUID NOT NULL,
  template_name TEXT NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.permission_templates (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT NULL,
  icon TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_keys TEXT[] NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.prescricoes_remotas (
  assinatura_digital TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  descricao TEXT NOT NULL,
  enviado_em TEXT NULL,
  enviado_para_paciente BOOLEAN NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrucoes TEXT NULL,
  medicamento_dosagem TEXT NULL,
  medicamento_duracao TEXT NULL,
  medicamento_frequencia TEXT NULL,
  medicamento_nome TEXT NULL,
  teleconsulta_id UUID NOT NULL,
  tipo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.problemas_radiograficos (
  analise_id UUID NOT NULL,
  confianca NUMERIC NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dente_codigo TEXT NULL,
  descricao TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  localizacao TEXT NULL,
  severidade TEXT NOT NULL,
  sugestao_tratamento TEXT NULL,
  tipo_problema TEXT NOT NULL,
  urgente BOOLEAN NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.procedimento_templates (
  categoria TEXT NOT NULL,
  clinic_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  descricao TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_public BOOLEAN NULL,
  nome TEXT NOT NULL,
  steps JSONB NOT NULL,
  tags TEXT[] NULL,
  tempo_estimado_minutos NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_sugerido NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.produtos (
  ativo BOOLEAN NOT NULL,
  categoria TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  codigo_barras TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  descricao TEXT NULL,
  fornecedor TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  localizacao TEXT NULL,
  nome TEXT NOT NULL,
  observacoes TEXT NULL,
  quantidade_atual NUMERIC NOT NULL,
  quantidade_minima NUMERIC NOT NULL,
  unidade_medida TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valor_unitario NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.profiles (
  app_role TEXT NOT NULL,
  avatar_url TEXT NULL,
  clinic_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  phone TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.prontuarios (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.radiografia_ai_feedback (
  analise_id UUID NOT NULL,
  anotacoes_dentista JSONB NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  diagnostico_correto TEXT NULL,
  falsos_negativos JSONB NULL,
  falsos_positivos JSONB NULL,
  ia_estava_correta BOOLEAN NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_marcada_url TEXT NULL,
  usado_para_treino BOOLEAN NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.radiografia_laudo_templates (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default BOOLEAN NULL,
  nome_template TEXT NOT NULL,
  template_markdown TEXT NOT NULL,
  tipo_radiografia TEXT NOT NULL,
  variaveis_disponiveis JSONB NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.rate_limit_config (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  enabled BOOLEAN NOT NULL,
  endpoint TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_requests_per_ip NUMERIC NOT NULL,
  max_requests_per_user NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  window_minutes NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.rate_limit_log (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  endpoint TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  request_count NUMERIC NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NULL,
  window_start TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.recalls (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NULL,
  data_prevista TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_personalizada TEXT NULL,
  metodo_notificacao TEXT NULL,
  notificacao_enviada BOOLEAN NULL,
  patient_id UUID NOT NULL,
  status TEXT NOT NULL,
  tipo_recall TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.room_availability (
  capacity NUMERIC NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  equipment JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  room_name TEXT NOT NULL,
  room_number TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.root_actions_log (
  action TEXT NOT NULL,
  details JSONB NULL,
  executed_at TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  root_user_id UUID NOT NULL,
  target_record_id UUID NULL,
  target_table TEXT NULL,
  user_agent TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.rum_metrics (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  page_url TEXT NOT NULL,
  rating TEXT NOT NULL,
  user_agent TEXT NULL,
  user_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.sat_mfe_config (
  ativo BOOLEAN NOT NULL,
  clinic_id UUID NOT NULL,
  codigo_ativacao TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fabricante TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NULL,
  metadata JSONB NULL,
  modelo TEXT NULL,
  numero_serie TEXT NOT NULL,
  porta NUMERIC NULL,
  tipo_equipamento TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  versao_software TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.sat_mfe_impressoes (
  chave_consulta TEXT NULL,
  clinic_id UUID NOT NULL,
  codigo_autorizacao TEXT NULL,
  config_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_retorno TEXT NULL,
  metadata JSONB NULL,
  nfce_id UUID NULL,
  numero_sessao TEXT NULL,
  status TEXT NOT NULL,
  tentativas NUMERIC NOT NULL,
  tipo_equipamento TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  venda_id UUID NULL,
  xml_enviado TEXT NULL,
  xml_retorno TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.scheduled_backups (
  backup_type TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  compression_enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  day_of_month NUMERIC NULL,
  day_of_week NUMERIC NULL,
  encryption_enabled BOOLEAN NOT NULL,
  frequency TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  include_data JSONB NOT NULL,
  includes_postgres_dump BOOLEAN NULL,
  is_active BOOLEAN NOT NULL,
  last_run_at TEXT NULL,
  local_path TEXT NULL,
  max_parallel_jobs NUMERIC NULL,
  name TEXT NOT NULL,
  next_run_at TEXT NOT NULL,
  notification_emails TEXT[] NULL,
  retention_policy_id UUID NULL,
  storage_config JSONB NULL,
  storage_destination TEXT NULL,
  time_of_day TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.scheduled_exports (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  dashboard_name TEXT NOT NULL,
  email TEXT NOT NULL,
  export_format TEXT NOT NULL,
  frequency TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  last_sent_at TEXT NULL,
  next_send_at TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.security_audit_log (
  description TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type TEXT NOT NULL,
  migration_version TEXT NOT NULL,
  resolution TEXT NOT NULL,
  resolved_at TEXT NOT NULL,
  severity TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_payment_config (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL,
  percentage NUMERIC NOT NULL,
  procedure_type TEXT NULL,
  professional_id UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_payment_details (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  net_amount NUMERIC NOT NULL,
  paid_at TEXT NULL,
  recipient_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  split_amount NUMERIC NOT NULL,
  split_transaction_id UUID NOT NULL,
  status TEXT NOT NULL,
  tax_withheld NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_payment_recipients (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NULL,
  recipient_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  rule_id UUID NOT NULL,
  split_fixed_amount NUMERIC NULL,
  split_percentage NUMERIC NULL,
  tax_rate NUMERIC NULL,
  tax_regime TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_payment_rules (
  clinic_id UUID NOT NULL,
  conditions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority NUMERIC NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_payment_transactions (
  clinic_id UUID NOT NULL,
  conta_receber_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  error_message TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_at TEXT NULL,
  rule_id UUID NULL,
  split_calculated_at TEXT NOT NULL,
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  transaction_id UUID NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.split_transactions (
  clinic_amount NUMERIC NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  percentage NUMERIC NOT NULL,
  processed_at TEXT NULL,
  professional_amount NUMERIC NOT NULL,
  professional_id UUID NOT NULL,
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  transaction_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.system_health_metrics (
  clinic_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB NULL,
  metric_type TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  unit TEXT NULL,
  value NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.teleconsultas (
  appointment_id UUID NULL,
  clinic_id UUID NOT NULL,
  conduta TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  data_agendada TEXT NOT NULL,
  data_finalizada TEXT NULL,
  data_iniciada TEXT NULL,
  dentist_id UUID NOT NULL,
  diagnostico TEXT NULL,
  duracao_minutos NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_sala TEXT NULL,
  motivo TEXT NOT NULL,
  observacoes TEXT NULL,
  patient_id UUID NOT NULL,
  recording_url TEXT NULL,
  status TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.teleodonto_chat (
  attachment_type TEXT NULL,
  attachment_url TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL,
  read_at TEXT NULL,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  session_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.teleodonto_files (
  compartilhado_com_paciente BOOLEAN NULL,
  descricao TEXT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes NUMERIC NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.teleodonto_sessions (
  appointment_id UUID NULL,
  clinic_id UUID NOT NULL,
  consentimento_assinado_em TEXT NULL,
  consentimento_gravacao BOOLEAN NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  dentist_id UUID NOT NULL,
  dentist_joined_at TEXT NULL,
  diagnostico_preliminar TEXT NULL,
  duracao_minutos NUMERIC NULL,
  ended_at TEXT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notas_pos_consulta TEXT NULL,
  notas_pre_consulta TEXT NULL,
  patient_id UUID NOT NULL,
  patient_joined_at TEXT NULL,
  platform TEXT NOT NULL,
  prescricoes JSONB NULL,
  problemas_tecnicos TEXT NULL,
  qualidade_audio TEXT NULL,
  qualidade_video TEXT NULL,
  recording_url TEXT NULL,
  room_id UUID NULL,
  room_url TEXT NULL,
  scheduled_end TEXT NOT NULL,
  scheduled_start TEXT NOT NULL,
  started_at TEXT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.terminal_command_history (
  clinic_id UUID NOT NULL,
  command TEXT NOT NULL,
  duration_ms NUMERIC NULL,
  executed_at TEXT NOT NULL,
  exit_code NUMERIC NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  output TEXT NULL,
  user_id UUID NOT NULL,
  was_successful BOOLEAN NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.tiss_batches (
  batch_number TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  guide_ids TEXT[] NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company TEXT NOT NULL,
  processed_at TEXT NULL,
  sent_at TEXT NULL,
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  total_guides NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.tiss_guides (
  amount NUMERIC NOT NULL,
  batch_id UUID NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  guide_number TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company TEXT NOT NULL,
  patient_id UUID NOT NULL,
  procedure_code TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  response_date TEXT NULL,
  service_date TEXT NOT NULL,
  status TEXT NOT NULL,
  submission_date TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.triagem_teleconsulta (
  alergias TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fotos_anexas JSONB NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intensidade_dor NUMERIC NULL,
  medicamentos_uso TEXT NULL,
  sintomas TEXT[] NULL,
  teleconsulta_id UUID NOT NULL,
  tempo_sintoma TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.user_clinic_access (
  clinic_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default BOOLEAN NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.user_module_permissions (
  can_delete BOOLEAN NOT NULL,
  can_edit BOOLEAN NOT NULL,
  can_view BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_catalog_id UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.user_roles (
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.wiki_page_versions (
  change_summary TEXT NULL,
  changed_by TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL,
  title TEXT NOT NULL,
  version NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_data.wiki_pages (
  category TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published BOOLEAN NOT NULL,
  parent_id UUID NULL,
  slug TEXT NOT NULL,
  tags TEXT[] NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT NULL,
  version NUMERIC NOT NULL
);

-- Enable RLS on all tenant_data tables

ALTER TABLE tenant_data.__InternalSupabase ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenant_data.Insert ENABLE ROW LEVEL SECURITY;