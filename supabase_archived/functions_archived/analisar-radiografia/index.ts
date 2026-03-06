import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analise_id, imagem_url } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Atualizar status para PROCESSANDO
    await supabaseClient
      .from('analises_radiograficas')
      .update({ status_analise: 'PROCESSANDO' })
      .eq('id', analise_id);

    // Chamar IA para análise
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de radiografias odontológicas. Analise a imagem fornecida e identifique:
1. Cáries (localização, severidade)
2. Fraturas dentárias
3. Problemas periodontais
4. Lesões periapicais
5. Necessidade de tratamento de canal
6. Outras anomalias

Para cada problema detectado, forneça:
- Tipo de problema
- Dente afetado (código FDI)
- Localização específica
- Severidade (LEVE, MODERADA, GRAVE)
- Confiança da detecção (0-100%)
- Sugestão de tratamento
- Se é urgente ou não

Responda em formato JSON estruturado.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta radiografia odontológica e detecte todos os problemas visíveis.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imagem_url
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'registrar_analise',
              description: 'Registrar resultado da análise radiográfica',
              parameters: {
                type: 'object',
                properties: {
                  problemas_detectados: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        tipo_problema: { type: 'string', enum: ['CARIE', 'FRATURA', 'PERIODONTAL', 'IMPLANTE_NECESSARIO', 'CANAL', 'LESAO_PERIAPICAL', 'OUTROS'] },
                        dente_codigo: { type: 'string' },
                        localizacao: { type: 'string' },
                        severidade: { type: 'string', enum: ['LEVE', 'MODERADA', 'GRAVE'] },
                        confianca: { type: 'number' },
                        descricao: { type: 'string' },
                        sugestao_tratamento: { type: 'string' },
                        urgente: { type: 'boolean' }
                      },
                      required: ['tipo_problema', 'severidade', 'confianca', 'descricao']
                    }
                  },
                  sugestoes_gerais: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  observacoes_ia: { type: 'string' }
                },
                required: ['problemas_detectados', 'sugestoes_gerais', 'observacoes_ia']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'registrar_analise' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add funds to your Lovable AI workspace.');
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const resultado = JSON.parse(toolCall.function.arguments);

    // Calcular confidence score médio
    const avgConfidence = resultado.problemas_detectados.reduce((sum: number, p: any) => sum + p.confianca, 0) / 
                         (resultado.problemas_detectados.length || 1);

    // Atualizar análise com resultado
    await supabaseClient
      .from('analises_radiograficas')
      .update({
        status_analise: 'CONCLUIDA',
        resultado_ia: resultado,
        problemas_detectados: resultado.problemas_detectados.length,
        confidence_score: avgConfidence,
      })
      .eq('id', analise_id);

    // Inserir problemas detectados
    if (resultado.problemas_detectados.length > 0) {
      await supabaseClient
        .from('problemas_radiograficos')
        .insert(
          resultado.problemas_detectados.map((p: any) => ({
            analise_id,
            ...p,
          }))
        );
    }

    // Registrar audit log
    await supabaseClient.from('audit_logs').insert({
      clinic_id: (await supabaseClient.from('analises_radiograficas').select('clinic_id').eq('id', analise_id).single()).data?.clinic_id,
      action: 'IA_RADIOGRAFIA_ANALISE',
      details: {
        analise_id,
        problemas_detectados: resultado.problemas_detectados.length,
        confidence_score: avgConfidence,
      },
    });

    return new Response(
      JSON.stringify({ success: true, resultado }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error analyzing radiography:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
