/**
 * FASE 1 - TASK 1.2: RATE LIMITER MIDDLEWARE
 * 
 * Middleware para rate limiting em Edge Functions
 * Protege contra abuse de API, ataques DDoS e uso excessivo de recursos
 * 
 * USO:
 * import { checkRateLimit } from '../_shared/rateLimiter.ts';
 * 
 * const allowed = await checkRateLimit(
 *   supabase,
 *   userId,
 *   ipAddress,
 *   'endpoint-name'
 * );
 * 
 * if (!allowed) {
 *   return new Response('Rate limit exceeded', { status: 429 });
 * }
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  max_requests_per_user: number;
  max_requests_per_ip: number;
  window_minutes: number;
  enabled: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  reset_at?: string;
  reason?: string;
}

/**
 * Verifica se a requisição está dentro dos limites de rate
 * 
 * @param supabase - Cliente Supabase (service_role)
 * @param userId - ID do usuário autenticado (null se anônimo)
 * @param ipAddress - Endereço IP do cliente
 * @param endpoint - Nome do endpoint (ex: 'create-patient')
 * @returns Promise<RateLimitResult>
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string | null,
  ipAddress: string,
  endpoint: string
): Promise<RateLimitResult> {
  try {
    console.log(`[rate-limiter] Checking rate limit for endpoint: ${endpoint}, user: ${userId}, IP: ${ipAddress}`);

    // ============================================================================
    // 1. BUSCAR CONFIGURAÇÃO DO ENDPOINT
    // ============================================================================
    const { data: config, error: configError } = await supabase
      .from('rate_limit_config')
      .select('*')
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (configError) {
      console.error('[rate-limiter] Erro ao buscar config:', configError);
      // Em caso de erro, usar valores padrão (fail-open, mas log)
      return { 
        allowed: true, 
        reason: 'Config não encontrada, usando padrão' 
      };
    }

    // Se endpoint não tem config, usar valores padrão
    const rateLimitConfig: RateLimitConfig = config || {
      max_requests_per_user: 100,
      max_requests_per_ip: 200,
      window_minutes: 15,
      enabled: true
    };

    // Se rate limiting está desabilitado para este endpoint
    if (!rateLimitConfig.enabled) {
      console.log(`[rate-limiter] Rate limiting desabilitado para: ${endpoint}`);
      return { allowed: true, reason: 'Rate limiting desabilitado' };
    }

    const windowStart = new Date(Date.now() - rateLimitConfig.window_minutes * 60 * 1000);

    // ============================================================================
    // 2. VERIFICAR RATE LIMIT POR USUÁRIO (SE AUTENTICADO)
    // ============================================================================
    let userLog: { request_count: number } | null = null;
    
    if (userId) {
      const { data, error: userLogError } = await supabase
        .from('rate_limit_log')
        .select('request_count')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .maybeSingle();

      if (userLogError && userLogError.code !== 'PGRST116') { // PGRST116 = not found (ok)
        console.error('[rate-limiter] Erro ao buscar log de usuário:', userLogError);
      }

      userLog = data;
      const userRequestCount = userLog?.request_count || 0;

      if (userRequestCount >= rateLimitConfig.max_requests_per_user) {
        console.warn(`[rate-limiter] Rate limit exceeded for user ${userId} on ${endpoint}`);
        
        // Registrar abuse report
        await createAbuseReport(
          supabase,
          userId,
          ipAddress,
          endpoint,
          'RATE_LIMIT_EXCEEDED',
          'MEDIUM',
          { 
            request_count: userRequestCount,
            limit: rateLimitConfig.max_requests_per_user,
            type: 'user'
          }
        );

        return {
          allowed: false,
          remaining: 0,
          reset_at: new Date(windowStart.getTime() + rateLimitConfig.window_minutes * 60 * 1000).toISOString(),
          reason: `Limite de ${rateLimitConfig.max_requests_per_user} requisições por ${rateLimitConfig.window_minutes} minutos excedido`
        };
      }
    }

    // ============================================================================
    // 3. VERIFICAR RATE LIMIT POR IP (SEMPRE)
    // ============================================================================
    const { data: ipLog, error: ipLogError } = await supabase
      .from('rate_limit_log')
      .select('request_count')
      .eq('ip_address', ipAddress)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (ipLogError && ipLogError.code !== 'PGRST116') {
      console.error('[rate-limiter] Erro ao buscar log de IP:', ipLogError);
    }

    const ipRequestCount = ipLog?.request_count || 0;

    if (ipRequestCount >= rateLimitConfig.max_requests_per_ip) {
      console.warn(`[rate-limiter] Rate limit exceeded for IP ${ipAddress} on ${endpoint}`);
      
      // Registrar abuse report (severidade maior para IPs)
      await createAbuseReport(
        supabase,
        userId,
        ipAddress,
        endpoint,
        'RATE_LIMIT_EXCEEDED',
        ipRequestCount > rateLimitConfig.max_requests_per_ip * 2 ? 'HIGH' : 'MEDIUM',
        { 
          request_count: ipRequestCount,
          limit: rateLimitConfig.max_requests_per_ip,
          type: 'ip'
        }
      );

      return {
        allowed: false,
        remaining: 0,
        reset_at: new Date(windowStart.getTime() + rateLimitConfig.window_minutes * 60 * 1000).toISOString(),
        reason: `Limite de ${rateLimitConfig.max_requests_per_ip} requisições por ${rateLimitConfig.window_minutes} minutos excedido para este IP`
      };
    }

    // ============================================================================
    // 4. INCREMENTAR CONTADOR (UPSERT)
    // ============================================================================
    
    // Incrementar contador de usuário
    if (userId) {
      const { error: upsertUserError } = await supabase
        .from('rate_limit_log')
        .upsert({
          user_id: userId,
          endpoint,
          ip_address: ipAddress,
          window_start: windowStart.toISOString(),
          request_count: (userLog?.request_count || 0) + 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,endpoint,window_start'
        });

      if (upsertUserError) {
        console.error('[rate-limiter] Erro ao atualizar contador de usuário:', upsertUserError);
      }
    }

    // Incrementar contador de IP
    const { error: upsertIpError } = await supabase
      .from('rate_limit_log')
      .upsert({
        user_id: userId,
        endpoint,
        ip_address: ipAddress,
        window_start: windowStart.toISOString(),
        request_count: (ipLog?.request_count || 0) + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'ip_address,endpoint,window_start'
      });

    if (upsertIpError) {
      console.error('[rate-limiter] Erro ao atualizar contador de IP:', upsertIpError);
    }

    // ============================================================================
    // 5. RETORNAR SUCESSO
    // ============================================================================
    const userRemaining = userId 
      ? rateLimitConfig.max_requests_per_user - (userLog?.request_count || 0) - 1
      : null;
    
    const ipRemaining = rateLimitConfig.max_requests_per_ip - (ipLog?.request_count || 0) - 1;
    
    const remaining = userId 
      ? Math.min(userRemaining!, ipRemaining)
      : ipRemaining;

    console.log(`[rate-limiter] Request allowed. Remaining: ${remaining}`);

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      reset_at: new Date(windowStart.getTime() + rateLimitConfig.window_minutes * 60 * 1000).toISOString()
    };

  } catch (error) {
    console.error('[rate-limiter] Erro não tratado:', error);
    // Em caso de erro crítico, permitir requisição (fail-open)
    // mas registrar erro
    return { 
      allowed: true, 
      reason: 'Erro interno, rate limiting ignorado' 
    };
  }
}

/**
 * Cria um relatório de abuse automático
 */
async function createAbuseReport(
  supabase: SupabaseClient,
  userId: string | null,
  ipAddress: string,
  endpoint: string,
  abuseType: string,
  severity: string,
  details: any
): Promise<void> {
  try {
    await supabase
      .from('abuse_reports')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        endpoint,
        abuse_type: abuseType,
        severity,
        details,
        auto_blocked: severity === 'HIGH' || severity === 'CRITICAL'
      });

    console.log(`[rate-limiter] Abuse report created: ${abuseType} on ${endpoint} (${severity})`);
  } catch (error) {
    console.error('[rate-limiter] Erro ao criar abuse report:', error);
  }
}

/**
 * Helper para extrair IP da requisição
 */
export function getClientIp(req: Request): string {
  // Tentar headers comuns de proxy
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback para IP direto (Deno.serve)
  return '0.0.0.0';
}

/**
 * Helper para adicionar headers de rate limit na resposta
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult
): Record<string, string> {
  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remaining.toString();
  }
  
  if (result.reset_at) {
    headers['X-RateLimit-Reset'] = result.reset_at;
  }

  if (!result.allowed) {
    headers['Retry-After'] = '60'; // 1 minuto
  }

  return headers;
}
