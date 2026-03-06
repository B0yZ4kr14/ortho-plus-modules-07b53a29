import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { checkRateLimit } from '../_shared/rateLimiter.ts'

console.log('toggle-module-state function started')

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

    // Rate limiting
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown'
    
    const rateLimitResult = await checkRateLimit(supabase, user.id, ipAddress, 'toggle-module-state')
    
    if (!rateLimitResult.allowed) {
      console.warn(`[toggle-module-state] Rate limit exceeded for user ${user.id}`)
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          reason: rateLimitResult.reason,
          reset_at: rateLimitResult.reset_at 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Parsear body
    const { module_key } = await req.json()
    if (!module_key) {
      return new Response(
        JSON.stringify({ error: 'module_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Toggle request for module:', module_key, 'clinic:', clinicId)

    // Buscar módulo no catálogo
    const { data: catalogModule, error: catalogError } = await supabase
      .from('module_catalog')
      .select('id, module_key')
      .eq('module_key', module_key)
      .single()

    if (catalogError || !catalogModule) {
      return new Response(
        JSON.stringify({ error: 'Module not found in catalog' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar registro em clinic_modules (ou criar se não existir)
    let clinicModule = null;
    const { data: existingModule, error: clinicModuleError } = await supabase
      .from('clinic_modules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('module_catalog_id', catalogModule.id)
      .maybeSingle()

    if (clinicModuleError) {
      throw clinicModuleError;
    }

    // Se não existir, criar automaticamente (sistema sempre completo)
    if (!existingModule) {
      console.log('Module not found in clinic_modules, creating automatically...')
      const { data: newModule, error: insertError } = await supabase
        .from('clinic_modules')
        .insert({
          clinic_id: clinicId,
          module_catalog_id: catalogModule.id,
          is_active: false
        })
        .select()
        .single()

      if (insertError) {
        throw insertError;
      }

      clinicModule = newModule;
      console.log('Module created successfully')
    } else {
      clinicModule = existingModule;
    }

    const newState = !clinicModule.is_active
    console.log('Current state:', clinicModule.is_active, 'New state:', newState)

    // VERIFICAÇÕES E ATIVAÇÃO EM CASCATA
    const modulesToActivate: number[] = []
    const modulesToProcess = [catalogModule.id]
    const processedModules = new Set<number>()

    if (newState === true) {
      // Tentando ATIVAR - ativar dependências automaticamente em cascata
      while (modulesToProcess.length > 0) {
        const currentModuleId = modulesToProcess.shift()!
        
        if (processedModules.has(currentModuleId)) {
          continue
        }
        
        processedModules.add(currentModuleId)

        // Buscar dependências deste módulo
        const { data: dependencies } = await supabase
          .from('module_dependencies')
          .select('depends_on_module_id')
          .eq('module_id', currentModuleId)

        if (dependencies && dependencies.length > 0) {
          const requiredIds = dependencies.map((d) => d.depends_on_module_id)

          // Verificar quais dependências não estão ativas
          const { data: inactiveModules } = await supabase
            .from('clinic_modules')
            .select('module_catalog_id')
            .eq('clinic_id', clinicId)
            .eq('is_active', false)
            .in('module_catalog_id', requiredIds)

          if (inactiveModules && inactiveModules.length > 0) {
            // Adicionar dependências inativas à fila para ativar
            for (const inactiveMod of inactiveModules) {
              if (!processedModules.has(inactiveMod.module_catalog_id)) {
                modulesToProcess.push(inactiveMod.module_catalog_id)
                modulesToActivate.push(inactiveMod.module_catalog_id)
              }
            }
          }
        }
      }

      // Ativar todas as dependências em cascata
      if (modulesToActivate.length > 0) {
        console.log('Activating dependencies in cascade:', modulesToActivate)
        
        const { error: cascadeError } = await supabase
          .from('clinic_modules')
          .update({ is_active: true })
          .eq('clinic_id', clinicId)
          .in('module_catalog_id', modulesToActivate)

        if (cascadeError) {
          throw cascadeError
        }

        // Buscar nomes dos módulos ativados para log
        const { data: activatedModules } = await supabase
          .from('module_catalog')
          .select('name')
          .in('id', modulesToActivate)

        const activatedNames = activatedModules?.map((m) => m.name).join(', ') || ''
        console.log('Cascade activated:', activatedNames)

        // Registrar auditoria das ativações em cascata
        for (const moduleId of modulesToActivate) {
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            clinic_id: clinicId,
            action: 'MODULE_ACTIVATED_CASCADE',
            target_module_id: moduleId,
            details: { 
              triggered_by: module_key,
              cascade: true,
            },
          })
        }
      }
    } else {
      // Tentando DESATIVAR - verificar dependências reversas (bloqueio)
      const { data: reverseDeps } = await supabase
        .from('module_dependencies')
        .select('module_id')
        .eq('depends_on_module_id', catalogModule.id)

      if (reverseDeps && reverseDeps.length > 0) {
        const dependentIds = reverseDeps.map((d) => d.module_id)

        const { data: activeDependents } = await supabase
          .from('clinic_modules')
          .select('module_catalog_id')
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .in('module_catalog_id', dependentIds)

        if (activeDependents && activeDependents.length > 0) {
          const { data: dependentModules } = await supabase
            .from('module_catalog')
            .select('name')
            .in('id', activeDependents.map((m) => m.module_catalog_id))

          const dependentNames = dependentModules?.map((m) => m.name).join(', ') || 'unknown'

          return new Response(
            JSON.stringify({
              error: `Falha ao desativar. O(s) módulo(s) ${dependentNames} deve(m) ser desativado(s) primeiro.`,
              code: 'BLOCKING_DEPENDENCIES',
            }),
            { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // EXECUTAR TOGGLE do módulo principal
    const { data: updatedModule, error: updateError } = await supabase
      .from('clinic_modules')
      .update({ is_active: newState })
      .eq('id', clinicModule.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // REGISTRAR AUDITORIA do módulo principal
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinicId,
      action: newState ? 'MODULE_ACTIVATED' : 'MODULE_DEACTIVATED',
      target_module_id: catalogModule.id,
      details: { 
        module_key, 
        previous_state: clinicModule.is_active, 
        new_state: newState,
        cascade_activated: modulesToActivate.length,
      },
    })

    console.log('Module toggled successfully:', module_key, 'new state:', newState)

    // Retornar resposta com informações sobre ativação em cascata
    return new Response(
      JSON.stringify({ 
        success: true, 
        module: updatedModule,
        cascade_activated: modulesToActivate.length,
        message: modulesToActivate.length > 0 
          ? `Módulo ativado com sucesso! ${modulesToActivate.length} dependência(s) ativada(s) automaticamente.`
          : 'Módulo atualizado com sucesso!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in toggle-module-state:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})