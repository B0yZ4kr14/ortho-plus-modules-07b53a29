import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

console.log('cleanup-old-backups function started')

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, backup_retention_days, auto_cleanup_enabled')

    if (clinicsError) {
      console.error('Error fetching clinics:', clinicsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch clinics' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    for (const clinic of clinics || []) {
      if (!clinic.auto_cleanup_enabled) {
        console.log(`Skipping clinic ${clinic.id} - auto cleanup disabled`)
        continue
      }

      const retentionDays = clinic.backup_retention_days || 90
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      console.log(`Cleaning up backups for clinic ${clinic.id} older than ${cutoffDate.toISOString()}`)

      const { data: oldBackups, error: fetchError } = await supabase
        .from('backup_history')
        .select('id, file_size_bytes')
        .eq('clinic_id', clinic.id)
        .lt('created_at', cutoffDate.toISOString())
        .eq('status', 'success')

      if (fetchError) {
        console.error(`Error fetching old backups for clinic ${clinic.id}:`, fetchError)
        results.push({
          clinicId: clinic.id,
          success: false,
          error: fetchError.message
        })
        continue
      }

      if (!oldBackups || oldBackups.length === 0) {
        console.log(`No old backups to clean up for clinic ${clinic.id}`)
        results.push({
          clinicId: clinic.id,
          success: true,
          deletedCount: 0,
          freedBytes: 0
        })
        continue
      }

      const deletedCount = oldBackups.length
      const freedBytes = oldBackups.reduce((sum, backup) => sum + (backup.file_size_bytes || 0), 0)

      const { error: deleteError } = await supabase
        .from('backup_history')
        .delete()
        .in('id', oldBackups.map(b => b.id))

      if (deleteError) {
        console.error(`Error deleting old backups for clinic ${clinic.id}:`, deleteError)
        results.push({
          clinicId: clinic.id,
          success: false,
          error: deleteError.message
        })
        continue
      }

      await supabase.from('audit_logs').insert({
        clinic_id: clinic.id,
        action: 'BACKUP_CLEANUP',
        details: {
          deletedCount,
          freedBytes,
          retentionDays,
          cutoffDate: cutoffDate.toISOString()
        }
      })

      console.log(`Cleaned up ${deletedCount} backups for clinic ${clinic.id}, freed ${freedBytes} bytes`)
      results.push({
        clinicId: clinic.id,
        success: true,
        deletedCount,
        freedBytes
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedClinics: results.length,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in cleanup-old-backups:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})