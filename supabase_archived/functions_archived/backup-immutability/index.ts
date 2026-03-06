import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('backup-immutability function started')

// FASE 6: Imutabilidade de Backups (WORM - Write Once Read Many)
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

    const { backup_id, action, immutability_period_days } = await req.json()

    // Buscar backup
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backup_id)
      .single()

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()

    if (action === 'enable_worm') {
      // Ativar WORM
      const lockUntil = new Date(now.getTime() + immutability_period_days * 24 * 60 * 60 * 1000)

      await supabase
        .from('backup_history')
        .update({
          metadata: {
            ...backup.metadata,
            immutability: {
              enabled: true,
              locked_until: lockUntil.toISOString(),
              locked_by: user.id,
              locked_at: now.toISOString(),
              reason: 'Proteção contra ransomware e deleção acidental'
            }
          }
        })
        .eq('id', backup_id)

      // Registrar no audit log
      await supabase.from('audit_logs').insert({
        clinic_id: backup.clinic_id,
        user_id: user.id,
        action: 'BACKUP_WORM_ENABLED',
        details: {
          backup_id,
          locked_until: lockUntil.toISOString(),
          period_days: immutability_period_days
        }
      })

      console.log(`WORM enabled for backup ${backup_id} until ${lockUntil.toISOString()}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Backup protegido com WORM',
          locked_until: lockUntil.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'check_deletion') {
      // Verificar se backup pode ser deletado
      const immutability = backup.metadata?.immutability

      if (immutability?.enabled) {
        const lockUntil = new Date(immutability.locked_until)
        
        if (now < lockUntil) {
          const daysRemaining = Math.ceil((lockUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          return new Response(
            JSON.stringify({
              can_delete: false,
              reason: 'Backup protegido por WORM (Write Once Read Many)',
              locked_until: lockUntil.toISOString(),
              days_remaining: daysRemaining
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({
          can_delete: true,
          reason: 'Backup não está protegido ou período de imutabilidade expirou'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in backup-immutability:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
