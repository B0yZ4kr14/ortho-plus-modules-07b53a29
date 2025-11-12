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
          clinic_id: string | null
          created_at: string
          details: Json | null
          id: number
          target_module_id: number | null
          user_id: string | null
        }
        Insert: {
          action: string
          clinic_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          target_module_id?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string
          clinic_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          target_module_id?: number | null
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
          clinic_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string | null
          file_size_bytes: number | null
          format: string | null
          id: string
          metadata: Json | null
          status: string
        }
        Insert: {
          backup_type: string
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          status?: string
        }
        Update: {
          backup_type?: string
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_clinic_id_fkey"
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
      profiles: {
        Row: {
          avatar_url: string | null
          clinic_id: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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
      cleanup_old_backups: {
        Args: { p_clinic_id: string }
        Returns: {
          deleted_count: number
          freed_bytes: number
        }[]
      }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ADMIN" | "MEMBER"
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
      app_role: ["ADMIN", "MEMBER"],
    },
  },
} as const
