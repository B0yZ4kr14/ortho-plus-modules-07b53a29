import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('restore-backup function started')

async function decryptData(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encryptedBuffer = combined.slice(12)
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password.padEnd(32, '0').substring(0, 32)),
    'AES-GCM',
    false,
    ['decrypt']
  )
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    passwordKey,
    encryptedBuffer
  )
  
  return decoder.decode(decryptedBuffer)
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

    const { backupData, decryptionPassword } = await req.json()

    let parsedData = backupData

    if (decryptionPassword) {
      parsedData = await decryptData(backupData, decryptionPassword)
    }

    const importData = JSON.parse(parsedData)

    if (!importData.version || !importData.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid backup format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = {
      modules: 0,
      patients: 0,
      historico: 0,
      prontuarios: 0,
      appointments: 0,
      financeiro: 0
    }

    if (importData.data.modules) {
      for (const module of importData.data.modules) {
        await supabase
          .from('clinic_modules')
          .upsert({
            clinic_id: profile.clinic_id,
            module_catalog_id: module.module_catalog_id,
            is_active: module.is_active
          }, {
            onConflict: 'clinic_id,module_catalog_id'
          })
        results.modules++
      }
    }

    await supabase.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action: 'BACKUP_RESTORED',
      details: {
        backupId: importData.backupId,
        results
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in restore-backup:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})