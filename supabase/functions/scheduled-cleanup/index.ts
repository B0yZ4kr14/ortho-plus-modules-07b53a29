import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { Resend } from 'https://esm.sh/resend@2.0.0'

console.log('scheduled-cleanup function started')

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface ScheduledBackupConfig {
  id: string
  clinic_id: string
  name: string
  frequency: string
  is_incremental: boolean
  include_modules: boolean
  include_patients: boolean
  include_history: boolean
  include_prontuarios: boolean
  include_appointments: boolean
  include_financeiro: boolean
  enable_compression: boolean
  enable_encryption: boolean
  cloud_storage_provider: string
  notification_emails: string[]
  last_run_at: string | null
}

async function executeBackup(supabase: any, config: ScheduledBackupConfig) {
  console.log(`Executing backup for config: ${config.id}`)
  
  try {
    let lastBackupDate = null
    if (config.is_incremental && config.last_run_at) {
      lastBackupDate = config.last_run_at
    }

    const { data, error } = await supabase.functions.invoke('manual-backup', {
      body: {
        includeModules: config.include_modules,
        includePatients: config.include_patients,
        includeHistory: config.include_history,
        includeProntuarios: config.include_prontuarios,
        includeAppointments: config.include_appointments,
        includeFinanceiro: config.include_financeiro,
        enableCompression: config.enable_compression,
        enableEncryption: config.enable_encryption,
        isIncremental: config.is_incremental,
        lastBackupDate
      }
    })

    if (error) throw error

    if (config.notification_emails && config.notification_emails.length > 0) {
      for (const email of config.notification_emails) {
        await resend.emails.send({
          from: 'Ortho+ Backups <onboarding@resend.dev>',
          to: [email],
          subject: `✅ Backup Agendado Concluído - ${config.name}`,
          html: `
            <h1>Backup Concluído com Sucesso</h1>
            <p>O backup agendado "<strong>${config.name}</strong>" foi executado com sucesso.</p>
            <h3>Detalhes do Backup:</h3>
            <ul>
              <li><strong>ID do Backup:</strong> ${data.backupId}</li>
              <li><strong>Tipo:</strong> ${config.is_incremental ? 'Incremental' : 'Completo'}</li>
              <li><strong>Tamanho Original:</strong> ${(data.metadata.originalSize / 1024 / 1024).toFixed(2)} MB</li>
              <li><strong>Tamanho Comprimido:</strong> ${(data.metadata.compressedSize / 1024 / 1024).toFixed(2)} MB</li>
              <li><strong>Taxa de Compressão:</strong> ${data.metadata.compressionRatio}</li>
              <li><strong>Criptografado:</strong> ${data.metadata.isEncrypted ? 'Sim' : 'Não'}</li>
              <li><strong>Checksum MD5:</strong> ${data.metadata.checksumMD5}</li>
              <li><strong>Checksum SHA-256:</strong> ${data.metadata.checksumSHA256}</li>
            </ul>
            <p>O backup foi armazenado com segurança e está disponível para download através do sistema.</p>
            <p><strong>Ortho+ Team</strong></p>
          `
        })
      }
    }

    await supabase
      .from('scheduled_backups')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: calculateNextRun(config)
      })
      .eq('id', config.id)

    console.log(`Backup ${config.id} completed successfully`)
    return { success: true, backupId: data.backupId }

  } catch (error) {
    console.error(`Error executing backup ${config.id}:`, error)
    
    if (config.notification_emails && config.notification_emails.length > 0) {
      for (const email of config.notification_emails) {
        await resend.emails.send({
          from: 'Ortho+ Backups <onboarding@resend.dev>',
          to: [email],
          subject: `❌ Falha no Backup Agendado - ${config.name}`,
          html: `
            <h1>Falha no Backup</h1>
            <p>O backup agendado "<strong>${config.name}</strong>" falhou durante a execução.</p>
            <h3>Detalhes do Erro:</h3>
            <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
            <p>Por favor, verifique a configuração do backup e tente novamente.</p>
            <p><strong>Ortho+ Team</strong></p>
          `
        })
      }
    }

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function calculateNextRun(config: ScheduledBackupConfig): string {
  const now = new Date()
  const nextRun = new Date(now)
  
  switch (config.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1)
      break
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7)
      break
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1)
      break
  }
  
  return nextRun.toISOString()
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: scheduledBackups, error } = await supabase
      .from('scheduled_backups')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())

    if (error) {
      console.error('Error fetching scheduled backups:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scheduled backups' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${scheduledBackups?.length || 0} backups to execute`)

    const results = []
    for (const config of scheduledBackups || []) {
      const result = await executeBackup(supabase, config)
      results.push({ configId: config.id, ...result })
    }

    return new Response(
      JSON.stringify({
        success: true,
        executedBackups: results.length,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scheduled-cleanup:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})