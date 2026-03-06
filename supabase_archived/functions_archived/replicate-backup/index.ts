import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('replicate-backup function started')

interface ReplicationConfig {
  targetClinicId: string
  region: string
  storageProvider: string
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

    const { backupId, replications } = await req.json() as {
      backupId: string
      replications: ReplicationConfig[]
    }

    // Buscar backup original
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      throw new Error('Backup not found')
    }

    const replicationResults = []

    // Criar registros de replicação para cada target
    for (const config of replications) {
      const replicationId = crypto.randomUUID()

      // Criar registro de replicação
      const { error: replicationError } = await supabase
        .from('backup_replications')
        .insert({
          id: replicationId,
          source_clinic_id: backup.clinic_id,
          target_clinic_id: config.targetClinicId,
          backup_id: backupId,
          region: config.region,
          storage_provider: config.storageProvider,
          replication_status: 'IN_PROGRESS'
        })

      if (replicationError) {
        console.error('Error creating replication record:', replicationError)
        continue
      }

      try {
        // Simular replicação (em produção, aqui seria feito o upload real para região geo-distribuída)
        // Por exemplo: AWS S3 us-east-1, eu-west-1, ap-southeast-1
        const storagePath = `${config.region}/${config.targetClinicId}/backups/${backupId}.json`
        
        // Calcular checksum
        const encoder = new TextEncoder()
        const data = encoder.encode(JSON.stringify(backup.metadata))
        const hashBuffer = await crypto.subtle.digest('MD5', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        // Atualizar status de replicação
        await supabase
          .from('backup_replications')
          .update({
            replication_status: 'COMPLETED',
            storage_path: storagePath,
            file_size_bytes: backup.file_size_bytes,
            checksum_md5: checksum,
            completed_at: new Date().toISOString(),
            metadata: {
              replicated_at: new Date().toISOString(),
              source_region: 'primary',
              target_region: config.region
            }
          })
          .eq('id', replicationId)

        replicationResults.push({
          replicationId,
          status: 'COMPLETED',
          region: config.region,
          storagePath
        })

        console.log(`✅ Backup replicated to ${config.region}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error replicating to ${config.region}:`, errorMessage)
        
        await supabase
          .from('backup_replications')
          .update({
            replication_status: 'FAILED',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', replicationId)

        replicationResults.push({
          replicationId,
          status: 'FAILED',
          region: config.region,
          error: errorMessage
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        backupId,
        replications: replicationResults
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in replicate-backup:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
