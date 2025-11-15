import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, tipoRadiografia, patientId, prontuarioId } = await req.json();
    
    if (!imageBase64 || !tipoRadiografia || !patientId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: imageBase64, tipoRadiografia, patientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Gerar prompt específico para tipo de radiografia
    const promptMap: Record<string, string> = {
      PERIAPICAL: 'Foque em: ápices radiculares, lesões periapicais, tratamentos endodônticos.',
      BITE_WING: 'Foque em: cáries interproximais, crista óssea alveolar, adaptação de restaurações.',
      PANORAMICA: 'Foque em: visão geral, dentes inclusos, lesões ósseas, ATM, seios maxilares.',
      OCLUSAL: 'Foque em: fraturas, dentes inclusos, lesões na área oclusal.',
    };

    const specificPrompt = promptMap[tipoRadiografia] || '';
    const fullPrompt = `Você é um especialista em análise de radiografias odontológicas. Analise a imagem e retorne um JSON estruturado com:

1. problemas_detectados: Array de objetos com:
   - tipo: tipo do problema (cárie, fratura, reabsorção, etc.)
   - localizacao: dente(s) afetado(s)
   - severidade: baixa | moderada | alta | crítica
   - descricao: descrição detalhada
   - recomendacao: tratamento recomendado

2. observacoes_gerais: String com observações gerais
3. dentes_avaliados: Array com números dos dentes visíveis
4. qualidade_imagem: baixa | regular | boa | excelente
5. requer_avaliacao_especialista: boolean

${specificPrompt}

IMPORTANTE: Seja preciso e conservador. Use nomenclatura FDI.`;

    const startTime = Date.now();

    // Chamar Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: fullPrompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    const processingTimeMs = Date.now() - startTime;

    // Parse resultado IA
    let resultadoIA;
    try {
      // Extrair JSON do response (pode vir com markdown)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      resultadoIA = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (e) {
      console.error('Erro ao parsear resposta IA:', e);
      resultadoIA = {
        problemas_detectados: [],
        observacoes_gerais: aiContent,
        dentes_avaliados: [],
        qualidade_imagem: 'regular',
        requer_avaliacao_especialista: true
      };
    }

    // Calcular confidence score
    const confidence = resultadoIA.qualidade_imagem === 'excelente' ? 0.95 :
                      resultadoIA.qualidade_imagem === 'boa' ? 0.85 :
                      resultadoIA.qualidade_imagem === 'regular' ? 0.70 : 0.50;

    // Salvar no Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clínica não encontrada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fazer upload da imagem para Storage
    const imageBuffer = Uint8Array.from(atob(imageBase64.split(',')[1]), c => c.charCodeAt(0));
    const fileName = `${profile.clinic_id}/${patientId}/${crypto.randomUUID()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('radiografias')
      .upload(fileName, imageBuffer, { contentType: 'image/jpeg' });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('radiografias')
      .getPublicUrl(fileName);

    // Inserir análise no banco
    const { data: analise, error: insertError } = await supabase
      .from('analises_radiograficas')
      .insert({
        clinic_id: profile.clinic_id,
        patient_id: patientId,
        prontuario_id: prontuarioId,
        created_by: user.id,
        tipo_radiografia: tipoRadiografia,
        imagem_url: publicUrl,
        imagem_storage_path: fileName,
        resultado_ia: resultadoIA,
        confidence_score: confidence,
        problemas_detectados: resultadoIA.problemas_detectados?.length || 0,
        status_analise: 'concluida',
        ai_model_version: 'google/gemini-2.5-pro',
        ai_processing_time_ms: processingTimeMs,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir análise:', insertError);
      throw insertError;
    }

    console.log(`✅ Análise concluída em ${processingTimeMs}ms - Confiança: ${(confidence * 100).toFixed(1)}%`);

    return new Response(
      JSON.stringify({
        analiseId: analise.id,
        resultadoIA,
        confidence,
        processingTimeMs,
        imagemUrl: publicUrl,
        requerAvaliacaoEspecialista: resultadoIA.requer_avaliacao_especialista,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise de radiografia:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao processar análise',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
