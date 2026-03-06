import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MovimentacaoHistorica {
  data: string;
  quantidade: number;
  tipo: string;
}

interface PrevisaoInput {
  produtoId: string;
  produtoNome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  movimentacoes: MovimentacaoHistorica[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { produtos, eventosFuturos }: { 
      produtos: PrevisaoInput[],
      eventosFuturos?: Array<{
        tipo: string;
        dataInicio: string;
        dataFim: string;
        impactoEstimado: number;
        descricao: string;
      }>
    } = await req.json();

    if (!produtos || produtos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum produto fornecido para análise' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Analisando ${produtos.length} produtos para previsão de reposição`);

    // Preparar dados para análise
    const dadosAnalise = produtos.map(p => {
      // Calcular estatísticas básicas
      const saidasUltimos30Dias = p.movimentacoes
        .filter(m => m.tipo === 'SAIDA' || m.tipo === 'PERDA')
        .filter(m => {
          const dataMovimento = new Date(m.data);
          const dataLimite = new Date();
          dataLimite.setDate(dataLimite.getDate() - 30);
          return dataMovimento >= dataLimite;
        });

      const consumoTotal30Dias = saidasUltimos30Dias.reduce((sum, m) => sum + m.quantidade, 0);
      const consumoMedioDiario = consumoTotal30Dias / 30;

      // Agrupar consumo por semana para detectar padrões
      const consumoPorSemana = new Map<number, number>();
      p.movimentacoes.forEach(m => {
        if (m.tipo === 'SAIDA' || m.tipo === 'PERDA') {
          const data = new Date(m.data);
          const semana = Math.floor((Date.now() - data.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const atual = consumoPorSemana.get(semana) || 0;
          consumoPorSemana.set(semana, atual + m.quantidade);
        }
      });

      return {
        nome: p.produtoNome,
        quantidadeAtual: p.quantidadeAtual,
        quantidadeMinima: p.quantidadeMinima,
        consumoMedioDiario,
        consumoTotal30Dias,
        diasParaEstoqueZero: consumoMedioDiario > 0 ? p.quantidadeAtual / consumoMedioDiario : 999,
        movimentacoesPorSemana: Array.from(consumoPorSemana.entries())
          .sort((a, b) => a[0] - b[0])
          .slice(0, 12), // Últimas 12 semanas
      };
    });

    // Preparar informações sobre eventos futuros se houver
    const eventosInfo = eventosFuturos && eventosFuturos.length > 0 ? `

EVENTOS FUTUROS QUE IMPACTARÃO O CONSUMO:
${eventosFuturos.map(e => `
- ${e.tipo}: ${e.descricao}
  Período: ${e.dataInicio} a ${e.dataFim}
  Impacto estimado no consumo: ${e.impactoEstimado > 0 ? '+' : ''}${e.impactoEstimado}%
`).join('')}

IMPORTANTE: Ajuste suas previsões considerando estes eventos futuros. Por exemplo:
- PROMOCAO ou EXPANSAO aumentarão o consumo
- FERIAS ou RECESSO reduzirão o consumo
` : '';

    // Chamar Lovable AI para análise preditiva
    const prompt = `Você é um especialista em previsão de demanda e gestão de estoque. Analise os seguintes dados de consumo e forneça previsões precisas de quando cada produto precisará ser reposto.

DADOS DOS PRODUTOS:
${JSON.stringify(dadosAnalise, null, 2)}
${eventosInfo}

ANÁLISE SOLICITADA:
1. Para cada produto, analise padrões de consumo histórico
2. Identifique sazonalidade e tendências (consumo aumentando/diminuindo)
3. Detecte outliers e eventos atípicos
4. Preveja quando o estoque atingirá o mínimo e quando zerará
5. Sugira quantidade ideal de reposição baseada em:
   - Padrão de consumo
   - Variação sazonal
   - Lead time médio de 7 dias
   - Margem de segurança de 20%

RETORNE em formato JSON estruturado com esta estrutura EXATA (não adicione texto antes ou depois do JSON):
{
  "previsoes": [
    {
      "produto": "nome do produto",
      "status": "CRITICO" | "ALERTA" | "NORMAL" | "EXCESSO",
      "diasAteEstoqueMinimo": número (inteiro),
      "diasAteEstoqueZero": número (inteiro),
      "dataEstimadaReposicao": "YYYY-MM-DD",
      "quantidadeSugerida": número (inteiro),
      "tendencia": "CRESCENTE" | "ESTAVEL" | "DECRESCENTE",
      "sazonalidade": "ALTA" | "MEDIA" | "BAIXA",
      "confianca": número entre 0 e 1 (ex: 0.85),
      "justificativa": "explicação breve da previsão",
      "recomendacao": "ação recomendada",
      "metodoTradicional": {
        "diasAteEstoqueZero": número (inteiro, baseado apenas em consumo médio simples dos últimos 30 dias),
        "quantidadeSugerida": número (inteiro, quantidade fixa sem considerar tendências)
      }
    }
  ],
  "resumo": {
    "produtosCriticos": número,
    "produtosAlerta": número,
    "economiaEstimada": número,
    "observacoes": "insights gerais sobre o estoque"
  }
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

    console.log('Enviando dados para análise de IA...');

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
            content: 'Você é um especialista em previsão de demanda e análise de séries temporais. Sempre retorne respostas em formato JSON válido sem texto adicional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Baixa temperatura para respostas mais determinísticas
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace Lovable AI.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await aiResponse.text();
      console.error('Erro na API de IA:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('Resposta da IA recebida:', aiContent.substring(0, 200));

    // Parsear resposta JSON da IA (remover possível markdown)
    let jsonContent = aiContent.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const previsoes = JSON.parse(jsonContent);

    // Registrar análise no audit log
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      
      if (user) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('clinic_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabaseClient
            .from('audit_logs')
            .insert({
              clinic_id: profile.clinic_id,
              user_id: user.id,
              action: 'PREVISAO_REPOSICAO_GERADA',
              details: {
                produtos_analisados: produtos.length,
                produtos_criticos: previsoes.resumo?.produtosCriticos || 0,
                timestamp: new Date().toISOString(),
              },
            });
        }
      }
    }

    return new Response(
      JSON.stringify(previsoes),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro na edge function prever-reposicao:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao gerar previsão de reposição',
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});