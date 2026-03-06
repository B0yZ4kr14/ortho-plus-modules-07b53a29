import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('recommend-module-sequence function started')

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

    // Buscar clinic_id
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

    // Buscar informações da clínica
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single()

    // Buscar módulos ativos e inativos
    const { data: clinicModules } = await supabase
      .from('clinic_modules')
      .select(`
        is_active,
        module_catalog:module_catalog_id (
          module_key,
          name,
          category
        )
      `)
      .eq('clinic_id', clinicId)

    const activeModules = clinicModules
      ?.filter((m) => m.is_active)
      .map((m) => (m.module_catalog as any)?.name)
      .filter(Boolean) || []

    const inactiveModules = clinicModules
      ?.filter((m) => !m.is_active)
      .map((m) => (m.module_catalog as any)?.name)
      .filter(Boolean) || []

    // Buscar contagem de pacientes
    const { count: patientCount } = await supabase
      .from('prontuarios')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)

    // Buscar histórico de analytics de onboarding para entender maturidade
    const { data: analytics } = await supabase
      .from('onboarding_analytics')
      .select('event_type, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(50)

    const hasCompletedOnboarding = analytics?.some(a => a.event_type === 'COMPLETED') || false
    const daysSinceCreation = analytics && analytics.length > 0 
      ? Math.floor((Date.now() - new Date(analytics[analytics.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Preparar prompt para IA
    const systemPrompt = `Você é um especialista em gestão de clínicas odontológicas e adoção progressiva de tecnologia.
Sua tarefa é analisar o perfil da clínica e recomendar uma sequência ideal de ativação de módulos baseada em:
1. Padrões de clínicas bem-sucedidas
2. Dependências entre módulos
3. Complexidade de implementação
4. Valor agregado vs esforço de adoção
5. Maturidade digital da clínica

Forneça uma recomendação de roadmap progressivo de adoção em 3-4 fases, cada uma com 3-5 módulos.
Priorize módulos que:
- Resolvem dores críticas primeiro (gestão básica)
- Têm menor curva de aprendizado
- Geram valor rapidamente
- Preparam terreno para módulos avançados

Responda APENAS com JSON válido no formato:
{
  "phases": [
    {
      "name": "Fase 1: Fundação",
      "timeline": "Semanas 1-2",
      "modules": ["Módulo A", "Módulo B"],
      "rationale": "Por que começar com estes módulos",
      "benefits": ["Benefício 1", "Benefício 2"]
    }
  ],
  "insights": "Análise geral do perfil da clínica e recomendações estratégicas"
}`

    const userPrompt = `Perfil da Clínica:
- Nome: ${clinic?.name || 'Não informado'}
- Pacientes cadastrados: ${patientCount || 0}
- Dias desde criação: ${daysSinceCreation}
- Onboarding concluído: ${hasCompletedOnboarding ? 'Sim' : 'Não'}
- Módulos ativos (${activeModules.length}): ${activeModules.join(', ') || 'Nenhum'}
- Módulos disponíveis inativos (${inactiveModules.length}): ${inactiveModules.join(', ') || 'Nenhum'}

Módulos disponíveis do sistema:
Gestão: DASHBOARD, PACIENTES, DENTISTAS, FUNCIONARIOS, AGENDA, PROCEDIMENTOS
Clínico: PEP, ODONTOGRAMA, IA_RADIOGRAFIA, TELEODONTOLOGIA
Financeiro: FINANCEIRO, ORCAMENTOS, CONTRATOS, SPLIT_PAGAMENTO, COBRANCA, CRYPTO_PAGAMENTOS
Operacional: ESTOQUE, INVENTARIO, REQUISICOES, PEDIDOS
Marketing: CRM, CAMPANHAS, BI, RELATORIOS
Compliance: LGPD, ASSINATURA_ICP, AUDITORIA

Recomende sequência ideal de adoção dos módulos INATIVOS baseado no perfil e maturidade da clínica.`

    console.log('Calling Lovable AI for module sequence recommendation...')

    // Chamar IA via Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
            code: 'RATE_LIMIT'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Créditos da IA esgotados. Entre em contato com suporte.',
            code: 'PAYMENT_REQUIRED'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in AI response')
    }

    console.log('AI response received:', content.substring(0, 200))

    // Parse resposta JSON
    let recommendation
    try {
      // Remover markdown code blocks se presentes
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recommendation = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Failed to parse AI recommendation')
    }

    // Registrar auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinicId,
      action: 'MODULE_SEQUENCE_RECOMMENDED',
      details: {
        phases_count: recommendation.phases?.length || 0,
        patient_count: patientCount,
        active_modules: activeModules.length,
      },
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendation,
        clinic_profile: {
          patient_count: patientCount,
          days_since_creation: daysSinceCreation,
          active_modules_count: activeModules.length,
          inactive_modules_count: inactiveModules.length,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in recommend-module-sequence:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})