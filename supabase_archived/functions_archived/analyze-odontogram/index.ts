import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { prontuarioId } = await req.json();

    if (!prontuarioId) {
      throw new Error('prontuarioId é obrigatório');
    }

    // Buscar dados do prontuário
    const { data: prontuario, error: prontuarioError } = await supabase
      .from('prontuarios')
      .select('patient_name, clinic_id')
      .eq('id', prontuarioId)
      .single();

    if (prontuarioError || !prontuario) {
      throw new Error('Prontuário não encontrado');
    }

    // Buscar dados do odontograma
    const { data: teethData, error: teethError } = await supabase
      .from('pep_odontograma_data')
      .select('id, tooth_number, status, notes')
      .eq('prontuario_id', prontuarioId);

    if (teethError) {
      throw new Error('Erro ao buscar dados do odontograma');
    }

    // Filtrar apenas dentes problemáticos
    const problematicTeeth = teethData?.filter(tooth => 
      tooth.status !== 'higido' && tooth.status !== 'ausente'
    ) || [];

    if (problematicTeeth.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: 'Nenhum dente problemático encontrado. Condição dentária saudável!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar prompt para Lovable AI
    const prompt = `Você é um assistente odontológico especializado em análise de condições dentárias e planejamento de tratamentos.

Paciente: ${prontuario.patient_name}

Análise do Odontograma (Sistema FDI):
${problematicTeeth.map(tooth => `
Dente ${tooth.tooth_number}: ${tooth.status}${tooth.notes ? ` - Observações: ${tooth.notes}` : ''}
`).join('\n')}

Com base nesta análise, forneça:
1. Sugestões de procedimentos necessários para cada dente problemático
2. Prioridade de tratamento (alta, média, baixa)
3. Estimativa de custo em reais (baseado em valores médios de mercado)
4. Tempo estimado de tratamento
5. Observações clínicas relevantes

Retorne as sugestões em formato estruturado para facilitar o planejamento.`;

    // Chamar Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente odontológico especializado. Forneça análises precisas, práticas e baseadas em boas práticas clínicas. Seja conciso e objetivo.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_treatments",
              description: "Retorna sugestões estruturadas de tratamentos dentários.",
              parameters: {
                type: "object",
                properties: {
                  treatments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tooth_number: { type: "integer" },
                        tooth_status: { type: "string" },
                        procedure: { type: "string" },
                        priority: { type: "string", enum: ["alta", "media", "baixa"] },
                        estimated_cost: { type: "number" },
                        estimated_duration: { type: "string" },
                        clinical_notes: { type: "string" }
                      },
                      required: ["tooth_number", "procedure", "priority", "estimated_cost"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["treatments"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_treatments" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na Lovable AI:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns instantes.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Créditos insuficientes no Lovable AI. Entre em contato com o suporte.');
      }
      
      throw new Error('Erro ao processar análise com IA');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Resposta inválida da IA');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    // Registrar análise no audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: prontuario.clinic_id,
        user_id: user.id,
        action: 'ODONTOGRAM_AI_ANALYSIS',
        details: {
          prontuario_id: prontuarioId,
          problematic_teeth_count: problematicTeeth.length,
          suggestions_count: suggestions.treatments?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        suggestions: suggestions.treatments || [],
        patient_name: prontuario.patient_name,
        analysis_date: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em analyze-odontogram:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
