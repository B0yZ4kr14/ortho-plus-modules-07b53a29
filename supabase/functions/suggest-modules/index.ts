import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('suggest-modules function started')

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

    // Parse body
    const { activeModules, inactiveModules } = await req.json()

    console.log('Generating module suggestions for clinic:', profile.clinic_id)

    // Get clinic data for context
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', profile.clinic_id)
      .single()

    // Get patient count for context
    const { count: patientCount } = await supabase
      .from('prontuarios')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)

    // Call Lovable AI for suggestions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em sistemas odontológicos. Sua função é analisar o perfil de uma clínica e sugerir módulos relevantes que ainda não estão ativos. Seja conciso e objetivo, retornando entre 3 e 5 sugestões relevantes baseadas no contexto fornecido.`,
          },
          {
            role: 'user',
            content: `Clínica: ${clinic?.name || 'N/A'}
Pacientes cadastrados: ${patientCount || 0}

Módulos ATIVOS:
${activeModules || 'Nenhum'}

Módulos INATIVOS disponíveis:
${inactiveModules || 'Nenhum'}

Analise o perfil da clínica e sugira 3-5 módulos dos inativos que seriam mais relevantes ativar com base no porte da clínica e nos módulos já ativos. Para cada sugestão, explique brevemente o motivo em uma linha.`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_modules',
              description: 'Retorna 3-5 sugestões de módulos relevantes para a clínica',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'string',
                      description: 'Uma sugestão de módulo com explicação em uma linha',
                    },
                    minItems: 3,
                    maxItems: 5,
                  },
                },
                required: ['suggestions'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_modules' } },
      }),
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const errorText = await aiResponse.text()
      console.error('AI gateway error:', aiResponse.status, errorText)
      throw new Error('AI gateway error')
    }

    const aiData = await aiResponse.json()
    console.log('AI response:', JSON.stringify(aiData, null, 2))

    // Extract suggestions from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0]
    let suggestions: string[] = []

    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments)
      suggestions = args.suggestions || []
    }

    console.log('Generated suggestions:', suggestions)

    return new Response(
      JSON.stringify({ suggestions }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in suggest-modules:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
