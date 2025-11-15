import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * FASE 1 - TASK 1.1: CREATE ROOT USER
 * 
 * Edge Function para criar usuários ROOT (superusuários)
 * 
 * SEGURANÇA CRÍTICA:
 * - Esta função DEVE ser chamada apenas com service_role key
 * - Usuários ROOT têm bypass completo de RLS
 * - Todas as ações são auditadas em root_actions_log
 * 
 * Uso:
 * POST /create-root-user
 * Headers: Authorization: Bearer <SERVICE_ROLE_KEY>
 * Body: { email: string, password: string, full_name?: string }
 */

interface CreateRootUserRequest {
  email: string;
  password: string;
  full_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[create-root-user] Iniciando criação de usuário ROOT');

    // ============================================================================
    // 1. VERIFICAR AUTENTICAÇÃO SERVICE_ROLE (SEGURANÇA CRÍTICA)
    // ============================================================================
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!authHeader || !authHeader.includes(serviceRoleKey!)) {
      console.error('[create-root-user] Tentativa de acesso não autorizada');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'Esta função requer service_role key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============================================================================
    // 2. VALIDAR INPUT
    // ============================================================================
    const { email, password, full_name }: CreateRootUserRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Email e password são obrigatórios' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Email inválido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar força da senha (mínimo 12 caracteres)
    if (password.length < 12) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Senha deve ter no mínimo 12 caracteres' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[create-root-user] Criando ROOT user: ${email}`);

    // ============================================================================
    // 3. CRIAR CLIENTE SUPABASE COM SERVICE_ROLE
    // ============================================================================
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // ============================================================================
    // 4. VERIFICAR SE USUÁRIO JÁ EXISTE
    // ============================================================================
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('[create-root-user] Erro ao verificar usuários existentes:', checkError);
      throw checkError;
    }

    const userExists = existingUser.users.some(u => u.email === email);
    if (userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'Conflict', 
          message: `Usuário com email ${email} já existe` 
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============================================================================
    // 5. CRIAR USUÁRIO NO AUTH.USERS
    // ============================================================================
    const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: { 
        full_name: full_name || 'Root User',
        app_role: 'ROOT' // Marcar como ROOT nos metadados
      }
    });

    if (signupError) {
      console.error('[create-root-user] Erro ao criar usuário:', signupError);
      throw signupError;
    }

    console.log(`[create-root-user] Usuário criado no auth.users: ${newUser.user.id}`);

    // ============================================================================
    // 6. CRIAR PROFILE COM ROLE ROOT
    // ============================================================================
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        app_role: 'ROOT',
        full_name: full_name || 'Root User',
        clinic_id: null, // ROOT não pertence a nenhuma clínica específica
        is_active: true
      });

    if (profileError) {
      console.error('[create-root-user] Erro ao criar profile:', profileError);
      
      // Rollback: deletar usuário do auth se profile falhar
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw profileError;
    }

    console.log('[create-root-user] Profile ROOT criado com sucesso');

    // ============================================================================
    // 7. REGISTRAR AÇÃO EM ROOT_ACTIONS_LOG
    // ============================================================================
    await supabase
      .from('root_actions_log')
      .insert({
        root_user_id: newUser.user.id,
        action: 'ROOT_USER_CREATED',
        details: {
          email,
          full_name: full_name || 'Root User',
          created_by: 'Edge Function: create-root-user',
          timestamp: new Date().toISOString()
        }
      });

    // ============================================================================
    // 8. REGISTRAR EM SECURITY_AUDIT_LOG
    // ============================================================================
    await supabase
      .from('security_audit_log')
      .insert({
        migration_version: '004',
        issue_type: 'ROOT_USER_CREATED',
        severity: 'HIGH',
        description: `Novo usuário ROOT criado: ${email}`,
        resolution: `Usuário ROOT ${email} criado com sucesso. ID: ${newUser.user.id}`
      });

    console.log('[create-root-user] ROOT user criado com sucesso. Todas as auditorias registradas.');

    // ============================================================================
    // 9. RETORNAR SUCESSO
    // ============================================================================
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário ROOT criado com sucesso',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: full_name || 'Root User',
          app_role: 'ROOT',
          created_at: newUser.user.created_at
        },
        warning: '⚠️  ATENÇÃO: Este usuário tem acesso TOTAL ao sistema (bypass de RLS). Use com responsabilidade.'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[create-root-user] Erro não tratado:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
