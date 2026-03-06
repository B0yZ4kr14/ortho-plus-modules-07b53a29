import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('apply-module-template function started')

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

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é ADMIN
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError || !roles?.some((r) => r.role === 'ADMIN')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar clinic_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicId = profile.clinic_id

    // Parse body
    const { template_id } = await req.json()

    if (!template_id) {
      return new Response(
        JSON.stringify({ error: 'template_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Applying template:', template_id, 'to clinic:', clinicId)

    // Buscar template
    const { data: template, error: templateError } = await supabase
      .from('module_configuration_templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const moduleKeys = template.modules as string[]
    console.log('Template modules:', moduleKeys)

    // Buscar IDs dos módulos do catálogo
    const { data: catalogModules, error: catalogError } = await supabase
      .from('module_catalog')
      .select('id, module_key')
      .in('module_key', moduleKeys)

    if (catalogError) {
      throw catalogError
    }

    console.log('Found catalog modules:', catalogModules?.length)

    // Criar ou atualizar clinic_modules
    let activatedCount = 0
    let errorCount = 0

    for (const catalogModule of catalogModules || []) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('clinic_modules')
          .select('id, is_active')
          .eq('clinic_id', clinicId)
          .eq('module_catalog_id', catalogModule.id)
          .maybeSingle()

        if (existing) {
          // Atualizar para ativo se não estiver
          if (!existing.is_active) {
            const { error: updateError } = await supabase
              .from('clinic_modules')
              .update({ is_active: true })
              .eq('id', existing.id)

            if (updateError) {
              console.error('Error updating module:', catalogModule.module_key, updateError)
              errorCount++
            } else {
              activatedCount++
            }
          }
        } else {
          // Criar novo registro ativo
          const { error: insertError } = await supabase
            .from('clinic_modules')
            .insert({
              clinic_id: clinicId,
              module_catalog_id: catalogModule.id,
              is_active: true,
            })

          if (insertError) {
            console.error('Error inserting module:', catalogModule.module_key, insertError)
            errorCount++
          } else {
            activatedCount++
          }
        }
      } catch (error) {
        console.error('Error processing module:', catalogModule.module_key, error)
        errorCount++
      }
    }

    // Registrar auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinicId,
      action: 'TEMPLATE_APPLIED',
      details: {
        template_id,
        template_name: template.name,
        specialty: template.specialty,
        modules_activated: activatedCount,
        errors: errorCount,
      },
    })

    console.log('Template applied successfully:', {
      activated: activatedCount,
      errors: errorCount,
    })

    return new Response(
      JSON.stringify({
        success: true,
        activated: activatedCount,
        errors: errorCount,
        template_name: template.name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in apply-module-template:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
