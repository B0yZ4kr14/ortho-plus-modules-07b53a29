import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('import-clinic-data function started')

interface ImportOptions {
  overwriteExisting: boolean
  skipConflicts: boolean
  mergeData: boolean
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

    const targetClinicId = profile.clinic_id
    const body = await req.json()
    const importData = body.data
    const options: ImportOptions = body.options || {
      overwriteExisting: false,
      skipConflicts: true,
      mergeData: false
    }

    if (!importData || !importData.version || !importData.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid import data format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = {
      success: true,
      imported: { modules: 0, patients: 0, historico: 0, prontuarios: 0, appointments: 0 },
      errors: [] as string[],
      skipped: [] as string[]
    }

    // Importar módulos
    if (importData.data.modules && Array.isArray(importData.data.modules)) {
      for (const moduleData of importData.data.modules) {
        try {
          const { data: catalogModule } = await supabase
            .from('module_catalog')
            .select('id')
            .eq('module_key', moduleData.module_catalog?.module_key)
            .single()

          if (catalogModule) {
            const { error } = await supabase
              .from('clinic_modules')
              .upsert({
                clinic_id: targetClinicId,
                module_catalog_id: catalogModule.id,
                is_active: moduleData.is_active
              }, {
                onConflict: 'clinic_id,module_catalog_id',
                ignoreDuplicates: !options.overwriteExisting
              })

            if (!error) {
              results.imported.modules++
            } else if (options.skipConflicts) {
              results.skipped.push(`Module: ${moduleData.module_catalog?.module_key}`)
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`Error importing module: ${errorMsg}`)
        }
      }
    }

    // Importar prontuários
    if (importData.data.prontuarios && Array.isArray(importData.data.prontuarios)) {
      for (const prontuario of importData.data.prontuarios) {
        try {
          const newProntuario = {
            ...prontuario,
            clinic_id: targetClinicId,
            id: undefined,
            created_at: undefined,
            updated_at: undefined
          }

          const { data: inserted, error } = await supabase
            .from('prontuarios')
            .insert(newProntuario)
            .select()
            .single()

          if (!error && inserted) {
            results.imported.prontuarios++

            if (importData.data.odontogramas && Array.isArray(importData.data.odontogramas)) {
              const odontogramasOriginal = importData.data.odontogramas.filter(
                (o: any) => o.prontuario_id === prontuario.id
              )

              for (const odonto of odontogramasOriginal) {
                await supabase
                  .from('odontograma_teeth')
                  .insert({
                    ...odonto,
                    prontuario_id: inserted.id,
                    id: undefined
                  })
              }
            }
          } else if (error && options.skipConflicts) {
            results.skipped.push(`Prontuario: ${prontuario.id}`)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`Error importing prontuario: ${errorMsg}`)
        }
      }
    }

    await supabase.from('audit_logs').insert({
      clinic_id: targetClinicId,
      user_id: user.id,
      action: 'DATA_IMPORT',
      details: {
        sourceClinicId: importData.clinicId,
        options,
        results: {
          imported: results.imported,
          errorsCount: results.errors.length,
          skippedCount: results.skipped.length
        }
      }
    })

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in import-clinic-data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
