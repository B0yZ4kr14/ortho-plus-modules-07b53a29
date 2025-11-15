export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abuse_reports: {
        Row: {
          abuse_type: string
          auto_blocked: boolean | null
          created_at: string
          details: Json | null
          endpoint: string
          id: number
          ip_address: unknown
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          abuse_type: string
          auto_blocked?: boolean | null
          created_at?: string
          details?: Json | null
          endpoint: string
          id?: number
          ip_address: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          abuse_type?: string
          auto_blocked?: boolean | null
          created_at?: string
          details?: Json | null
          endpoint?: string
          id?: number
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analises_radiograficas: {
        Row: {
          ai_model_version: string | null
          ai_processing_time_ms: number | null
          auto_approved: boolean | null
          clinic_id: string
          confidence_score: number | null
          created_at: string
          created_by: string
          feedback_comments: string | null
          feedback_rating: number | null
          id: string
          imagem_storage_path: string
          imagem_url: string
          observacoes_dentista: string | null
          patient_id: string
          problemas_detectados: number | null
          prontuario_id: string | null
          resultado_ia: Json | null
          revisado_em: string | null
          revisado_por: string | null
          revisado_por_dentista: boolean | null
          status_analise: string
          tipo_radiografia: string
          updated_at: string
        }
        Insert: {
          ai_model_version?: string | null
          ai_processing_time_ms?: number | null
          auto_approved?: boolean | null
          clinic_id: string
          confidence_score?: number | null
          created_at?: string
          created_by: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          imagem_storage_path: string
          imagem_url: string
          observacoes_dentista?: string | null
          patient_id: string
          problemas_detectados?: number | null
          prontuario_id?: string | null
          resultado_ia?: Json | null
          revisado_em?: string | null
          revisado_por?: string | null
          revisado_por_dentista?: boolean | null
          status_analise?: string
          tipo_radiografia: string
          updated_at?: string
        }
        Update: {
          ai_model_version?: string | null
          ai_processing_time_ms?: number | null
          auto_approved?: boolean | null
          clinic_id?: string
          confidence_score?: number | null
          created_at?: string
          created_by?: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          imagem_storage_path?: string
          imagem_url?: string
          observacoes_dentista?: string | null
          patient_id?: string
          problemas_detectados?: number | null
          prontuario_id?: string | null
          resultado_ia?: Json | null
          revisado_em?: string | null
          revisado_por?: string | null
          revisado_por_dentista?: boolean | null
          status_analise?: string
          tipo_radiografia?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_radiograficas_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_radiograficas_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_radiograficas_history: {
        Row: {
          ai_model_version: string | null
          analise_id: string
          confidence_score: number | null
          created_at: string
          created_by: string
          id: string
          problemas_detectados: number | null
          resultado_ia: Json
          versao: number
        }
        Insert: {
          ai_model_version?: string | null
          analise_id: string
          confidence_score?: number | null
          created_at?: string
          created_by: string
          id?: string
          problemas_detectados?: number | null
          resultado_ia: Json
          versao?: number
        }
        Update: {
          ai_model_version?: string | null
          analise_id?: string
          confidence_score?: number | null
          created_at?: string
          created_by?: string
          id?: string
          problemas_detectados?: number | null
          resultado_ia?: Json
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "analises_radiograficas_history_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_radiograficas"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_confirmations: {
        Row: {
          appointment_id: string
          confirmation_method: string
          confirmed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          message_content: string | null
          phone_number: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          confirmation_method: string
          confirmed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone_number?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          confirmation_method?: string
          confirmed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone_number?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          error_message: string | null
          id: string
          message_template: string
          phone_number: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_template: string
          phone_number?: string | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_template?: string
          phone_number?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          dentist_id: string
          description: string | null
          end_time: string
          id: string
          patient_id: string
          start_time: string
          status: string
          title: string
          treatment_id: string | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          dentist_id: string
          description?: string | null
          end_time: string
          id?: string
          patient_id: string
          start_time: string
          status?: string
          title: string
          treatment_id?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          dentist_id?: string
          description?: string | null
          end_time?: string
          id?: string
          patient_id?: string
          start_time?: string
          status?: string
          title?: string
          treatment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "pep_tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          action_type: string | null
          affected_records: Json | null
          clinic_id: string | null
          created_at: string
          details: Json | null
          id: number
          ip_address: unknown
          target_module_id: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          affected_records?: Json | null
          clinic_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          target_module_id?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          affected_records?: Json | null
          clinic_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          target_module_id?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_target_module_id_fkey"
            columns: ["target_module_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_history: {
        Row: {
          backup_type: string
          checksum_md5: string | null
          checksum_sha256: string | null
          clinic_id: string
          completed_at: string | null
          compression_ratio: number | null
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string | null
          file_size_bytes: number | null
          format: string | null
          id: string
          includes_postgres_dump: boolean | null
          metadata: Json | null
          parent_backup_id: string | null
          restore_tested_at: string | null
          retention_policy_id: string | null
          status: string
          transfer_speed_mbps: number | null
          verified_at: string | null
        }
        Insert: {
          backup_type: string
          checksum_md5?: string | null
          checksum_sha256?: string | null
          clinic_id: string
          completed_at?: string | null
          compression_ratio?: number | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          includes_postgres_dump?: boolean | null
          metadata?: Json | null
          parent_backup_id?: string | null
          restore_tested_at?: string | null
          retention_policy_id?: string | null
          status?: string
          transfer_speed_mbps?: number | null
          verified_at?: string | null
        }
        Update: {
          backup_type?: string
          checksum_md5?: string | null
          checksum_sha256?: string | null
          clinic_id?: string
          completed_at?: string | null
          compression_ratio?: number | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          includes_postgres_dump?: boolean | null
          metadata?: Json | null
          parent_backup_id?: string | null
          restore_tested_at?: string | null
          retention_policy_id?: string | null
          status?: string
          transfer_speed_mbps?: number | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_history_parent_backup_id_fkey"
            columns: ["parent_backup_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_history_retention_policy_id_fkey"
            columns: ["retention_policy_id"]
            isOneToOne: false
            referencedRelation: "backup_retention_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_replications: {
        Row: {
          backup_id: string
          checksum_md5: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          region: string
          replication_status: string
          source_clinic_id: string
          started_at: string | null
          storage_path: string | null
          storage_provider: string
          target_clinic_id: string
          updated_at: string | null
        }
        Insert: {
          backup_id: string
          checksum_md5?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          region: string
          replication_status?: string
          source_clinic_id: string
          started_at?: string | null
          storage_path?: string | null
          storage_provider: string
          target_clinic_id: string
          updated_at?: string | null
        }
        Update: {
          backup_id?: string
          checksum_md5?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          region?: string
          replication_status?: string
          source_clinic_id?: string
          started_at?: string | null
          storage_path?: string | null
          storage_provider?: string
          target_clinic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_replications_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_replications_source_clinic_id_fkey"
            columns: ["source_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_replications_target_clinic_id_fkey"
            columns: ["target_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_retention_policies: {
        Row: {
          auto_delete_enabled: boolean | null
          backup_type: string
          clinic_id: string
          created_at: string | null
          id: string
          keep_daily: number
          keep_monthly: number
          keep_weekly: number
          keep_yearly: number
          name: string
          updated_at: string | null
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          backup_type: string
          clinic_id: string
          created_at?: string | null
          id?: string
          keep_daily?: number
          keep_monthly?: number
          keep_weekly?: number
          keep_yearly?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          auto_delete_enabled?: boolean | null
          backup_type?: string
          clinic_id?: string
          created_at?: string | null
          id?: string
          keep_daily?: number
          keep_monthly?: number
          keep_weekly?: number
          keep_yearly?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_retention_policies_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_verification_log: {
        Row: {
          backup_id: string
          details: Json | null
          id: string
          status: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          backup_id: string
          details?: Json | null
          id?: string
          status: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          backup_id?: string
          details?: Json | null
          id?: string
          status?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_verification_log_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_default: boolean
          is_public: boolean
          layout: Json | null
          name: string
          refresh_interval_minutes: number | null
          shared_with: string[] | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout?: Json | null
          name: string
          refresh_interval_minutes?: number | null
          shared_with?: string[] | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout?: Json | null
          name?: string
          refresh_interval_minutes?: number | null
          shared_with?: string[] | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dashboards_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_data_cache: {
        Row: {
          cache_key: string
          clinic_id: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          widget_id: string | null
        }
        Insert: {
          cache_key: string
          clinic_id: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
          widget_id?: string | null
        }
        Update: {
          cache_key?: string
          clinic_id?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_data_cache_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_data_cache_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "bi_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_metrics: {
        Row: {
          aggregation_period: string
          calculation_type: string
          clinic_id: string
          created_at: string
          data_sources: string[] | null
          description: string | null
          formula: string | null
          id: string
          last_calculated_at: string | null
          metadata: Json | null
          metric_key: string
          name: string
          trend: number | null
          updated_at: string
          value: number | null
        }
        Insert: {
          aggregation_period?: string
          calculation_type: string
          clinic_id: string
          created_at?: string
          data_sources?: string[] | null
          description?: string | null
          formula?: string | null
          id?: string
          last_calculated_at?: string | null
          metadata?: Json | null
          metric_key: string
          name: string
          trend?: number | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          aggregation_period?: string
          calculation_type?: string
          clinic_id?: string
          created_at?: string
          data_sources?: string[] | null
          description?: string | null
          formula?: string | null
          id?: string
          last_calculated_at?: string | null
          metadata?: Json | null
          metric_key?: string
          name?: string
          trend?: number | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_metrics_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_reports: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          description: string | null
          format: string
          id: string
          is_active: boolean
          last_generated_at: string | null
          name: string
          next_generation_at: string | null
          parameters: Json | null
          recipients: string[] | null
          report_type: string
          schedule: Json | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          description?: string | null
          format?: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          name: string
          next_generation_at?: string | null
          parameters?: Json | null
          recipients?: string[] | null
          report_type: string
          schedule?: Json | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          format?: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          name?: string
          next_generation_at?: string | null
          parameters?: Json | null
          recipients?: string[] | null
          report_type?: string
          schedule?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_widgets: {
        Row: {
          cache_duration_minutes: number | null
          chart_type: string | null
          clinic_id: string
          created_at: string
          dashboard_id: string
          data_source: string
          display_config: Json | null
          height: number
          id: string
          name: string
          position_x: number
          position_y: number
          query_config: Json
          refresh_on_load: boolean
          updated_at: string
          widget_type: string
          width: number
        }
        Insert: {
          cache_duration_minutes?: number | null
          chart_type?: string | null
          clinic_id: string
          created_at?: string
          dashboard_id: string
          data_source: string
          display_config?: Json | null
          height?: number
          id?: string
          name: string
          position_x?: number
          position_y?: number
          query_config: Json
          refresh_on_load?: boolean
          updated_at?: string
          widget_type: string
          width?: number
        }
        Update: {
          cache_duration_minutes?: number | null
          chart_type?: string | null
          clinic_id?: string
          created_at?: string
          dashboard_id?: string
          data_source?: string
          display_config?: Json | null
          height?: number
          id?: string
          name?: string
          position_x?: number
          position_y?: number
          query_config?: Json
          refresh_on_load?: boolean
          updated_at?: string
          widget_type?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "bi_widgets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          clinic_id: string
          created_at: string | null
          created_by: string
          dentist_id: string
          end_datetime: string
          id: string
          reason: string
          start_datetime: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          created_by: string
          dentist_id: string
          end_datetime: string
          id?: string
          reason: string
          start_datetime: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          created_by?: string
          dentist_id?: string
          end_datetime?: string
          id?: string
          reason?: string
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_approvals: {
        Row: {
          acao: string
          alteracoes_realizadas: Json | null
          budget_id: string
          created_at: string
          id: string
          motivo: string | null
          usuario_id: string
          valor_orcamento: number
          versao: number
        }
        Insert: {
          acao: string
          alteracoes_realizadas?: Json | null
          budget_id: string
          created_at?: string
          id?: string
          motivo?: string | null
          usuario_id: string
          valor_orcamento: number
          versao?: number
        }
        Update: {
          acao?: string
          alteracoes_realizadas?: Json | null
          budget_id?: string
          created_at?: string
          id?: string
          motivo?: string | null
          usuario_id?: string
          valor_orcamento?: number
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_approvals_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          dente_regiao: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string
          id: string
          observacoes: string | null
          ordem: number
          procedimento_id: string | null
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          dente_regiao?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao: string
          id?: string
          observacoes?: string | null
          ordem?: number
          procedimento_id?: string | null
          quantidade?: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          dente_regiao?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string
          id?: string
          observacoes?: string | null
          ordem?: number
          procedimento_id?: string | null
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_versions: {
        Row: {
          budget_id: string
          created_at: string
          created_by: string
          id: string
          snapshot_data: Json
          versao: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          created_by: string
          id?: string
          snapshot_data: Json
          versao: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          created_by?: string
          id?: string
          snapshot_data?: Json
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_versions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          clinic_id: string
          contrato_id: string | null
          convertido_contrato: boolean | null
          created_at: string
          created_by: string
          data_expiracao: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string | null
          id: string
          motivo_rejeicao: string | null
          numero_orcamento: string
          observacoes: string | null
          patient_id: string
          rejeitado_em: string | null
          rejeitado_por: string | null
          status: string
          tipo_plano: string
          titulo: string
          updated_at: string
          validade_dias: number
          valor_subtotal: number
          valor_total: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id: string
          contrato_id?: string | null
          convertido_contrato?: boolean | null
          created_at?: string
          created_by: string
          data_expiracao?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento: string
          observacoes?: string | null
          patient_id: string
          rejeitado_em?: string | null
          rejeitado_por?: string | null
          status?: string
          tipo_plano?: string
          titulo: string
          updated_at?: string
          validade_dias?: number
          valor_subtotal?: number
          valor_total?: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id?: string
          contrato_id?: string | null
          convertido_contrato?: boolean | null
          created_at?: string
          created_by?: string
          data_expiracao?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento?: string
          observacoes?: string | null
          patient_id?: string
          rejeitado_em?: string | null
          rejeitado_por?: string | null
          status?: string
          tipo_plano?: string
          titulo?: string
          updated_at?: string
          validade_dias?: number
          valor_subtotal?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_incidentes: {
        Row: {
          boletim_ocorrencia: string | null
          clinic_id: string
          created_at: string | null
          data_incidente: string
          descricao: string | null
          dia_semana: number
          horario_incidente: string
          id: string
          metadata: Json | null
          tipo_incidente: string
          valor_caixa_momento: number | null
          valor_perdido: number | null
        }
        Insert: {
          boletim_ocorrencia?: string | null
          clinic_id: string
          created_at?: string | null
          data_incidente: string
          descricao?: string | null
          dia_semana: number
          horario_incidente: string
          id?: string
          metadata?: Json | null
          tipo_incidente: string
          valor_caixa_momento?: number | null
          valor_perdido?: number | null
        }
        Update: {
          boletim_ocorrencia?: string | null
          clinic_id?: string
          created_at?: string | null
          data_incidente?: string
          descricao?: string | null
          dia_semana?: number
          horario_incidente?: string
          id?: string
          metadata?: Json | null
          tipo_incidente?: string
          valor_caixa_momento?: number | null
          valor_perdido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_incidentes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_movimentos: {
        Row: {
          aberto_em: string | null
          caixa_id: string | null
          clinic_id: string
          created_at: string | null
          created_by: string
          diferenca: number | null
          fechado_em: string | null
          horario_risco: string | null
          id: string
          motivo_sangria: string | null
          observacoes: string | null
          risco_calculado: number | null
          status: string
          sugerido_por_ia: boolean | null
          tipo: string
          valor: number
          valor_esperado: number | null
          valor_final: number | null
          valor_inicial: number | null
        }
        Insert: {
          aberto_em?: string | null
          caixa_id?: string | null
          clinic_id: string
          created_at?: string | null
          created_by: string
          diferenca?: number | null
          fechado_em?: string | null
          horario_risco?: string | null
          id?: string
          motivo_sangria?: string | null
          observacoes?: string | null
          risco_calculado?: number | null
          status?: string
          sugerido_por_ia?: boolean | null
          tipo: string
          valor: number
          valor_esperado?: number | null
          valor_final?: number | null
          valor_inicial?: number | null
        }
        Update: {
          aberto_em?: string | null
          caixa_id?: string | null
          clinic_id?: string
          created_at?: string | null
          created_by?: string
          diferenca?: number | null
          fechado_em?: string | null
          horario_risco?: string | null
          id?: string
          motivo_sangria?: string | null
          observacoes?: string | null
          risco_calculado?: number | null
          status?: string
          sugerido_por_ia?: boolean | null
          tipo?: string
          valor?: number
          valor_esperado?: number | null
          valor_final?: number | null
          valor_inicial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_movimentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_metrics: {
        Row: {
          bounce_rate: number | null
          campaign_id: string
          click_rate: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          metric_date: string
          open_rate: number | null
          revenue_generated: number | null
          total_clicked: number | null
          total_converted: number | null
          total_delivered: number | null
          total_errors: number | null
          total_opened: number | null
          total_sent: number | null
          unsubscribe_count: number | null
          updated_at: string
        }
        Insert: {
          bounce_rate?: number | null
          campaign_id: string
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          metric_date: string
          open_rate?: number | null
          revenue_generated?: number | null
          total_clicked?: number | null
          total_converted?: number | null
          total_delivered?: number | null
          total_errors?: number | null
          total_opened?: number | null
          total_sent?: number | null
          unsubscribe_count?: number | null
          updated_at?: string
        }
        Update: {
          bounce_rate?: number | null
          campaign_id?: string
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          open_rate?: number | null
          revenue_generated?: number | null
          total_clicked?: number | null
          total_converted?: number | null
          total_delivered?: number | null
          total_errors?: number | null
          total_opened?: number | null
          total_sent?: number | null
          unsubscribe_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sends: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          converted_at: string | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          message_content: string | null
          metadata: Json | null
          opened_at: string | null
          patient_id: string
          recipient_contact: string
          recipient_name: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          opened_at?: string | null
          patient_id: string
          recipient_contact: string
          recipient_name: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          opened_at?: string | null
          patient_id?: string
          recipient_contact?: string
          recipient_name?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          category: string | null
          clinic_id: string
          content: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          clinic_id: string
          content: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          clinic_id?: string
          content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_triggers: {
        Row: {
          campaign_id: string
          created_at: string
          delay_days: number | null
          delay_hours: number | null
          id: string
          is_active: boolean
          trigger_condition: Json
          trigger_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean
          trigger_condition: Json
          trigger_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean
          trigger_condition?: Json
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_triggers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campanha_envios: {
        Row: {
          aberto_em: string | null
          campanha_id: string
          clicado_em: string | null
          convertido_em: string | null
          created_at: string
          destinatario_id: string
          destinatario_tipo: string
          email: string | null
          enviado_em: string | null
          erro_mensagem: string | null
          id: string
          status_envio: string
          telefone: string | null
        }
        Insert: {
          aberto_em?: string | null
          campanha_id: string
          clicado_em?: string | null
          convertido_em?: string | null
          created_at?: string
          destinatario_id: string
          destinatario_tipo: string
          email?: string | null
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          status_envio?: string
          telefone?: string | null
        }
        Update: {
          aberto_em?: string | null
          campanha_id?: string
          clicado_em?: string | null
          convertido_em?: string | null
          created_at?: string
          destinatario_id?: string
          destinatario_tipo?: string
          email?: string | null
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          status_envio?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanha_envios_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas_marketing"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas_marketing: {
        Row: {
          clinic_id: string
          conteudo_template: string
          created_at: string
          created_by: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          nome: string
          segmento_alvo: Json | null
          status: string
          taxa_abertura: number | null
          taxa_clique: number | null
          taxa_conversao: number | null
          tipo: string
          total_aberturas: number | null
          total_cliques: number | null
          total_conversoes: number | null
          total_destinatarios: number | null
          total_enviados: number | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          conteudo_template: string
          created_at?: string
          created_by: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome: string
          segmento_alvo?: Json | null
          status?: string
          taxa_abertura?: number | null
          taxa_clique?: number | null
          taxa_conversao?: number | null
          tipo: string
          total_aberturas?: number | null
          total_cliques?: number | null
          total_conversoes?: number | null
          total_destinatarios?: number | null
          total_enviados?: number | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          conteudo_template?: string
          created_at?: string
          created_by?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome?: string
          segmento_alvo?: Json | null
          status?: string
          taxa_abertura?: number | null
          taxa_clique?: number | null
          taxa_conversao?: number | null
          tipo?: string
          total_aberturas?: number | null
          total_cliques?: number | null
          total_conversoes?: number | null
          total_destinatarios?: number | null
          total_enviados?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_marketing_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_modules: {
        Row: {
          clinic_id: string
          id: number
          is_active: boolean
          module_catalog_id: number
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          id?: number
          is_active?: boolean
          module_catalog_id: number
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          id?: number
          is_active?: boolean
          module_catalog_id?: number
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_modules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_modules_module_catalog_id_fkey"
            columns: ["module_catalog_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          auto_cleanup_enabled: boolean | null
          backup_retention_days: number | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          auto_cleanup_enabled?: boolean | null
          backup_retention_days?: number | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          auto_cleanup_enabled?: boolean | null
          backup_retention_days?: number | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_storage_configs: {
        Row: {
          clinic_id: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          provider: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          config: Json
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_storage_configs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_actions: {
        Row: {
          action_date: string
          action_type: string
          created_at: string
          created_by: string
          id: string
          message_content: string | null
          overdue_account_id: string
          response_received: string | null
          scheduled_for: string | null
          status: string
        }
        Insert: {
          action_date?: string
          action_type: string
          created_at?: string
          created_by: string
          id?: string
          message_content?: string | null
          overdue_account_id: string
          response_received?: string | null
          scheduled_for?: string | null
          status?: string
        }
        Update: {
          action_date?: string
          action_type?: string
          created_at?: string
          created_by?: string
          id?: string
          message_content?: string | null
          overdue_account_id?: string
          response_received?: string | null
          scheduled_for?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_actions_overdue_account_id_fkey"
            columns: ["overdue_account_id"]
            isOneToOne: false
            referencedRelation: "overdue_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_automation_config: {
        Row: {
          action_type: string
          clinic_id: string
          created_at: string
          created_by: string
          days_trigger: number
          id: string
          is_active: boolean
          message_template: string
          updated_at: string
        }
        Insert: {
          action_type: string
          clinic_id: string
          created_at?: string
          created_by: string
          days_trigger: number
          id?: string
          is_active?: boolean
          message_template: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          days_trigger?: number
          id?: string
          is_active?: boolean
          message_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_automation_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          anexo_url: string | null
          categoria: string
          clinic_id: string
          created_at: string
          created_by: string | null
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          fornecedor: string
          id: string
          observacoes: string | null
          parcela_numero: number | null
          parcela_total: number | null
          periodicidade: string | null
          recorrente: boolean | null
          status: string
          updated_at: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          anexo_url?: string | null
          categoria: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          fornecedor: string
          id?: string
          observacoes?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          periodicidade?: string | null
          recorrente?: boolean | null
          status?: string
          updated_at?: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          anexo_url?: string | null
          categoria?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          fornecedor?: string
          id?: string
          observacoes?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          periodicidade?: string | null
          recorrente?: boolean | null
          status?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          parcela_numero: number | null
          parcela_total: number | null
          patient_id: string | null
          status: string
          updated_at: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          patient_id?: string | null
          status?: string
          updated_at?: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          patient_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_anexos: {
        Row: {
          caminho_storage: string
          contrato_id: string
          created_at: string
          id: string
          mime_type: string
          nome_arquivo: string
          tamanho_bytes: number
          uploaded_by: string
        }
        Insert: {
          caminho_storage: string
          contrato_id: string
          created_at?: string
          id?: string
          mime_type: string
          nome_arquivo: string
          tamanho_bytes: number
          uploaded_by: string
        }
        Update: {
          caminho_storage?: string
          contrato_id?: string
          created_at?: string
          id?: string
          mime_type?: string
          nome_arquivo?: string
          tamanho_bytes?: number
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "contrato_anexos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_templates: {
        Row: {
          ativo: boolean
          clinic_id: string
          conteudo_html: string
          created_at: string
          created_by: string
          id: string
          nome: string
          tipo_tratamento: string
          updated_at: string
          variaveis_disponiveis: Json | null
        }
        Insert: {
          ativo?: boolean
          clinic_id: string
          conteudo_html: string
          created_at?: string
          created_by: string
          id?: string
          nome: string
          tipo_tratamento: string
          updated_at?: string
          variaveis_disponiveis?: Json | null
        }
        Update: {
          ativo?: boolean
          clinic_id?: string
          conteudo_html?: string
          created_at?: string
          created_by?: string
          id?: string
          nome?: string
          tipo_tratamento?: string
          updated_at?: string
          variaveis_disponiveis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          assinado_em: string | null
          assinatura_dentista_base64: string | null
          assinatura_paciente_base64: string | null
          cancelado_em: string | null
          clinic_id: string
          conteudo_html: string
          created_at: string
          created_by: string
          data_inicio: string
          data_termino: string | null
          hash_blockchain: string | null
          id: string
          ip_assinatura: string | null
          motivo_cancelamento: string | null
          numero_contrato: string
          orcamento_id: string | null
          patient_id: string
          renovacao_automatica: boolean | null
          status: string
          template_id: string | null
          titulo: string
          updated_at: string
          valor_contrato: number
        }
        Insert: {
          assinado_em?: string | null
          assinatura_dentista_base64?: string | null
          assinatura_paciente_base64?: string | null
          cancelado_em?: string | null
          clinic_id: string
          conteudo_html: string
          created_at?: string
          created_by: string
          data_inicio: string
          data_termino?: string | null
          hash_blockchain?: string | null
          id?: string
          ip_assinatura?: string | null
          motivo_cancelamento?: string | null
          numero_contrato: string
          orcamento_id?: string | null
          patient_id: string
          renovacao_automatica?: boolean | null
          status?: string
          template_id?: string | null
          titulo: string
          updated_at?: string
          valor_contrato: number
        }
        Update: {
          assinado_em?: string | null
          assinatura_dentista_base64?: string | null
          assinatura_paciente_base64?: string | null
          cancelado_em?: string | null
          clinic_id?: string
          conteudo_html?: string
          created_at?: string
          created_by?: string
          data_inicio?: string
          data_termino?: string | null
          hash_blockchain?: string | null
          id?: string
          ip_assinatura?: string | null
          motivo_cancelamento?: string | null
          numero_contrato?: string
          orcamento_id?: string | null
          patient_id?: string
          renovacao_automatica?: boolean | null
          status?: string
          template_id?: string | null
          titulo?: string
          updated_at?: string
          valor_contrato?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contrato_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_type: string
          assigned_to: string
          clinic_id: string
          completed_date: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string
          outcome: string | null
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          assigned_to: string
          clinic_id: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          outcome?: string | null
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          assigned_to?: string
          clinic_id?: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          outcome?: string | null
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_conversions: {
        Row: {
          assigned_to: string | null
          clinic_id: string
          conversion_type: string
          conversion_value: number | null
          converted_at: string
          created_at: string
          id: string
          lead_id: string
          time_to_convert_days: number | null
          total_interactions: number | null
        }
        Insert: {
          assigned_to?: string | null
          clinic_id: string
          conversion_type: string
          conversion_value?: number | null
          converted_at?: string
          created_at?: string
          id?: string
          lead_id: string
          time_to_convert_days?: number | null
          total_interactions?: number | null
        }
        Update: {
          assigned_to?: string | null
          clinic_id?: string
          conversion_type?: string
          conversion_value?: number | null
          converted_at?: string
          created_at?: string
          id?: string
          lead_id?: string
          time_to_convert_days?: number | null
          total_interactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_conversions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          attachments: Json | null
          clinic_id: string
          created_at: string
          created_by: string
          description: string
          duration_minutes: number | null
          id: string
          interaction_type: string
          lead_id: string
          next_action: string | null
          next_action_date: string | null
          outcome: string | null
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          clinic_id: string
          created_at?: string
          created_by: string
          description: string
          duration_minutes?: number | null
          id?: string
          interaction_type: string
          lead_id: string
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          interaction_type?: string
          lead_id?: string
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          clinic_id: string
          created_at: string
          created_by: string
          email: string | null
          estimated_value: number | null
          id: string
          interest_description: string | null
          name: string
          next_contact_date: string | null
          notes: string | null
          phone: string | null
          source: string
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          clinic_id: string
          created_at?: string
          created_by: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          interest_description?: string | null
          name: string
          next_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          source: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          interest_description?: string | null
          name?: string
          next_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_stages: {
        Row: {
          average_time_days: number | null
          clinic_id: string
          color: string | null
          conversion_rate: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          average_time_days?: number | null
          clinic_id: string
          color?: string | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index: number
          updated_at?: string
        }
        Update: {
          average_time_days?: number | null
          clinic_id?: string
          color?: string | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_stages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_candlestick_data: {
        Row: {
          close_price: number
          close_time: string
          coin_type: string
          created_at: string
          high_price: number
          id: string
          interval: string
          low_price: number
          open_price: number
          open_time: string
          volume: number
        }
        Insert: {
          close_price: number
          close_time: string
          coin_type: string
          created_at?: string
          high_price: number
          id?: string
          interval: string
          low_price: number
          open_price: number
          open_time: string
          volume?: number
        }
        Update: {
          close_price?: number
          close_time?: string
          coin_type?: string
          created_at?: string
          high_price?: number
          id?: string
          interval?: string
          low_price?: number
          open_price?: number
          open_time?: string
          volume?: number
        }
        Relationships: []
      }
      crypto_payments: {
        Row: {
          amount_brl: number
          checkout_link: string | null
          clinic_id: string
          confirmations: number | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          crypto_amount: number | null
          crypto_currency: string | null
          currency: string
          expires_at: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          order_id: string
          qr_code_data: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_brl: number
          checkout_link?: string | null
          clinic_id: string
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crypto_amount?: number | null
          crypto_currency?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          order_id: string
          qr_code_data?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_brl?: number
          checkout_link?: string | null
          clinic_id?: string
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crypto_amount?: number | null
          crypto_currency?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          order_id?: string
          qr_code_data?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_price_alerts: {
        Row: {
          alert_type: string
          auto_convert_on_trigger: boolean | null
          cascade_enabled: boolean | null
          cascade_group_id: string | null
          cascade_order: number | null
          clinic_id: string
          coin_type: string
          conversion_percentage: number | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          notification_method: string[]
          stop_loss_enabled: boolean | null
          target_rate_brl: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          auto_convert_on_trigger?: boolean | null
          cascade_enabled?: boolean | null
          cascade_group_id?: string | null
          cascade_order?: number | null
          clinic_id: string
          coin_type: string
          conversion_percentage?: number | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_method?: string[]
          stop_loss_enabled?: boolean | null
          target_rate_brl: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          auto_convert_on_trigger?: boolean | null
          cascade_enabled?: boolean | null
          cascade_group_id?: string | null
          cascade_order?: number | null
          clinic_id?: string
          coin_type?: string
          conversion_percentage?: number | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_method?: string[]
          stop_loss_enabled?: boolean | null
          target_rate_brl?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_price_alerts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_schedules: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          day_of_week: number
          dentist_id: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          day_of_week: number
          dentist_id: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          day_of_week?: number
          dentist_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_schedules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_pedidos: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          data_pedido: string
          data_prevista_entrega: string | null
          data_recebimento: string | null
          fornecedor_id: string
          gerado_automaticamente: boolean | null
          id: string
          numero_pedido: string
          observacoes: string | null
          status: string
          tipo: string
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          data_pedido?: string
          data_prevista_entrega?: string | null
          data_recebimento?: string | null
          fornecedor_id: string
          gerado_automaticamente?: boolean | null
          id?: string
          numero_pedido: string
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          data_pedido?: string
          data_prevista_entrega?: string | null
          data_recebimento?: string | null
          fornecedor_id?: string
          gerado_automaticamente?: boolean | null
          id?: string
          numero_pedido?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_pedidos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_pedidos_config: {
        Row: {
          clinic_id: string
          created_at: string
          dias_entrega_estimados: number | null
          gerar_automaticamente: boolean | null
          id: string
          ponto_pedido: number
          produto_id: string
          quantidade_reposicao: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          dias_entrega_estimados?: number | null
          gerar_automaticamente?: boolean | null
          id?: string
          ponto_pedido: number
          produto_id: string
          quantidade_reposicao: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          dias_entrega_estimados?: number | null
          gerar_automaticamente?: boolean | null
          id?: string
          ponto_pedido?: number
          produto_id?: string
          quantidade_reposicao?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_pedidos_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_pedidos_itens: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          quantidade_recebida: number | null
          valor_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          quantidade_recebida?: number | null
          valor_total: number
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          quantidade_recebida?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_pedidos_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "estoque_pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      fechamento_caixa: {
        Row: {
          arquivo_sped_gerado_em: string | null
          arquivo_sped_path: string | null
          caixa_movimento_id: string
          clinic_id: string
          created_at: string | null
          created_by: string
          data_fechamento: string
          divergencia: number
          id: string
          observacoes: string | null
          percentual_divergencia: number | null
          quantidade_nfce: number
          quantidade_vendas_pdv: number
          total_nfce_emitidas: number
          total_sangrias: number
          total_suprimentos: number
          total_vendas_pdv: number
          vendas_sem_nfce: number
        }
        Insert: {
          arquivo_sped_gerado_em?: string | null
          arquivo_sped_path?: string | null
          caixa_movimento_id: string
          clinic_id: string
          created_at?: string | null
          created_by: string
          data_fechamento: string
          divergencia?: number
          id?: string
          observacoes?: string | null
          percentual_divergencia?: number | null
          quantidade_nfce?: number
          quantidade_vendas_pdv?: number
          total_nfce_emitidas?: number
          total_sangrias?: number
          total_suprimentos?: number
          total_vendas_pdv?: number
          vendas_sem_nfce?: number
        }
        Update: {
          arquivo_sped_gerado_em?: string | null
          arquivo_sped_path?: string | null
          caixa_movimento_id?: string
          clinic_id?: string
          created_at?: string | null
          created_by?: string
          data_fechamento?: string
          divergencia?: number
          id?: string
          observacoes?: string | null
          percentual_divergencia?: number | null
          quantidade_nfce?: number
          quantidade_vendas_pdv?: number
          total_nfce_emitidas?: number
          total_sangrias?: number
          total_suprimentos?: number
          total_vendas_pdv?: number
          vendas_sem_nfce?: number
        }
        Relationships: [
          {
            foreignKeyName: "fechamento_caixa_caixa_movimento_id_fkey"
            columns: ["caixa_movimento_id"]
            isOneToOne: false
            referencedRelation: "caixa_movimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fechamento_caixa_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          active: boolean | null
          clinic_id: string
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          clinic_id: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          clinic_id?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          clinic_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string
          tags: string[] | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          tags?: string[] | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          tags?: string[] | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_config: {
        Row: {
          ambiente: string
          certificado_digital: string | null
          clinic_id: string
          cnpj: string
          codigo_regime_tributario: number | null
          contingencia_enabled: boolean | null
          contingencia_motivo: string | null
          created_at: string | null
          csc_id: string | null
          csc_token: string | null
          email_contabilidade: string | null
          endereco: Json | null
          id: string
          inscricao_estadual: string | null
          is_active: boolean | null
          nome_fantasia: string | null
          numero_ultimo_nfce: number | null
          razao_social: string
          regime_tributario: string
          senha_certificado: string | null
          serie_nfce: number | null
          tipo_emissao: string
          updated_at: string | null
        }
        Insert: {
          ambiente?: string
          certificado_digital?: string | null
          clinic_id: string
          cnpj: string
          codigo_regime_tributario?: number | null
          contingencia_enabled?: boolean | null
          contingencia_motivo?: string | null
          created_at?: string | null
          csc_id?: string | null
          csc_token?: string | null
          email_contabilidade?: string | null
          endereco?: Json | null
          id?: string
          inscricao_estadual?: string | null
          is_active?: boolean | null
          nome_fantasia?: string | null
          numero_ultimo_nfce?: number | null
          razao_social: string
          regime_tributario?: string
          senha_certificado?: string | null
          serie_nfce?: number | null
          tipo_emissao?: string
          updated_at?: string | null
        }
        Update: {
          ambiente?: string
          certificado_digital?: string | null
          clinic_id?: string
          cnpj?: string
          codigo_regime_tributario?: number | null
          contingencia_enabled?: boolean | null
          contingencia_motivo?: string | null
          created_at?: string | null
          csc_id?: string | null
          csc_token?: string | null
          email_contabilidade?: string | null
          endereco?: Json | null
          id?: string
          inscricao_estadual?: string | null
          is_active?: boolean | null
          nome_fantasia?: string | null
          numero_ultimo_nfce?: number | null
          razao_social?: string
          regime_tributario?: string
          senha_certificado?: string | null
          serie_nfce?: number | null
          tipo_emissao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_clinico: {
        Row: {
          created_at: string
          created_by: string
          dados_estruturados: Json | null
          descricao: string
          id: string
          prontuario_id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          dados_estruturados?: Json | null
          descricao: string
          id?: string
          prontuario_id: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          dados_estruturados?: Json | null
          descricao?: string
          id?: string
          prontuario_id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_clinico_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      integracao_contabil_config: {
        Row: {
          api_key: string | null
          api_secret: string | null
          api_url: string
          ativo: boolean
          clinic_id: string
          codigo_empresa: string | null
          created_at: string
          email_contador: string | null
          enviar_nfce_dados: boolean
          enviar_sped_fiscal: boolean
          envio_automatico: boolean
          id: string
          metadata: Json | null
          periodicidade_envio: string
          software: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          api_url: string
          ativo?: boolean
          clinic_id: string
          codigo_empresa?: string | null
          created_at?: string
          email_contador?: string | null
          enviar_nfce_dados?: boolean
          enviar_sped_fiscal?: boolean
          envio_automatico?: boolean
          id?: string
          metadata?: Json | null
          periodicidade_envio?: string
          software: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          api_url?: string
          ativo?: boolean
          clinic_id?: string
          codigo_empresa?: string | null
          created_at?: string
          email_contador?: string | null
          enviar_nfce_dados?: boolean
          enviar_sped_fiscal?: boolean
          envio_automatico?: boolean
          id?: string
          metadata?: Json | null
          periodicidade_envio?: string
          software?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integracao_contabil_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      integracao_contabil_envios: {
        Row: {
          arquivo_path: string | null
          arquivo_size_bytes: number | null
          clinic_id: string
          config_id: string
          created_at: string
          enviado_em: string | null
          erro_mensagem: string | null
          id: string
          max_tentativas: number
          periodo_referencia: string
          response_data: Json | null
          status: string
          tentativas: number
          tipo_documento: string
          updated_at: string
        }
        Insert: {
          arquivo_path?: string | null
          arquivo_size_bytes?: number | null
          clinic_id: string
          config_id: string
          created_at?: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          max_tentativas?: number
          periodo_referencia: string
          response_data?: Json | null
          status?: string
          tentativas?: number
          tipo_documento: string
          updated_at?: string
        }
        Update: {
          arquivo_path?: string | null
          arquivo_size_bytes?: number | null
          clinic_id?: string
          config_id?: string
          created_at?: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          max_tentativas?: number
          periodo_referencia?: string
          response_data?: Json | null
          status?: string
          tentativas?: number
          tipo_documento?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integracao_contabil_envios_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integracao_contabil_envios_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "integracao_contabil_config"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_agendamentos: {
        Row: {
          ativo: boolean
          categorias_ids: string[] | null
          clinic_id: string
          created_at: string
          created_by: string
          dia_execucao: number | null
          dia_semana: number | null
          id: string
          nome: string
          notificar_dias_antes: number | null
          notificar_responsavel: boolean | null
          observacoes: string | null
          periodicidade: string
          proxima_execucao: string | null
          responsavel: string
          tipo_inventario: string
          ultima_execucao: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categorias_ids?: string[] | null
          clinic_id: string
          created_at?: string
          created_by: string
          dia_execucao?: number | null
          dia_semana?: number | null
          id?: string
          nome: string
          notificar_dias_antes?: number | null
          notificar_responsavel?: boolean | null
          observacoes?: string | null
          periodicidade: string
          proxima_execucao?: string | null
          responsavel: string
          tipo_inventario: string
          ultima_execucao?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categorias_ids?: string[] | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          dia_execucao?: number | null
          dia_semana?: number | null
          id?: string
          nome?: string
          notificar_dias_antes?: number | null
          notificar_responsavel?: boolean | null
          observacoes?: string | null
          periodicidade?: string
          proxima_execucao?: string | null
          responsavel?: string
          tipo_inventario?: string
          ultima_execucao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_agendamentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_itens: {
        Row: {
          contado_em: string | null
          contado_por: string | null
          created_at: string
          divergencia: number | null
          id: string
          inventario_id: string
          lote: string | null
          observacoes: string | null
          percentual_divergencia: number | null
          produto_id: string
          produto_nome: string
          quantidade_fisica: number | null
          quantidade_sistema: number
          valor_divergencia: number | null
          valor_unitario: number
        }
        Insert: {
          contado_em?: string | null
          contado_por?: string | null
          created_at?: string
          divergencia?: number | null
          id?: string
          inventario_id: string
          lote?: string | null
          observacoes?: string | null
          percentual_divergencia?: number | null
          produto_id: string
          produto_nome: string
          quantidade_fisica?: number | null
          quantidade_sistema: number
          valor_divergencia?: number | null
          valor_unitario: number
        }
        Update: {
          contado_em?: string | null
          contado_por?: string | null
          created_at?: string
          divergencia?: number | null
          id?: string
          inventario_id?: string
          lote?: string | null
          observacoes?: string | null
          percentual_divergencia?: number | null
          produto_id?: string
          produto_nome?: string
          quantidade_fisica?: number | null
          quantidade_sistema?: number
          valor_divergencia?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventario_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "inventarios"
            referencedColumns: ["id"]
          },
        ]
      }
      inventarios: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          data: string
          divergencias_encontradas: number | null
          id: string
          itens_contados: number | null
          numero: string
          observacoes: string | null
          responsavel: string
          status: string
          tipo: string
          total_itens: number | null
          updated_at: string
          valor_divergencias: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          data: string
          divergencias_encontradas?: number | null
          id?: string
          itens_contados?: number | null
          numero: string
          observacoes?: string | null
          responsavel: string
          status?: string
          tipo: string
          total_itens?: number | null
          updated_at?: string
          valor_divergencias?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          data?: string
          divergencias_encontradas?: number | null
          id?: string
          itens_contados?: number | null
          numero?: string
          observacoes?: string | null
          responsavel?: string
          status?: string
          tipo?: string
          total_itens?: number | null
          updated_at?: string
          valor_divergencias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventarios_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interacoes: {
        Row: {
          agendou_avaliacao: boolean | null
          created_at: string
          created_by: string
          descricao: string
          id: string
          lead_id: string
          proximo_passo: string | null
          resultado: string | null
          tipo: string
        }
        Insert: {
          agendou_avaliacao?: boolean | null
          created_at?: string
          created_by: string
          descricao: string
          id?: string
          lead_id: string
          proximo_passo?: string | null
          resultado?: string | null
          tipo: string
        }
        Update: {
          agendou_avaliacao?: boolean | null
          created_at?: string
          created_by?: string
          descricao?: string
          id?: string
          lead_id?: string
          proximo_passo?: string | null
          resultado?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          atribuido_a: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          interesse: string | null
          motivo_perda: string | null
          nome: string
          observacoes: string | null
          origem: string
          proximo_followup: string | null
          score_qualidade: number | null
          status_funil: string
          telefone: string | null
          temperatura: string
          ultimo_contato: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          valor_estimado: number | null
          whatsapp: string | null
        }
        Insert: {
          atribuido_a?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          interesse?: string | null
          motivo_perda?: string | null
          nome: string
          observacoes?: string | null
          origem: string
          proximo_followup?: string | null
          score_qualidade?: number | null
          status_funil?: string
          telefone?: string | null
          temperatura?: string
          ultimo_contato?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_estimado?: number | null
          whatsapp?: string | null
        }
        Update: {
          atribuido_a?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          interesse?: string | null
          motivo_perda?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string
          proximo_followup?: string | null
          score_qualidade?: number | null
          status_funil?: string
          telefone?: string | null
          temperatura?: string
          ultimo_contato?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_estimado?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          accepted_by: string | null
          clinic_id: string
          consent_text: string
          consent_type: string
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          patient_id: string
          revoked: boolean | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
          user_agent: string | null
          version: number
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          accepted_by?: string | null
          clinic_id: string
          consent_text: string
          consent_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          patient_id: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          user_agent?: string | null
          version?: number
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          accepted_by?: string | null
          clinic_id?: string
          consent_text?: string
          consent_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          patient_id?: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          user_agent?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_consents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_data_exports: {
        Row: {
          clinic_id: string
          created_at: string
          download_count: number | null
          downloaded_at: string | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          file_format: string | null
          file_path: string | null
          file_size_bytes: number | null
          generated_at: string | null
          generated_by: string
          id: string
          metadata: Json | null
          patient_id: string
          request_id: string | null
          status: string
          tables_included: string[] | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          download_count?: number | null
          downloaded_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          generated_by: string
          id?: string
          metadata?: Json | null
          patient_id: string
          request_id?: string | null
          status?: string
          tables_included?: string[] | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          download_count?: number | null
          downloaded_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          metadata?: Json | null
          patient_id?: string
          request_id?: string | null
          status?: string
          tables_included?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_data_exports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lgpd_data_exports_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lgpd_data_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_data_requests: {
        Row: {
          clinic_id: string
          completed_at: string | null
          created_at: string
          data_export_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          patient_id: string
          rejection_reason: string | null
          request_type: string
          requested_at: string
          requested_by: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          data_export_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          rejection_reason?: string | null
          request_type: string
          requested_at?: string
          requested_by: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          data_export_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          rejection_reason?: string | null
          request_type?: string
          requested_at?: string
          requested_by?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_data_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          device_fingerprint: string | null
          email: string
          id: number
          ip_address: string | null
          ip_geolocation: Json | null
          session_duration_seconds: number | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          device_fingerprint?: string | null
          email: string
          id?: number
          ip_address?: string | null
          ip_geolocation?: Json | null
          session_duration_seconds?: number | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          device_fingerprint?: string | null
          email?: string
          id?: number
          ip_address?: string | null
          ip_geolocation?: Json | null
          session_duration_seconds?: number | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          campaign_type: string
          channel: string
          clinic_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          last_sent_at: string | null
          metadata: Json | null
          name: string
          schedule_config: Json | null
          send_immediately: boolean | null
          start_date: string | null
          status: string
          target_audience: Json | null
          template_id: string | null
          trigger_config: Json | null
          updated_at: string
        }
        Insert: {
          campaign_type: string
          channel: string
          clinic_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          name: string
          schedule_config?: Json | null
          send_immediately?: boolean | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          template_id?: string | null
          trigger_config?: Json | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          channel?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          name?: string
          schedule_config?: Json | null
          send_immediately?: boolean | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          template_id?: string | null
          trigger_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      module_catalog: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: number
          module_key: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          module_key: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          module_key?: string
          name?: string
        }
        Relationships: []
      }
      module_configuration_templates: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          modules: Json
          name: string
          specialty: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          modules: Json
          name: string
          specialty: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          modules?: Json
          name?: string
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_dependencies: {
        Row: {
          created_at: string
          depends_on_module_id: number
          id: number
          module_id: number
        }
        Insert: {
          created_at?: string
          depends_on_module_id: number
          id?: number
          module_id: number
        }
        Update: {
          created_at?: string
          depends_on_module_id?: number
          id?: number
          module_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_dependencies_depends_on_module_id_fkey"
            columns: ["depends_on_module_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_dependencies_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          motivo: string | null
          observacoes: string | null
          produto_id: string
          quantidade: number
          quantidade_anterior: number
          quantidade_atual: number
          tipo: string
          usuario_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          produto_id: string
          quantidade: number
          quantidade_anterior: number
          quantidade_atual: number
          tipo: string
          usuario_id: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_anterior?: number
          quantidade_atual?: number
          tipo?: string
          usuario_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      nfce_carta_correcao: {
        Row: {
          clinic_id: string
          codigo_status: string | null
          correcao: string
          created_at: string | null
          created_by: string
          data_evento: string | null
          id: string
          motivo: string | null
          nfce_id: string
          protocolo: string | null
          sequencia: number
          status: string
          xml_evento: string | null
        }
        Insert: {
          clinic_id: string
          codigo_status?: string | null
          correcao: string
          created_at?: string | null
          created_by: string
          data_evento?: string | null
          id?: string
          motivo?: string | null
          nfce_id: string
          protocolo?: string | null
          sequencia?: number
          status?: string
          xml_evento?: string | null
        }
        Update: {
          clinic_id?: string
          codigo_status?: string | null
          correcao?: string
          created_at?: string | null
          created_by?: string
          data_evento?: string | null
          id?: string
          motivo?: string | null
          nfce_id?: string
          protocolo?: string | null
          sequencia?: number
          status?: string
          xml_evento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfce_carta_correcao_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfce_carta_correcao_nfce_id_fkey"
            columns: ["nfce_id"]
            isOneToOne: false
            referencedRelation: "nfce_emitidas"
            referencedColumns: ["id"]
          },
        ]
      }
      nfce_contingencia: {
        Row: {
          chave_acesso: string
          clinic_id: string
          created_at: string
          emitido_em: string
          erro_sincronizacao: string | null
          forma_pagamento: string
          id: string
          itens: Json
          modo_contingencia: string
          motivo_contingencia: string
          numero_nfce: number
          protocolo_autorizacao: string | null
          serie: number
          sincronizado_em: string | null
          status_sincronizacao: string
          tentativas_sincronizacao: number
          updated_at: string
          valor_total: number
          venda_id: string | null
          xml_nfce: string
        }
        Insert: {
          chave_acesso: string
          clinic_id: string
          created_at?: string
          emitido_em?: string
          erro_sincronizacao?: string | null
          forma_pagamento: string
          id?: string
          itens: Json
          modo_contingencia?: string
          motivo_contingencia: string
          numero_nfce: number
          protocolo_autorizacao?: string | null
          serie: number
          sincronizado_em?: string | null
          status_sincronizacao?: string
          tentativas_sincronizacao?: number
          updated_at?: string
          valor_total: number
          venda_id?: string | null
          xml_nfce: string
        }
        Update: {
          chave_acesso?: string
          clinic_id?: string
          created_at?: string
          emitido_em?: string
          erro_sincronizacao?: string | null
          forma_pagamento?: string
          id?: string
          itens?: Json
          modo_contingencia?: string
          motivo_contingencia?: string
          numero_nfce?: number
          protocolo_autorizacao?: string | null
          serie?: number
          sincronizado_em?: string | null
          status_sincronizacao?: string
          tentativas_sincronizacao?: number
          updated_at?: string
          valor_total?: number
          venda_id?: string | null
          xml_nfce?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfce_contingencia_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfce_contingencia_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "pdv_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      nfce_emitidas: {
        Row: {
          ambiente: string
          chave_acesso: string
          clinic_id: string
          contingencia: boolean | null
          created_at: string | null
          data_cancelamento: string | null
          data_emissao: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          motivo_cancelamento: string | null
          numero_nfce: number
          pdf_url: string | null
          protocolo_autorizacao: string | null
          qrcode_url: string | null
          serie: number
          status: string
          tipo_emissao: string
          updated_at: string | null
          valor_total: number
          venda_id: string
          xml_cancelamento: string | null
          xml_nfce: string | null
        }
        Insert: {
          ambiente: string
          chave_acesso: string
          clinic_id: string
          contingencia?: boolean | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_emissao?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          motivo_cancelamento?: string | null
          numero_nfce: number
          pdf_url?: string | null
          protocolo_autorizacao?: string | null
          qrcode_url?: string | null
          serie: number
          status?: string
          tipo_emissao: string
          updated_at?: string | null
          valor_total: number
          venda_id: string
          xml_cancelamento?: string | null
          xml_nfce?: string | null
        }
        Update: {
          ambiente?: string
          chave_acesso?: string
          clinic_id?: string
          contingencia?: boolean | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_emissao?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          motivo_cancelamento?: string | null
          numero_nfce?: number
          pdf_url?: string | null
          protocolo_autorizacao?: string | null
          qrcode_url?: string | null
          serie?: number
          status?: string
          tipo_emissao?: string
          updated_at?: string | null
          valor_total?: number
          venda_id?: string
          xml_cancelamento?: string | null
          xml_nfce?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfce_emitidas_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      nfce_inutilizacao: {
        Row: {
          ano: number
          clinic_id: string
          codigo_status: string | null
          created_at: string | null
          created_by: string
          data_inutilizacao: string | null
          id: string
          justificativa: string
          motivo: string | null
          numero_final: number
          numero_inicial: number
          protocolo: string | null
          serie: number
          status: string
          xml_inutilizacao: string | null
        }
        Insert: {
          ano: number
          clinic_id: string
          codigo_status?: string | null
          created_at?: string | null
          created_by: string
          data_inutilizacao?: string | null
          id?: string
          justificativa: string
          motivo?: string | null
          numero_final: number
          numero_inicial: number
          protocolo?: string | null
          serie: number
          status?: string
          xml_inutilizacao?: string | null
        }
        Update: {
          ano?: number
          clinic_id?: string
          codigo_status?: string | null
          created_at?: string | null
          created_by?: string
          data_inutilizacao?: string | null
          id?: string
          justificativa?: string
          motivo?: string | null
          numero_final?: number
          numero_inicial?: number
          protocolo?: string | null
          serie?: number
          status?: string
          xml_inutilizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfce_inutilizacao_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          chave_acesso: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          data_emissao: string
          data_recebimento: string | null
          destinatario_cnpj: string | null
          destinatario_nome: string | null
          emitente_cnpj: string
          emitente_nome: string
          id: string
          numero: string
          observacoes: string | null
          pdf_url: string | null
          serie: string | null
          status: string
          tipo: string
          updated_at: string
          valor_icms: number | null
          valor_iss: number | null
          valor_total: number
          xml_url: string | null
        }
        Insert: {
          chave_acesso?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          data_emissao: string
          data_recebimento?: string | null
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          emitente_cnpj: string
          emitente_nome: string
          id?: string
          numero: string
          observacoes?: string | null
          pdf_url?: string | null
          serie?: string | null
          status?: string
          tipo: string
          updated_at?: string
          valor_icms?: number | null
          valor_iss?: number | null
          valor_total: number
          xml_url?: string | null
        }
        Update: {
          chave_acesso?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          data_recebimento?: string | null
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          emitente_cnpj?: string
          emitente_nome?: string
          id?: string
          numero?: string
          observacoes?: string | null
          pdf_url?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_icms?: number | null
          valor_iss?: number | null
          valor_total?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          lida: boolean
          lida_em: string | null
          link_acao: string | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          link_acao?: string | null
          mensagem: string
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          link_acao?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      odontogramas: {
        Row: {
          clinic_id: string
          created_at: string
          history: Json
          id: string
          last_updated: string
          prontuario_id: string
          teeth: Json
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          history?: Json
          id?: string
          last_updated?: string
          prontuario_id: string
          teeth?: Json
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          history?: Json
          id?: string
          last_updated?: string
          prontuario_id?: string
          teeth?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "odontogramas_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogramas_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: true
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_analytics: {
        Row: {
          clinic_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          step_name: string | null
          step_number: number | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          step_name?: string | null
          step_number?: number | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          step_name?: string | null
          step_number?: number | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_analytics_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          created_at: string
          dente_codigo: string | null
          descricao: string
          id: string
          observacoes: string | null
          orcamento_id: string
          ordem: number
          procedimento_id: string | null
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          dente_codigo?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          orcamento_id: string
          ordem?: number
          procedimento_id?: string | null
          quantidade?: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          dente_codigo?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          orcamento_id?: string
          ordem?: number
          procedimento_id?: string | null
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_pagamento: {
        Row: {
          created_at: string
          forma_pagamento: string[] | null
          id: string
          numero_parcelas: number | null
          observacoes: string | null
          orcamento_id: string
          tipo_pagamento: string
          valor_entrada: number | null
          valor_parcela: number | null
        }
        Insert: {
          created_at?: string
          forma_pagamento?: string[] | null
          id?: string
          numero_parcelas?: number | null
          observacoes?: string | null
          orcamento_id: string
          tipo_pagamento: string
          valor_entrada?: number | null
          valor_parcela?: number | null
        }
        Update: {
          created_at?: string
          forma_pagamento?: string[] | null
          id?: string
          numero_parcelas?: number | null
          observacoes?: string | null
          orcamento_id?: string
          tipo_pagamento?: string
          valor_entrada?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_pagamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_visualizacoes: {
        Row: {
          duracao_segundos: number | null
          id: string
          ip_address: string | null
          orcamento_id: string
          user_agent: string | null
          visualizado_em: string
        }
        Insert: {
          duracao_segundos?: number | null
          id?: string
          ip_address?: string | null
          orcamento_id: string
          user_agent?: string | null
          visualizado_em?: string
        }
        Update: {
          duracao_segundos?: number | null
          id?: string
          ip_address?: string | null
          orcamento_id?: string
          user_agent?: string | null
          visualizado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_visualizacoes_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          clinic_id: string
          convertido_em: string | null
          created_at: string
          created_by: string
          data_validade: string
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string | null
          id: string
          motivo_rejeicao: string | null
          numero_orcamento: string
          observacoes: string | null
          patient_id: string
          prontuario_id: string | null
          rejeitado_em: string | null
          status: string
          tipo_plano: string
          titulo: string
          updated_at: string
          validade_dias: number
          valor_final: number
          valor_total: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id: string
          convertido_em?: string | null
          created_at?: string
          created_by: string
          data_validade: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento: string
          observacoes?: string | null
          patient_id: string
          prontuario_id?: string | null
          rejeitado_em?: string | null
          status?: string
          tipo_plano: string
          titulo: string
          updated_at?: string
          validade_dias?: number
          valor_final?: number
          valor_total?: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id?: string
          convertido_em?: string | null
          created_at?: string
          created_by?: string
          data_validade?: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento?: string
          observacoes?: string | null
          patient_id?: string
          prontuario_id?: string | null
          rejeitado_em?: string | null
          status?: string
          tipo_plano?: string
          titulo?: string
          updated_at?: string
          validade_dias?: number
          valor_final?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_accounts: {
        Row: {
          clinic_id: string
          conta_receber_id: string
          created_at: string
          days_overdue: number
          id: string
          interest_amount: number | null
          original_amount: number
          patient_id: string
          penalty_amount: number | null
          remaining_amount: number
          risk_level: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          conta_receber_id: string
          created_at?: string
          days_overdue: number
          id?: string
          interest_amount?: number | null
          original_amount: number
          patient_id: string
          penalty_amount?: number | null
          remaining_amount: number
          risk_level?: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          conta_receber_id?: string
          created_at?: string
          days_overdue?: number
          id?: string
          interest_amount?: number | null
          original_amount?: number
          patient_id?: string
          penalty_amount?: number | null
          remaining_amount?: number
          risk_level?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overdue_accounts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_accounts_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_accounts: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          email_verificado: boolean
          id: string
          patient_id: string
          senha_hash: string
          token_verificacao: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          email_verificado?: boolean
          id?: string
          patient_id: string
          senha_hash: string
          token_verificacao?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          email_verificado?: boolean
          id?: string
          patient_id?: string
          senha_hash?: string
          token_verificacao?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_messages: {
        Row: {
          anexos: Json | null
          clinic_id: string
          created_at: string
          id: string
          lida: boolean
          lida_em: string | null
          mensagem: string
          patient_id: string
          remetente_id: string
          remetente_tipo: string
        }
        Insert: {
          anexos?: Json | null
          clinic_id: string
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          mensagem: string
          patient_id: string
          remetente_id: string
          remetente_tipo: string
        }
        Update: {
          anexos?: Json | null
          clinic_id?: string
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          mensagem?: string
          patient_id?: string
          remetente_id?: string
          remetente_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_messages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notifications: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          lida_em: string | null
          link_acao: string | null
          mensagem: string
          patient_id: string
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          link_acao?: string | null
          mensagem: string
          patient_id: string
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          lida_em?: string | null
          link_acao?: string | null
          mensagem?: string
          patient_id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      patient_preferences: {
        Row: {
          id: string
          idioma: string | null
          lembrete_consulta_horas: number | null
          notificacoes_email: boolean | null
          notificacoes_push: boolean | null
          notificacoes_sms: boolean | null
          notificacoes_whatsapp: boolean | null
          patient_id: string
          tema: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          idioma?: string | null
          lembrete_consulta_horas?: number | null
          notificacoes_email?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sms?: boolean | null
          notificacoes_whatsapp?: boolean | null
          patient_id: string
          tema?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          idioma?: string | null
          lembrete_consulta_horas?: number | null
          notificacoes_email?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sms?: boolean | null
          notificacoes_whatsapp?: boolean | null
          patient_id?: string
          tema?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          patient_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          patient_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          patient_id?: string
          token?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_country: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          alcohol_frequency: string | null
          allergies_list: string[] | null
          birth_date: string
          bleeding_disorder_details: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_type: string | null
          bmi: number | null
          cardiovascular_details: string | null
          clinic_id: string
          clinical_observations: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          current_medications: string[] | null
          data_sharing_consent: boolean | null
          diabetes_controlled: boolean | null
          diabetes_type: string | null
          education_level: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_relationship: string | null
          first_appointment_date: string | null
          full_name: string
          gender: string | null
          gum_condition: string | null
          has_alcohol_habit: boolean | null
          has_allergies: boolean | null
          has_bleeding_disorder: boolean | null
          has_cardiovascular_disease: boolean | null
          has_diabetes: boolean | null
          has_hepatitis: boolean | null
          has_hiv: boolean | null
          has_hypertension: boolean | null
          has_medication_allergy: boolean | null
          has_smoking_habit: boolean | null
          has_systemic_disease: boolean | null
          heart_rate: number | null
          height_cm: number | null
          hepatitis_type: string | null
          hypertension_controlled: boolean | null
          id: string
          image_usage_consent: boolean | null
          is_breastfeeding: boolean | null
          is_pregnant: boolean | null
          last_appointment_date: string | null
          lgpd_consent: boolean | null
          lgpd_consent_date: string | null
          main_complaint: string | null
          marital_status: string | null
          medication_allergies: string[] | null
          nationality: string | null
          occupation: string | null
          oral_hygiene_quality: string | null
          pain_level: number | null
          patient_code: string | null
          payment_status: string | null
          phone_emergency: string | null
          phone_primary: string
          phone_secondary: string | null
          preferred_payment_method: string | null
          pregnancy_trimester: number | null
          rg: string | null
          risk_level: string | null
          risk_score_anesthetic: number | null
          risk_score_medical: number | null
          risk_score_overall: number | null
          risk_score_surgical: number | null
          smoking_frequency: string | null
          social_name: string | null
          status: string | null
          systemic_diseases: string[] | null
          total_appointments: number | null
          total_debt: number | null
          total_paid: number | null
          treatment_consent: boolean | null
          updated_at: string
          updated_by: string | null
          weight_kg: number | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          alcohol_frequency?: string | null
          allergies_list?: string[] | null
          birth_date: string
          bleeding_disorder_details?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_type?: string | null
          bmi?: number | null
          cardiovascular_details?: string | null
          clinic_id: string
          clinical_observations?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          current_medications?: string[] | null
          data_sharing_consent?: boolean | null
          diabetes_controlled?: boolean | null
          diabetes_type?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          first_appointment_date?: string | null
          full_name: string
          gender?: string | null
          gum_condition?: string | null
          has_alcohol_habit?: boolean | null
          has_allergies?: boolean | null
          has_bleeding_disorder?: boolean | null
          has_cardiovascular_disease?: boolean | null
          has_diabetes?: boolean | null
          has_hepatitis?: boolean | null
          has_hiv?: boolean | null
          has_hypertension?: boolean | null
          has_medication_allergy?: boolean | null
          has_smoking_habit?: boolean | null
          has_systemic_disease?: boolean | null
          heart_rate?: number | null
          height_cm?: number | null
          hepatitis_type?: string | null
          hypertension_controlled?: boolean | null
          id?: string
          image_usage_consent?: boolean | null
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          last_appointment_date?: string | null
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          main_complaint?: string | null
          marital_status?: string | null
          medication_allergies?: string[] | null
          nationality?: string | null
          occupation?: string | null
          oral_hygiene_quality?: string | null
          pain_level?: number | null
          patient_code?: string | null
          payment_status?: string | null
          phone_emergency?: string | null
          phone_primary: string
          phone_secondary?: string | null
          preferred_payment_method?: string | null
          pregnancy_trimester?: number | null
          rg?: string | null
          risk_level?: string | null
          risk_score_anesthetic?: number | null
          risk_score_medical?: number | null
          risk_score_overall?: number | null
          risk_score_surgical?: number | null
          smoking_frequency?: string | null
          social_name?: string | null
          status?: string | null
          systemic_diseases?: string[] | null
          total_appointments?: number | null
          total_debt?: number | null
          total_paid?: number | null
          treatment_consent?: boolean | null
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          alcohol_frequency?: string | null
          allergies_list?: string[] | null
          birth_date?: string
          bleeding_disorder_details?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_type?: string | null
          bmi?: number | null
          cardiovascular_details?: string | null
          clinic_id?: string
          clinical_observations?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          current_medications?: string[] | null
          data_sharing_consent?: boolean | null
          diabetes_controlled?: boolean | null
          diabetes_type?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          first_appointment_date?: string | null
          full_name?: string
          gender?: string | null
          gum_condition?: string | null
          has_alcohol_habit?: boolean | null
          has_allergies?: boolean | null
          has_bleeding_disorder?: boolean | null
          has_cardiovascular_disease?: boolean | null
          has_diabetes?: boolean | null
          has_hepatitis?: boolean | null
          has_hiv?: boolean | null
          has_hypertension?: boolean | null
          has_medication_allergy?: boolean | null
          has_smoking_habit?: boolean | null
          has_systemic_disease?: boolean | null
          heart_rate?: number | null
          height_cm?: number | null
          hepatitis_type?: string | null
          hypertension_controlled?: boolean | null
          id?: string
          image_usage_consent?: boolean | null
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          last_appointment_date?: string | null
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          main_complaint?: string | null
          marital_status?: string | null
          medication_allergies?: string[] | null
          nationality?: string | null
          occupation?: string | null
          oral_hygiene_quality?: string | null
          pain_level?: number | null
          patient_code?: string | null
          payment_status?: string | null
          phone_emergency?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          preferred_payment_method?: string | null
          pregnancy_trimester?: number | null
          rg?: string | null
          risk_level?: string | null
          risk_score_anesthetic?: number | null
          risk_score_medical?: number | null
          risk_score_overall?: number | null
          risk_score_surgical?: number | null
          smoking_frequency?: string | null
          social_name?: string | null
          status?: string | null
          systemic_diseases?: string[] | null
          total_appointments?: number | null
          total_debt?: number | null
          total_paid?: number | null
          treatment_consent?: boolean | null
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          active: boolean | null
          clinic_id: string
          config: Json | null
          created_at: string
          id: string
          name: string
          taxa_fixa: number | null
          taxa_percentual: number | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          clinic_id: string
          config?: Json | null
          created_at?: string
          id?: string
          name: string
          taxa_fixa?: number | null
          taxa_percentual?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          clinic_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          taxa_fixa?: number | null
          taxa_percentual?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_negotiations: {
        Row: {
          accepted_at: string | null
          clinic_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          discount_amount: number | null
          discount_percentage: number | null
          first_payment_date: string | null
          id: string
          installments: number | null
          negotiated_amount: number
          original_amount: number
          overdue_account_id: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          discount_amount?: number | null
          discount_percentage?: number | null
          first_payment_date?: string | null
          id?: string
          installments?: number | null
          negotiated_amount: number
          original_amount: number
          overdue_account_id: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          first_payment_date?: string | null
          id?: string
          installments?: number | null
          negotiated_amount?: number
          original_amount?: number
          overdue_account_id?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_negotiations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_negotiations_overdue_account_id_fkey"
            columns: ["overdue_account_id"]
            isOneToOne: false
            referencedRelation: "overdue_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_produtos: {
        Row: {
          cest: string | null
          cfop: string | null
          clinic_id: string
          codigo: string
          cofins_aliquota: number | null
          controla_estoque: boolean | null
          created_at: string | null
          cst_cofins: string | null
          cst_icms: string | null
          cst_pis: string | null
          descricao: string
          estoque_atual: number | null
          estoque_minimo: number | null
          icms_aliquota: number | null
          id: string
          is_active: boolean | null
          ncm: string | null
          origem_mercadoria: number | null
          pis_aliquota: number | null
          tipo: string
          unidade_medida: string | null
          updated_at: string | null
          valor_unitario: number
        }
        Insert: {
          cest?: string | null
          cfop?: string | null
          clinic_id: string
          codigo: string
          cofins_aliquota?: number | null
          controla_estoque?: boolean | null
          created_at?: string | null
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_pis?: string | null
          descricao: string
          estoque_atual?: number | null
          estoque_minimo?: number | null
          icms_aliquota?: number | null
          id?: string
          is_active?: boolean | null
          ncm?: string | null
          origem_mercadoria?: number | null
          pis_aliquota?: number | null
          tipo?: string
          unidade_medida?: string | null
          updated_at?: string | null
          valor_unitario: number
        }
        Update: {
          cest?: string | null
          cfop?: string | null
          clinic_id?: string
          codigo?: string
          cofins_aliquota?: number | null
          controla_estoque?: boolean | null
          created_at?: string | null
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_pis?: string | null
          descricao?: string
          estoque_atual?: number | null
          estoque_minimo?: number | null
          icms_aliquota?: number | null
          id?: string
          is_active?: boolean | null
          ncm?: string | null
          origem_mercadoria?: number | null
          pis_aliquota?: number | null
          tipo?: string
          unidade_medida?: string | null
          updated_at?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdv_produtos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_vendas: {
        Row: {
          caixa_movimento_id: string | null
          clinic_id: string
          created_at: string
          forma_pagamento: string
          id: string
          metadata: Json | null
          numero_venda: string
          observacoes: string | null
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          caixa_movimento_id?: string | null
          clinic_id: string
          created_at?: string
          forma_pagamento: string
          id?: string
          metadata?: Json | null
          numero_venda: string
          observacoes?: string | null
          status: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          caixa_movimento_id?: string | null
          clinic_id?: string
          created_at?: string
          forma_pagamento?: string
          id?: string
          metadata?: Json | null
          numero_venda?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdv_vendas_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_anexos: {
        Row: {
          caminho_storage: string
          created_at: string
          descricao: string | null
          historico_id: string | null
          id: string
          mime_type: string
          nome_arquivo: string
          prontuario_id: string
          tamanho_bytes: number
          tipo_arquivo: string
          uploaded_by: string
        }
        Insert: {
          caminho_storage: string
          created_at?: string
          descricao?: string | null
          historico_id?: string | null
          id?: string
          mime_type: string
          nome_arquivo: string
          prontuario_id: string
          tamanho_bytes: number
          tipo_arquivo: string
          uploaded_by: string
        }
        Update: {
          caminho_storage?: string
          created_at?: string
          descricao?: string | null
          historico_id?: string | null
          id?: string
          mime_type?: string
          nome_arquivo?: string
          prontuario_id?: string
          tamanho_bytes?: number
          tipo_arquivo?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pep_anexos_historico_id_fkey"
            columns: ["historico_id"]
            isOneToOne: false
            referencedRelation: "historico_clinico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pep_anexos_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_assinaturas: {
        Row: {
          assinatura_base64: string
          historico_id: string | null
          id: string
          ip_address: string | null
          prontuario_id: string
          signed_at: string
          signed_by: string
          tipo_documento: string
          user_agent: string | null
        }
        Insert: {
          assinatura_base64: string
          historico_id?: string | null
          id?: string
          ip_address?: string | null
          prontuario_id: string
          signed_at?: string
          signed_by: string
          tipo_documento: string
          user_agent?: string | null
        }
        Update: {
          assinatura_base64?: string
          historico_id?: string | null
          id?: string
          ip_address?: string | null
          prontuario_id?: string
          signed_at?: string
          signed_by?: string
          tipo_documento?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pep_assinaturas_historico_id_fkey"
            columns: ["historico_id"]
            isOneToOne: false
            referencedRelation: "historico_clinico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pep_assinaturas_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_evolucoes: {
        Row: {
          created_at: string
          created_by: string
          data_evolucao: string
          descricao: string
          id: string
          tipo: string
          tratamento_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data_evolucao?: string
          descricao: string
          id?: string
          tipo: string
          tratamento_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data_evolucao?: string
          descricao?: string
          id?: string
          tipo?: string
          tratamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pep_evolucoes_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "pep_tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_odontograma: {
        Row: {
          created_at: string
          created_by: string
          dente_codigo: string
          faces_afetadas: string[] | null
          id: string
          observacoes: string | null
          prontuario_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          dente_codigo: string
          faces_afetadas?: string[] | null
          id?: string
          observacoes?: string | null
          prontuario_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          dente_codigo?: string
          faces_afetadas?: string[] | null
          id?: string
          observacoes?: string | null
          prontuario_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pep_odontograma_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_odontograma_data: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          prontuario_id: string
          status: string
          tooth_number: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          prontuario_id: string
          status?: string
          tooth_number: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          prontuario_id?: string
          status?: string
          tooth_number?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pep_odontograma_data_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_odontograma_history: {
        Row: {
          changed_teeth: number[]
          created_at: string
          created_by: string
          description: string | null
          id: string
          prontuario_id: string
          snapshot_data: Json
        }
        Insert: {
          changed_teeth?: number[]
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          prontuario_id: string
          snapshot_data: Json
        }
        Update: {
          changed_teeth?: number[]
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          prontuario_id?: string
          snapshot_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pep_odontograma_history_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_tooth_surfaces: {
        Row: {
          created_at: string
          id: string
          odontograma_data_id: string
          status: string
          surface: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          odontograma_data_id: string
          status?: string
          surface: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          odontograma_data_id?: string
          status?: string
          surface?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pep_tooth_surfaces_odontograma_data_id_fkey"
            columns: ["odontograma_data_id"]
            isOneToOne: false
            referencedRelation: "pep_odontograma_data"
            referencedColumns: ["id"]
          },
        ]
      }
      pep_tratamentos: {
        Row: {
          created_at: string
          created_by: string
          data_conclusao: string | null
          data_inicio: string
          dente_codigo: string | null
          descricao: string
          id: string
          observacoes: string | null
          procedimento_id: string | null
          prontuario_id: string
          status: string
          titulo: string
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          data_conclusao?: string | null
          data_inicio: string
          dente_codigo?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          procedimento_id?: string | null
          prontuario_id: string
          status?: string
          titulo: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          data_conclusao?: string | null
          data_inicio?: string
          dente_codigo?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          procedimento_id?: string | null
          prontuario_id?: string
          status?: string
          titulo?: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pep_tratamentos_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_logs: {
        Row: {
          action: string
          clinic_id: string
          created_at: string
          details: Json | null
          id: string
          module_catalog_id: number | null
          target_user_id: string
          template_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          clinic_id: string
          created_at?: string
          details?: Json | null
          id?: string
          module_catalog_id?: number | null
          target_user_id: string
          template_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          clinic_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          module_catalog_id?: number | null
          target_user_id?: string
          template_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_audit_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_audit_logs_module_catalog_id_fkey"
            columns: ["module_catalog_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_templates: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          module_keys: string[]
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          module_keys: string[]
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          module_keys?: string[]
          name?: string
        }
        Relationships: []
      }
      prescricoes_remotas: {
        Row: {
          assinatura_digital: string | null
          created_at: string
          descricao: string
          enviado_em: string | null
          enviado_para_paciente: boolean | null
          id: string
          instrucoes: string | null
          medicamento_dosagem: string | null
          medicamento_duracao: string | null
          medicamento_frequencia: string | null
          medicamento_nome: string | null
          teleconsulta_id: string
          tipo: string
        }
        Insert: {
          assinatura_digital?: string | null
          created_at?: string
          descricao: string
          enviado_em?: string | null
          enviado_para_paciente?: boolean | null
          id?: string
          instrucoes?: string | null
          medicamento_dosagem?: string | null
          medicamento_duracao?: string | null
          medicamento_frequencia?: string | null
          medicamento_nome?: string | null
          teleconsulta_id: string
          tipo: string
        }
        Update: {
          assinatura_digital?: string | null
          created_at?: string
          descricao?: string
          enviado_em?: string | null
          enviado_para_paciente?: boolean | null
          id?: string
          instrucoes?: string | null
          medicamento_dosagem?: string | null
          medicamento_duracao?: string | null
          medicamento_frequencia?: string | null
          medicamento_nome?: string | null
          teleconsulta_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_remotas_teleconsulta_id_fkey"
            columns: ["teleconsulta_id"]
            isOneToOne: false
            referencedRelation: "teleconsultas"
            referencedColumns: ["id"]
          },
        ]
      }
      problemas_radiograficos: {
        Row: {
          analise_id: string
          confianca: number | null
          created_at: string
          dente_codigo: string | null
          descricao: string | null
          id: string
          localizacao: string | null
          severidade: string
          sugestao_tratamento: string | null
          tipo_problema: string
          urgente: boolean | null
        }
        Insert: {
          analise_id: string
          confianca?: number | null
          created_at?: string
          dente_codigo?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          severidade: string
          sugestao_tratamento?: string | null
          tipo_problema: string
          urgente?: boolean | null
        }
        Update: {
          analise_id?: string
          confianca?: number | null
          created_at?: string
          dente_codigo?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          severidade?: string
          sugestao_tratamento?: string | null
          tipo_problema?: string
          urgente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "problemas_radiograficos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_radiograficas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: string
          clinic_id: string
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          fornecedor: string | null
          id: string
          localizacao: string | null
          nome: string
          observacoes: string | null
          quantidade_atual: number
          quantidade_minima: number
          unidade_medida: string
          updated_at: string
          valor_unitario: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          clinic_id: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          observacoes?: string | null
          quantidade_atual?: number
          quantidade_minima?: number
          unidade_medida: string
          updated_at?: string
          valor_unitario?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          clinic_id?: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          observacoes?: string | null
          quantidade_atual?: number
          quantidade_minima?: number
          unidade_medida?: string
          updated_at?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_role: string
          avatar_url: string | null
          clinic_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          app_role?: string
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          app_role?: string
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          id: string
          patient_id: string
          patient_name: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          id?: string
          patient_id: string
          patient_name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          id?: string
          patient_id?: string
          patient_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      radiografia_ai_feedback: {
        Row: {
          analise_id: string
          anotacoes_dentista: Json | null
          clinic_id: string
          created_at: string
          created_by: string
          diagnostico_correto: string | null
          falsos_negativos: Json | null
          falsos_positivos: Json | null
          ia_estava_correta: boolean
          id: string
          imagem_marcada_url: string | null
          usado_para_treino: boolean | null
        }
        Insert: {
          analise_id: string
          anotacoes_dentista?: Json | null
          clinic_id: string
          created_at?: string
          created_by: string
          diagnostico_correto?: string | null
          falsos_negativos?: Json | null
          falsos_positivos?: Json | null
          ia_estava_correta: boolean
          id?: string
          imagem_marcada_url?: string | null
          usado_para_treino?: boolean | null
        }
        Update: {
          analise_id?: string
          anotacoes_dentista?: Json | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          diagnostico_correto?: string | null
          falsos_negativos?: Json | null
          falsos_positivos?: Json | null
          ia_estava_correta?: boolean
          id?: string
          imagem_marcada_url?: string | null
          usado_para_treino?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "radiografia_ai_feedback_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_radiograficas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radiografia_ai_feedback_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      radiografia_laudo_templates: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          id: string
          is_default: boolean | null
          nome_template: string
          template_markdown: string
          tipo_radiografia: string
          variaveis_disponiveis: Json | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          id?: string
          is_default?: boolean | null
          nome_template: string
          template_markdown: string
          tipo_radiografia: string
          variaveis_disponiveis?: Json | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean | null
          nome_template?: string
          template_markdown?: string
          tipo_radiografia?: string
          variaveis_disponiveis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "radiografia_laudo_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_config: {
        Row: {
          created_at: string
          enabled: boolean
          endpoint: string
          id: number
          max_requests_per_ip: number
          max_requests_per_user: number
          updated_at: string
          window_minutes: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          endpoint: string
          id?: number
          max_requests_per_ip?: number
          max_requests_per_user?: number
          updated_at?: string
          window_minutes?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          endpoint?: string
          id?: number
          max_requests_per_ip?: number
          max_requests_per_user?: number
          updated_at?: string
          window_minutes?: number
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string
          endpoint: string
          id: number
          ip_address: unknown
          request_count: number | null
          updated_at: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: number
          ip_address: unknown
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: number
          ip_address?: unknown
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      room_availability: {
        Row: {
          capacity: number
          clinic_id: string
          created_at: string
          created_by: string
          equipment: Json | null
          id: string
          is_active: boolean
          room_name: string
          room_number: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          clinic_id: string
          created_at?: string
          created_by: string
          equipment?: Json | null
          id?: string
          is_active?: boolean
          room_name: string
          room_number?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          clinic_id?: string
          created_at?: string
          created_by?: string
          equipment?: Json | null
          id?: string
          is_active?: boolean
          room_name?: string
          room_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      root_actions_log: {
        Row: {
          action: string
          details: Json | null
          executed_at: string
          id: number
          ip_address: unknown
          root_user_id: string
          target_record_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          executed_at?: string
          id?: number
          ip_address?: unknown
          root_user_id: string
          target_record_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          executed_at?: string
          id?: number
          ip_address?: unknown
          root_user_id?: string
          target_record_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      sat_mfe_config: {
        Row: {
          ativo: boolean
          clinic_id: string
          codigo_ativacao: string | null
          created_at: string
          fabricante: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          modelo: string | null
          numero_serie: string
          porta: number | null
          tipo_equipamento: string
          updated_at: string
          versao_software: string | null
        }
        Insert: {
          ativo?: boolean
          clinic_id: string
          codigo_ativacao?: string | null
          created_at?: string
          fabricante?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          modelo?: string | null
          numero_serie: string
          porta?: number | null
          tipo_equipamento: string
          updated_at?: string
          versao_software?: string | null
        }
        Update: {
          ativo?: boolean
          clinic_id?: string
          codigo_ativacao?: string | null
          created_at?: string
          fabricante?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          modelo?: string | null
          numero_serie?: string
          porta?: number | null
          tipo_equipamento?: string
          updated_at?: string
          versao_software?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sat_mfe_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      sat_mfe_impressoes: {
        Row: {
          chave_consulta: string | null
          clinic_id: string
          codigo_autorizacao: string | null
          config_id: string
          created_at: string
          id: string
          mensagem_retorno: string | null
          metadata: Json | null
          nfce_id: string | null
          numero_sessao: string | null
          status: string
          tentativas: number
          tipo_equipamento: string
          updated_at: string
          venda_id: string | null
          xml_enviado: string | null
          xml_retorno: string | null
        }
        Insert: {
          chave_consulta?: string | null
          clinic_id: string
          codigo_autorizacao?: string | null
          config_id: string
          created_at?: string
          id?: string
          mensagem_retorno?: string | null
          metadata?: Json | null
          nfce_id?: string | null
          numero_sessao?: string | null
          status: string
          tentativas?: number
          tipo_equipamento: string
          updated_at?: string
          venda_id?: string | null
          xml_enviado?: string | null
          xml_retorno?: string | null
        }
        Update: {
          chave_consulta?: string | null
          clinic_id?: string
          codigo_autorizacao?: string | null
          config_id?: string
          created_at?: string
          id?: string
          mensagem_retorno?: string | null
          metadata?: Json | null
          nfce_id?: string | null
          numero_sessao?: string | null
          status?: string
          tentativas?: number
          tipo_equipamento?: string
          updated_at?: string
          venda_id?: string | null
          xml_enviado?: string | null
          xml_retorno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sat_mfe_impressoes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sat_mfe_impressoes_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "sat_mfe_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sat_mfe_impressoes_nfce_id_fkey"
            columns: ["nfce_id"]
            isOneToOne: false
            referencedRelation: "nfce_emitidas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sat_mfe_impressoes_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "pdv_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_backups: {
        Row: {
          backup_type: string
          clinic_id: string
          compression_enabled: boolean
          created_at: string
          created_by: string
          day_of_month: number | null
          day_of_week: number | null
          encryption_enabled: boolean
          frequency: string
          id: string
          include_data: Json
          includes_postgres_dump: boolean | null
          is_active: boolean
          last_run_at: string | null
          local_path: string | null
          max_parallel_jobs: number | null
          name: string
          next_run_at: string
          notification_emails: string[] | null
          retention_policy_id: string | null
          storage_config: Json | null
          storage_destination: string | null
          time_of_day: string
          updated_at: string
        }
        Insert: {
          backup_type?: string
          clinic_id: string
          compression_enabled?: boolean
          created_at?: string
          created_by: string
          day_of_month?: number | null
          day_of_week?: number | null
          encryption_enabled?: boolean
          frequency: string
          id?: string
          include_data?: Json
          includes_postgres_dump?: boolean | null
          is_active?: boolean
          last_run_at?: string | null
          local_path?: string | null
          max_parallel_jobs?: number | null
          name: string
          next_run_at: string
          notification_emails?: string[] | null
          retention_policy_id?: string | null
          storage_config?: Json | null
          storage_destination?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          backup_type?: string
          clinic_id?: string
          compression_enabled?: boolean
          created_at?: string
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          encryption_enabled?: boolean
          frequency?: string
          id?: string
          include_data?: Json
          includes_postgres_dump?: boolean | null
          is_active?: boolean
          last_run_at?: string | null
          local_path?: string | null
          max_parallel_jobs?: number | null
          name?: string
          next_run_at?: string
          notification_emails?: string[] | null
          retention_policy_id?: string | null
          storage_config?: Json | null
          storage_destination?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_backups_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_backups_retention_policy_id_fkey"
            columns: ["retention_policy_id"]
            isOneToOne: false
            referencedRelation: "backup_retention_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_exports: {
        Row: {
          clinic_id: string
          created_at: string
          dashboard_name: string
          email: string
          export_format: string
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          next_send_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          dashboard_name: string
          email: string
          export_format: string
          frequency: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          dashboard_name?: string
          email?: string
          export_format?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_exports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          description: string
          id: number
          issue_type: string
          migration_version: string
          resolution: string
          resolved_at: string
          severity: string | null
        }
        Insert: {
          description: string
          id?: number
          issue_type: string
          migration_version: string
          resolution: string
          resolved_at?: string
          severity?: string | null
        }
        Update: {
          description?: string
          id?: number
          issue_type?: string
          migration_version?: string
          resolution?: string
          resolved_at?: string
          severity?: string | null
        }
        Relationships: []
      }
      split_payment_details: {
        Row: {
          created_at: string
          id: string
          net_amount: number
          paid_at: string | null
          recipient_id: string
          recipient_name: string
          recipient_type: string
          split_amount: number
          split_transaction_id: string
          status: string
          tax_withheld: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          net_amount: number
          paid_at?: string | null
          recipient_id: string
          recipient_name: string
          recipient_type: string
          split_amount: number
          split_transaction_id: string
          status?: string
          tax_withheld?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          net_amount?: number
          paid_at?: string | null
          recipient_id?: string
          recipient_name?: string
          recipient_type?: string
          split_amount?: number
          split_transaction_id?: string
          status?: string
          tax_withheld?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "split_payment_details_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "split_payment_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_payment_details_split_transaction_id_fkey"
            columns: ["split_transaction_id"]
            isOneToOne: false
            referencedRelation: "split_payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      split_payment_recipients: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          recipient_id: string | null
          recipient_name: string
          recipient_type: string
          rule_id: string
          split_fixed_amount: number | null
          split_percentage: number | null
          tax_rate: number | null
          tax_regime: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          recipient_id?: string | null
          recipient_name: string
          recipient_type: string
          rule_id: string
          split_fixed_amount?: number | null
          split_percentage?: number | null
          tax_rate?: number | null
          tax_regime?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          recipient_id?: string | null
          recipient_name?: string
          recipient_type?: string
          rule_id?: string
          split_fixed_amount?: number | null
          split_percentage?: number | null
          tax_rate?: number | null
          tax_regime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_payment_recipients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_payment_recipients_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "split_payment_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      split_payment_rules: {
        Row: {
          clinic_id: string
          conditions: Json
          created_at: string
          created_by: string
          id: string
          priority: number
          rule_name: string
          rule_type: string
          status: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          conditions?: Json
          created_at?: string
          created_by: string
          id?: string
          priority?: number
          rule_name: string
          rule_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          conditions?: Json
          created_at?: string
          created_by?: string
          id?: string
          priority?: number
          rule_name?: string
          rule_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_payment_rules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      split_payment_transactions: {
        Row: {
          clinic_id: string
          conta_receber_id: string | null
          created_at: string
          error_message: string | null
          id: string
          processed_at: string | null
          rule_id: string | null
          split_calculated_at: string
          status: string
          total_amount: number
          transaction_id: string | null
        }
        Insert: {
          clinic_id: string
          conta_receber_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          rule_id?: string | null
          split_calculated_at?: string
          status?: string
          total_amount: number
          transaction_id?: string | null
        }
        Update: {
          clinic_id?: string
          conta_receber_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          rule_id?: string | null
          split_calculated_at?: string
          status?: string
          total_amount?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_payment_transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_payment_transactions_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_payment_transactions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "split_payment_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_payment_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      teleconsultas: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          conduta: string | null
          created_at: string
          created_by: string
          data_agendada: string
          data_finalizada: string | null
          data_iniciada: string | null
          dentist_id: string
          diagnostico: string | null
          duracao_minutos: number | null
          id: string
          link_sala: string | null
          motivo: string
          observacoes: string | null
          patient_id: string
          recording_url: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          conduta?: string | null
          created_at?: string
          created_by: string
          data_agendada: string
          data_finalizada?: string | null
          data_iniciada?: string | null
          dentist_id: string
          diagnostico?: string | null
          duracao_minutos?: number | null
          id?: string
          link_sala?: string | null
          motivo: string
          observacoes?: string | null
          patient_id: string
          recording_url?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          conduta?: string | null
          created_at?: string
          created_by?: string
          data_agendada?: string
          data_finalizada?: string | null
          data_iniciada?: string | null
          dentist_id?: string
          diagnostico?: string | null
          duracao_minutos?: number | null
          id?: string
          link_sala?: string | null
          motivo?: string
          observacoes?: string | null
          patient_id?: string
          recording_url?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsultas_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      teleodonto_chat: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          id: string
          message_text: string
          message_type: string
          read_at: string | null
          sender_id: string
          sender_role: string
          sent_at: string
          session_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          id?: string
          message_text: string
          message_type?: string
          read_at?: string | null
          sender_id: string
          sender_role: string
          sent_at?: string
          session_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          id?: string
          message_text?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
          sender_role?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleodonto_chat_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleodonto_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teleodonto_files: {
        Row: {
          compartilhado_com_paciente: boolean | null
          descricao: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          file_url: string | null
          id: string
          session_id: string
          storage_path: string
          tipo_arquivo: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          compartilhado_com_paciente?: boolean | null
          descricao?: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          file_url?: string | null
          id?: string
          session_id: string
          storage_path: string
          tipo_arquivo: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          compartilhado_com_paciente?: boolean | null
          descricao?: string | null
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          file_url?: string | null
          id?: string
          session_id?: string
          storage_path?: string
          tipo_arquivo?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleodonto_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleodonto_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teleodonto_sessions: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          consentimento_assinado_em: string | null
          consentimento_gravacao: boolean | null
          created_at: string
          created_by: string
          dentist_id: string
          dentist_joined_at: string | null
          diagnostico_preliminar: string | null
          duracao_minutos: number | null
          ended_at: string | null
          id: string
          notas_pos_consulta: string | null
          notas_pre_consulta: string | null
          patient_id: string
          patient_joined_at: string | null
          platform: string
          prescricoes: Json | null
          problemas_tecnicos: string | null
          qualidade_audio: string | null
          qualidade_video: string | null
          recording_url: string | null
          room_id: string | null
          room_url: string | null
          scheduled_end: string
          scheduled_start: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          consentimento_assinado_em?: string | null
          consentimento_gravacao?: boolean | null
          created_at?: string
          created_by: string
          dentist_id: string
          dentist_joined_at?: string | null
          diagnostico_preliminar?: string | null
          duracao_minutos?: number | null
          ended_at?: string | null
          id?: string
          notas_pos_consulta?: string | null
          notas_pre_consulta?: string | null
          patient_id: string
          patient_joined_at?: string | null
          platform?: string
          prescricoes?: Json | null
          problemas_tecnicos?: string | null
          qualidade_audio?: string | null
          qualidade_video?: string | null
          recording_url?: string | null
          room_id?: string | null
          room_url?: string | null
          scheduled_end: string
          scheduled_start: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          consentimento_assinado_em?: string | null
          consentimento_gravacao?: boolean | null
          created_at?: string
          created_by?: string
          dentist_id?: string
          dentist_joined_at?: string | null
          diagnostico_preliminar?: string | null
          duracao_minutos?: number | null
          ended_at?: string | null
          id?: string
          notas_pos_consulta?: string | null
          notas_pre_consulta?: string | null
          patient_id?: string
          patient_joined_at?: string | null
          platform?: string
          prescricoes?: Json | null
          problemas_tecnicos?: string | null
          qualidade_audio?: string | null
          qualidade_video?: string | null
          recording_url?: string | null
          room_id?: string | null
          room_url?: string | null
          scheduled_end?: string
          scheduled_start?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleodonto_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleodonto_sessions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      triagem_teleconsulta: {
        Row: {
          alergias: string | null
          created_at: string
          fotos_anexas: Json | null
          id: string
          intensidade_dor: number | null
          medicamentos_uso: string | null
          sintomas: string[] | null
          teleconsulta_id: string
          tempo_sintoma: string | null
        }
        Insert: {
          alergias?: string | null
          created_at?: string
          fotos_anexas?: Json | null
          id?: string
          intensidade_dor?: number | null
          medicamentos_uso?: string | null
          sintomas?: string[] | null
          teleconsulta_id: string
          tempo_sintoma?: string | null
        }
        Update: {
          alergias?: string | null
          created_at?: string
          fotos_anexas?: Json | null
          id?: string
          intensidade_dor?: number | null
          medicamentos_uso?: string | null
          sintomas?: string[] | null
          teleconsulta_id?: string
          tempo_sintoma?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triagem_teleconsulta_teleconsulta_id_fkey"
            columns: ["teleconsulta_id"]
            isOneToOne: false
            referencedRelation: "teleconsultas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_clinic_access: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          is_default: boolean | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clinic_access_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_permissions: {
        Row: {
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module_catalog_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_catalog_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_catalog_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_permissions_module_catalog_id_fkey"
            columns: ["module_catalog_id"]
            isOneToOne: false
            referencedRelation: "module_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ai_accuracy_by_clinic: {
        Args: { p_clinic_id: string }
        Returns: {
          analises_corretas: number
          media_confidence: number
          taxa_acerto: number
          total_analises: number
        }[]
      }
      cleanup_bi_cache: { Args: never; Returns: number }
      cleanup_expired_patient_sessions: { Args: never; Returns: number }
      cleanup_old_backups: {
        Args: { p_clinic_id: string }
        Returns: {
          deleted_count: number
          freed_bytes: number
        }[]
      }
      cleanup_old_rate_limit_logs: { Args: never; Returns: number }
      create_default_admin_user: { Args: never; Returns: undefined }
      create_root_user: { Args: never; Returns: undefined }
      detect_suspicious_patterns: { Args: never; Returns: undefined }
      ensure_all_modules_active: { Args: never; Returns: undefined }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_root_user: { Args: never; Returns: boolean }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ADMIN" | "MEMBER" | "ROOT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["ADMIN", "MEMBER", "ROOT"],
    },
  },
} as const
