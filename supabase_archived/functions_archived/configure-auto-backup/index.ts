import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('configure-auto-backup function started')

interface AutoBackupConfig {
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  timeOfDay: string
  dayOfWeek?: number
  dayOfMonth?: number
  isIncremental: boolean
  includeModules: boolean
  includePatients: boolean
  includeHistory: boolean
  includeProntuarios: boolean
  includeAppointments: boolean
  includeFinanceiro: boolean
  enableCompression: boolean
  enableEncryption: boolean
  cloudStorageProvider?: 's3' | 'google_drive' | 'dropbox' | 'none'
  notificationEmails: string[]
  isActive: boolean
}

function calculateNextRun(config: AutoBackupConfig): Date {
  const now = new Date()
  const [hours, minutes] = config.timeOfDay.split(':').map(Number)
  
  const nextRun = new Date(now)
  nextRun.setHours(hours, minutes, 0, 0)
  
  switch (config.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break
    
    case 'weekly':
      if (config.dayOfWeek !== undefined) {
        const daysUntilTarget = (config.dayOfWeek - now.getDay() + 7) % 7
        nextRun.setDate(nextRun.getDate() + daysUntilTarget)
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7)
        }
      }
      break
    
    case 'monthly':
      if (config.dayOfMonth !== undefined) {
        nextRun.setDate(config.dayOfMonth)
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
      }
      break
  }
  
  return nextRun
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (!roles?.some((r) => r.role === 'ADMIN')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicId = profile.clinic_id
    const config: AutoBackupConfig = await req.json()

    const nextRun = calculateNextRun(config)

    const { data: scheduledBackup, error: insertError } = await supabase
      .from('scheduled_backups')
      .insert({
        clinic_id: clinicId,
        name: config.name,
        frequency: config.frequency,
        time_of_day: config.timeOfDay,
        day_of_week: config.dayOfWeek,
        day_of_month: config.dayOfMonth,
        is_active: config.isActive,
        is_incremental: config.isIncremental,
        include_modules: config.includeModules,
        include_patients: config.includePatients,
        include_history: config.includeHistory,
        include_prontuarios: config.includeProntuarios,
        include_appointments: config.includeAppointments,
        include_financeiro: config.includeFinanceiro,
        enable_compression: config.enableCompression,
        enable_encryption: config.enableEncryption,
        cloud_storage_provider: config.cloudStorageProvider || 'none',
        notification_emails: config.notificationEmails,
        next_run_at: nextRun.toISOString(),
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating scheduled backup:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create scheduled backup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('audit_logs').insert({
      clinic_id: clinicId,
      user_id: user.id,
      action: 'AUTO_BACKUP_CONFIGURED',
      details: {
        scheduledBackupId: scheduledBackup.id,
        config,
        nextRun: nextRun.toISOString()
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        scheduledBackup,
        nextRun: nextRun.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in configure-auto-backup:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})