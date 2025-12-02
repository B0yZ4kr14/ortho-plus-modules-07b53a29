import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { checkRateLimit } from '../_shared/rateLimiter.ts'

console.log('get-my-modules function started')

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
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Rate limiting
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown'
    
    const rateLimitResult = await checkRateLimit(supabase, user.id, ipAddress, 'get-my-modules')
    
    if (!rateLimitResult.allowed) {
      console.warn(`[get-my-modules] Rate limit exceeded for user ${user.id}`)
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          reason: rateLimitResult.reason,
          reset_at: rateLimitResult.reset_at 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar clinic_id do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinic_id) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Clinic not found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicId = profile.clinic_id
    console.log('Clinic ID:', clinicId)

    // Buscar todos os módulos do catálogo
    const { data: catalog, error: catalogError } = await supabase
      .from('module_catalog')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (catalogError) {
      console.error('Catalog error:', catalogError)
      throw catalogError
    }

    // Buscar módulos contratados pela clínica
    const { data: clinicModules, error: clinicModulesError } = await supabase
      .from('clinic_modules')
      .select('module_catalog_id, is_active')
      .eq('clinic_id', clinicId)

    if (clinicModulesError) {
      console.error('Clinic modules error:', clinicModulesError)
      throw clinicModulesError
    }

    // Buscar dependências
    const { data: dependencies, error: depsError } = await supabase
      .from('module_dependencies')
      .select('module_id, depends_on_module_id')

    if (depsError) {
      console.error('Dependencies error:', depsError)
      throw depsError
    }

    // Criar mapa de módulos contratados
    const clinicModulesMap = new Map(
      clinicModules?.map((cm) => [cm.module_catalog_id, cm.is_active]) || []
    )

    // Identificar módulos ativos
    const activeModuleIds = new Set(
      clinicModules?.filter((cm) => cm.is_active).map((cm) => cm.module_catalog_id) || []
    )

    // Processar cada módulo
    const modules = catalog?.map((module) => {
      const isSubscribed = clinicModulesMap.has(module.id)
      const isActive = clinicModulesMap.get(module.id) || false

      // Verificar dependências para ativar
      const moduleDeps = dependencies?.filter((d) => d.module_id === module.id) || []
      const unmetDeps = moduleDeps
        .filter((dep) => !activeModuleIds.has(dep.depends_on_module_id))
        .map((dep) => catalog?.find((m) => m.id === dep.depends_on_module_id)?.module_key)
        .filter(Boolean)

      const canActivate = unmetDeps.length === 0

      // Verificar dependências reversas para desativar
      const reverseDeps = dependencies?.filter((d) => d.depends_on_module_id === module.id) || []
      const blockingDeps = reverseDeps
        .filter((dep) => activeModuleIds.has(dep.module_id))
        .map((dep) => catalog?.find((m) => m.id === dep.module_id)?.module_key)
        .filter(Boolean)

      const canDeactivate = blockingDeps.length === 0

      return {
        id: module.id,
        module_key: module.module_key,
        name: module.name,
        description: module.description,
        category: module.category,
        icon: module.icon,
        is_subscribed: isSubscribed,
        is_active: isActive,
        can_activate: canActivate,
        can_deactivate: canDeactivate,
        unmet_dependencies: unmetDeps,
        blocking_dependencies: blockingDeps,
      }
    })

    console.log('Modules processed:', modules?.length)

    return new Response(
      JSON.stringify({ modules }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-my-modules:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})