/**
 * FASE 13: Autenticação de Pacientes (Isolada de auth.users)
 * Usa tabela patient_accounts com bcrypt
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';
import { corsHeaders, handleCorsPreflightRequest } from '../_shared/cors-headers.ts';
import { handleError, PraxeologicalError, ErrorSeverity } from '../_shared/praxeological-error-handler.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  const requestId = crypto.randomUUID();

  try {
    const { action, email, password, patientId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ==========================================
    // LOGIN
    // ==========================================
    if (action === 'login') {
      // 1. Buscar patient_account
      const { data: account, error } = await supabase
        .from('patient_accounts')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !account) {
        // Log failed attempt
        await supabase.from('login_attempts').insert({
          email,
          success: false,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
        });

        throw new PraxeologicalError(
          401,
          'INVALID_CREDENTIALS',
          'Email ou senha inválidos',
          ErrorSeverity.LOW,
          { email },
          'Email ou senha inválidos'
        );
      }

      // 2. Verificar senha (bcrypt)
      const isValidPassword = await bcrypt.compare(password, account.password_hash);

      if (!isValidPassword) {
        await supabase.from('login_attempts').insert({
          email,
          success: false,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
        });

        throw new PraxeologicalError(
          401,
          'INVALID_CREDENTIALS',
          'Email ou senha inválidos',
          ErrorSeverity.LOW,
          { email },
          'Email ou senha inválidos'
        );
      }

      // 3. Gerar JWT token
      const key = await crypto.subtle.generateKey(
        { name: 'HMAC', hash: 'SHA-256' },
        true,
        ['sign', 'verify']
      );

      const payload = {
        sub: account.patient_id,
        email: account.email,
        role: 'PATIENT',
        exp: getNumericDate(60 * 60 * 24),  // 24h
      };

      const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

      // 4. Criar sessão
      const sessionId = crypto.randomUUID();
      await supabase.from('patient_sessions').insert({
        id: sessionId,
        patient_id: account.patient_id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // 5. Log successful login
      await supabase.from('login_attempts').insert({
        email,
        success: true,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({
          token,
          sessionId,
          patient: {
            id: account.patient_id,
            email: account.email,
          },
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ==========================================
    // SIGNUP (Primeiro Acesso)
    // ==========================================
    if (action === 'signup') {
      // 1. Verificar se patient_id existe
      const { data: patient } = await supabase
        .from('patients')
        .select('id, email')
        .eq('id', patientId)
        .single();

      if (!patient) {
        throw new PraxeologicalError(
          404,
          'PATIENT_NOT_FOUND',
          'Paciente não encontrado',
          ErrorSeverity.LOW,
          { patientId },
          'Paciente não encontrado. Verifique se você está cadastrado na clínica.'
        );
      }

      // 2. Verificar se já tem conta
      const { data: existingAccount } = await supabase
        .from('patient_accounts')
        .select('id')
        .eq('patient_id', patientId)
        .single();

      if (existingAccount) {
        throw new PraxeologicalError(
          409,
          'ACCOUNT_EXISTS',
          'Paciente já possui conta',
          ErrorSeverity.LOW,
          { patientId },
          'Você já possui uma conta. Use a opção "Esqueci minha senha" se necessário.'
        );
      }

      // 3. Hash da senha (bcrypt)
      const passwordHash = await bcrypt.hash(password);

      // 4. Criar conta
      const { error: createError } = await supabase
        .from('patient_accounts')
        .insert({
          patient_id: patientId,
          email,
          password_hash: passwordHash,
        });

      if (createError) {
        throw new PraxeologicalError(
          500,
          'ACCOUNT_CREATION_FAILED',
          'Erro ao criar conta',
          ErrorSeverity.HIGH,
          { error: createError },
          'Não foi possível criar sua conta. Tente novamente mais tarde.'
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conta criada com sucesso! Faça login para acessar o portal.' 
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ==========================================
    // LOGOUT
    // ==========================================
    if (action === 'logout') {
      const sessionId = req.headers.get('x-session-id');

      if (sessionId) {
        await supabase
          .from('patient_sessions')
          .delete()
          .eq('id', sessionId);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    throw new PraxeologicalError(
      400,
      'INVALID_ACTION',
      'Ação inválida',
      ErrorSeverity.LOW,
      { action },
      'Ação não reconhecida'
    );

  } catch (error) {
    return handleError(error, requestId);
  }
});
