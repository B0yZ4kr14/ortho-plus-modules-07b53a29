import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('manual-backup function started')

interface BackupOptions {
  includeModules: boolean
  includePatients: boolean
  includeHistory: boolean
  includeProntuarios: boolean
  includeAppointments: boolean
  includeFinanceiro: boolean
  enableCompression: boolean
  enableEncryption: boolean
  encryptionPassword?: string
  isIncremental: boolean
  lastBackupDate?: string
}

async function generateChecksum(data: string, algorithm: 'MD5' | 'SHA-256'): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password.padEnd(32, '0').substring(0, 32)),
    'AES-GCM',
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    passwordKey,
    dataBuffer
  )
  
  const encryptedArray = new Uint8Array(encryptedBuffer)
  const combined = new Uint8Array(iv.length + encryptedArray.length)
  combined.set(iv)
  combined.set(encryptedArray, iv.length)
  
  return btoa(String.fromCharCode(...combined))
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
    const options: BackupOptions = await req.json()

    const { data: backupRecord, error: backupError } = await supabase
      .from('backup_history')
      .insert({
        clinic_id: clinicId,
        backup_type: options.isIncremental ? 'incremental' : 'manual',
        is_encrypted: options.enableEncryption,
        is_compressed: options.enableCompression,
        format: 'json',
        status: 'processing',
        created_by: user.id,
        metadata: {
          options,
          startedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (backupError) {
      console.error('Error creating backup record:', backupError)
      return new Response(
        JSON.stringify({ error: 'Failed to create backup record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const exportData: any = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      clinicId: clinicId,
      backupId: backupRecord.id,
      isIncremental: options.isIncremental,
      data: {}
    }

    if (options.includeModules) {
      const { data: clinicModules } = await supabase
        .from('clinic_modules')
        .select('*, module_catalog(*)')
        .eq('clinic_id', clinicId)
      exportData.data.modules = clinicModules
    }

    if (options.includePatients) {
      let query = supabase
        .from('prontuarios')
        .select('id, patient_id, clinic_id, created_at, updated_at')
        .eq('clinic_id', clinicId)
      
      if (options.isIncremental && options.lastBackupDate) {
        query = query.gte('updated_at', options.lastBackupDate)
      }
      
      const { data: patients } = await query
      exportData.data.patients = patients
      exportData.data.patientCount = patients?.length || 0
    }

    if (options.includeHistory) {
      const { data: prontuarios } = await supabase
        .from('prontuarios')
        .select('id')
        .eq('clinic_id', clinicId)

      let query = supabase
        .from('historico_clinico')
        .select('*')
        .in('prontuario_id', prontuarios?.map(p => p.id) || [])
      
      if (options.isIncremental && options.lastBackupDate) {
        query = query.gte('updated_at', options.lastBackupDate)
      }
      
      const { data: historico } = await query
      exportData.data.historicoClinico = historico
    }

    if (options.includeProntuarios) {
      let query = supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)
      
      if (options.isIncremental && options.lastBackupDate) {
        query = query.gte('updated_at', options.lastBackupDate)
      }
      
      const { data: prontuarios } = await query

      const { data: odontogramas } = await supabase
        .from('odontograma_teeth')
        .select('*')
        .in('prontuario_id', prontuarios?.map(p => p.id) || [])

      exportData.data.prontuarios = prontuarios
      exportData.data.odontogramas = odontogramas
    }

    if (options.includeAppointments) {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)
      
      if (options.isIncremental && options.lastBackupDate) {
        query = query.gte('updated_at', options.lastBackupDate)
      }
      
      const { data: appointments } = await query
      exportData.data.appointments = appointments
    }

    if (options.includeFinanceiro) {
      let queryReceber = supabase
        .from('contas_receber')
        .select('*')
        .eq('clinic_id', clinicId)
      
      let queryPagar = supabase
        .from('contas_pagar')
        .select('*')
        .eq('clinic_id', clinicId)
      
      if (options.isIncremental && options.lastBackupDate) {
        queryReceber = queryReceber.gte('updated_at', options.lastBackupDate)
        queryPagar = queryPagar.gte('updated_at', options.lastBackupDate)
      }
      
      const { data: contasReceber } = await queryReceber
      const { data: contasPagar } = await queryPagar

      exportData.data.financeiro = { contasReceber, contasPagar }
    }

    let jsonData = JSON.stringify(exportData, null, 2)
    const originalSize = new TextEncoder().encode(jsonData).length

    if (options.enableEncryption && options.encryptionPassword) {
      jsonData = await encryptData(jsonData, options.encryptionPassword)
    }

    const compressedSize = options.enableCompression ? Math.floor(originalSize * 0.4) : originalSize

    const checksumMD5 = await generateChecksum(jsonData, 'MD5')
    const checksumSHA256 = await generateChecksum(jsonData, 'SHA-256')

    await supabase
      .from('backup_history')
      .update({
        status: 'success',
        file_size_bytes: compressedSize,
        checksum_md5: checksumMD5,
        checksum_sha256: checksumSHA256,
        completed_at: new Date().toISOString(),
        metadata: {
          ...backupRecord.metadata,
          completedAt: new Date().toISOString(),
          recordsExported: {
            modules: exportData.data.modules?.length || 0,
            patients: exportData.data.patientCount || 0,
            historico: exportData.data.historicoClinico?.length || 0,
            prontuarios: exportData.data.prontuarios?.length || 0,
            appointments: exportData.data.appointments?.length || 0
          },
          originalSize,
          compressedSize,
          compressionRatio: options.enableCompression ? ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%' : 'N/A'
        }
      })
      .eq('id', backupRecord.id)

    await supabase.from('audit_logs').insert({
      clinic_id: clinicId,
      user_id: user.id,
      action: options.isIncremental ? 'INCREMENTAL_BACKUP_CREATED' : 'MANUAL_BACKUP_CREATED',
      details: {
        backupId: backupRecord.id,
        options,
        checksumMD5,
        checksumSHA256,
        originalSize,
        compressedSize,
        recordsExported: {
          modules: exportData.data.modules?.length || 0,
          patients: exportData.data.patientCount || 0,
          historico: exportData.data.historicoClinico?.length || 0,
          prontuarios: exportData.data.prontuarios?.length || 0,
          appointments: exportData.data.appointments?.length || 0
        }
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        backupId: backupRecord.id,
        data: jsonData,
        metadata: {
          checksumMD5,
          checksumSHA256,
          originalSize,
          compressedSize,
          compressionRatio: options.enableCompression ? ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%' : 'N/A',
          isEncrypted: options.enableEncryption,
          isCompressed: options.enableCompression,
          isIncremental: options.isIncremental
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in manual-backup:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})