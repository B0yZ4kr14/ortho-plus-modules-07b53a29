import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log('validate-backup-integrity function started')

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

async function generateChecksum(data: string, algorithm: 'MD5' | 'SHA-256'): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

    const url = new URL(req.url)
    const backupId = url.searchParams.get('backupId')

    if (!backupId) {
      return new Response(
        JSON.stringify({ error: 'Backup ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get backup record
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In production, fetch actual backup data from storage
    // For now, we'll use metadata as sample data
    const backupData = JSON.stringify(backup.metadata)

    // Recalculate checksums
    const currentMD5 = await generateChecksum(backupData, 'MD5')
    const currentSHA256 = await generateChecksum(backupData, 'SHA-256')

    const isValid = 
      currentMD5 === backup.checksum_md5 && 
      currentSHA256 === backup.checksum_sha256

    const result = {
      backupId: backup.id,
      isValid,
      originalMD5: backup.checksum_md5,
      currentMD5,
      originalSHA256: backup.checksum_sha256,
      currentSHA256,
      createdAt: backup.created_at,
      fileSize: backup.file_size_bytes,
      status: backup.status
    }

    // If corrupted, send alert
    if (!isValid) {
      // Get clinic info for notification
      const { data: clinic } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', backup.clinic_id)
        .single()

      // Get admin emails
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('clinic_id', backup.clinic_id)

      if (admins && admins.length > 0) {
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'ADMIN')
          .in('user_id', admins.map(a => a.id))

        if (adminRoles && adminRoles.length > 0) {
          const { data: users } = await supabase.auth.admin.listUsers()
          
          const adminEmails = users.users
            .filter(u => adminRoles.some(r => r.user_id === u.id))
            .map(u => u.email)
            .filter(Boolean) as string[]

          for (const email of adminEmails) {
            await resend.emails.send({
              from: 'Ortho+ Security <onboarding@resend.dev>',
              to: [email],
              subject: '⚠️ ALERTA: Backup Corrompido Detectado',
              html: `
                <h1>Alerta de Segurança: Backup Corrompido</h1>
                <p>Foi detectada uma falha de integridade no backup da clínica <strong>${clinic?.name}</strong>.</p>
                <h3>Detalhes do Backup:</h3>
                <ul>
                  <li><strong>ID:</strong> ${backup.id}</li>
                  <li><strong>Data:</strong> ${new Date(backup.created_at).toLocaleString('pt-BR')}</li>
                  <li><strong>Tamanho:</strong> ${(backup.file_size_bytes / 1024 / 1024).toFixed(2)} MB</li>
                  <li><strong>MD5 Original:</strong> ${backup.checksum_md5}</li>
                  <li><strong>MD5 Atual:</strong> ${currentMD5}</li>
                  <li><strong>SHA-256 Original:</strong> ${backup.checksum_sha256}</li>
                  <li><strong>SHA-256 Atual:</strong> ${currentSHA256}</li>
                </ul>
                <p><strong>Ação Recomendada:</strong> Execute um novo backup imediatamente e investigue possíveis problemas de armazenamento.</p>
                <p><strong>Ortho+ Security Team</strong></p>
              `
            })
          }
        }
      }

      // Log security event
      await supabase.from('audit_logs').insert({
        clinic_id: backup.clinic_id,
        action: 'BACKUP_INTEGRITY_FAILURE',
        details: result
      })
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in validate-backup-integrity:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})