import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log('analyze-database-health function started')

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface DatabaseMetrics {
  total_size_mb: number
  connections_active: number
  connections_max: number
  cache_hit_ratio: number
  deadlocks_count: number
  slow_queries: Array<{
    query: string
    avg_time_ms: number
    calls: number
  }>
  table_bloat: Array<{
    table_name: string
    bloat_pct: number
    wasted_mb: number
  }>
  missing_indexes: Array<{
    table_name: string
    seq_scans: number
    rows_scanned: number
  }>
  unused_indexes: Array<{
    index_name: string
    table_name: string
    size_mb: number
  }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é ADMIN
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'ADMIN' 
    })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const metrics: DatabaseMetrics = {
      total_size_mb: 0,
      connections_active: 0,
      connections_max: 100,
      cache_hit_ratio: 0,
      deadlocks_count: 0,
      slow_queries: [],
      table_bloat: [],
      missing_indexes: [],
      unused_indexes: []
    }

    // Database size
    const { data: sizeData } = await supabase.rpc('exec_sql', {
      query: `SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb`
    })
    if (sizeData && sizeData.length > 0) {
      metrics.total_size_mb = parseFloat(sizeData[0].size_mb)
    }

    // Active connections
    const { data: connData } = await supabase.rpc('exec_sql', {
      query: `SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active'`
    })
    if (connData && connData.length > 0) {
      metrics.connections_active = parseInt(connData[0].active)
    }

    // Cache hit ratio
    const { data: cacheData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          ROUND(100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as hit_ratio
        FROM pg_statio_user_tables
      `
    })
    if (cacheData && cacheData.length > 0) {
      metrics.cache_hit_ratio = parseFloat(cacheData[0].hit_ratio || '0')
    }

    // Table bloat detection (simplified)
    const { data: bloatData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          schemaname || '.' || tablename as table_name,
          ROUND((pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) / 1024.0 / 1024.0, 2) as wasted_mb
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY wasted_mb DESC
        LIMIT 10
      `
    })
    if (bloatData) {
      metrics.table_bloat = bloatData.map((row: any) => ({
        table_name: row.table_name,
        bloat_pct: 0, // Simplificado - cálculo real requer mais análise
        wasted_mb: parseFloat(row.wasted_mb || '0')
      })).filter((t: any) => t.wasted_mb > 10)
    }

    // Missing indexes (high seq scans)
    const { data: seqScanData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          schemaname || '.' || tablename as table_name,
          seq_scan,
          n_live_tup as rows_scanned
        FROM pg_stat_user_tables
        WHERE seq_scan > 1000 AND n_live_tup > 10000
        ORDER BY seq_scan DESC
        LIMIT 10
      `
    })
    if (seqScanData) {
      metrics.missing_indexes = seqScanData.map((row: any) => ({
        table_name: row.table_name,
        seq_scans: parseInt(row.seq_scan),
        rows_scanned: parseInt(row.rows_scanned)
      }))
    }

    // Unused indexes
    const { data: unusedIdxData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          schemaname || '.' || indexrelname as index_name,
          schemaname || '.' || tablename as table_name,
          ROUND(pg_relation_size(schemaname||'.'||indexrelname) / 1024.0 / 1024.0, 2) as size_mb
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0 AND schemaname = 'public'
        ORDER BY size_mb DESC
        LIMIT 10
      `
    })
    if (unusedIdxData) {
      metrics.unused_indexes = unusedIdxData.map((row: any) => ({
        index_name: row.index_name,
        table_name: row.table_name,
        size_mb: parseFloat(row.size_mb)
      })).filter((i: any) => i.size_mb > 1)
    }

    // Alertas proativos
    const alerts = []

    if (metrics.total_size_mb > 8000) { // 80% de 10GB
      alerts.push({
        severity: 'critical',
        message: `Banco de dados atingindo capacidade: ${metrics.total_size_mb.toFixed(0)}MB (80% do limite)`
      })
    }

    if (metrics.cache_hit_ratio < 90) {
      alerts.push({
        severity: 'warning',
        message: `Cache hit ratio baixo: ${metrics.cache_hit_ratio}% (ideal > 95%)`
      })
    }

    if (metrics.connections_active > 80) {
      alerts.push({
        severity: 'warning',
        message: `Alto número de conexões ativas: ${metrics.connections_active} (max: ${metrics.connections_max})`
      })
    }

    if (metrics.table_bloat.length > 0) {
      const totalBloat = metrics.table_bloat.reduce((sum, t) => sum + t.wasted_mb, 0)
      if (totalBloat > 100) {
        alerts.push({
          severity: 'warning',
          message: `Detectado ${totalBloat.toFixed(0)}MB de bloat em ${metrics.table_bloat.length} tabelas. VACUUM recomendado.`
        })
      }
    }

    // Enviar email de alerta crítico
    if (alerts.some(a => a.severity === 'critical')) {
      const { data: clinic } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (clinic) {
        const { data: clinicInfo } = await supabase
          .from('clinics')
          .select('name')
          .eq('id', clinic.clinic_id)
          .single()

        await resend.emails.send({
          from: 'Ortho+ Database Monitor <onboarding@resend.dev>',
          to: [user.email || 'admin@clinic.com'],
          subject: '🚨 ALERTA CRÍTICO: Banco de Dados Requer Atenção',
          html: `
            <h1>Alerta Crítico do Banco de Dados</h1>
            <p>Clínica: <strong>${clinicInfo?.name}</strong></p>
            <h3>Alertas Detectados:</h3>
            <ul>
              ${alerts.map(a => `<li><strong>${a.severity.toUpperCase()}:</strong> ${a.message}</li>`).join('')}
            </ul>
            <h3>Métricas Atuais:</h3>
            <ul>
              <li>Tamanho total: ${metrics.total_size_mb.toFixed(0)}MB</li>
              <li>Conexões ativas: ${metrics.connections_active}</li>
              <li>Cache hit ratio: ${metrics.cache_hit_ratio}%</li>
              <li>Tabelas com bloat: ${metrics.table_bloat.length}</li>
            </ul>
            <p><strong>Ação recomendada:</strong> Revisar configurações de backup e considerar manutenção do banco de dados.</p>
          `
        })
      }
    }

    return new Response(
      JSON.stringify({ metrics, alerts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-database-health:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
