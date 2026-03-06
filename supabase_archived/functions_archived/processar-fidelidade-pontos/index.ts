import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PontosRequest {
  patient_id: string;
  tipo: 'GANHO_CONSULTA' | 'GANHO_PAGAMENTO' | 'GANHO_INDICACAO' | 'RESGATE';
  valor_referencia?: number;
  descricao: string;
  referencia_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Não autenticado');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Perfil não encontrado');
    }

    const { patient_id, tipo, valor_referencia, descricao, referencia_id }: PontosRequest = await req.json();

    console.log(`Processando pontos de fidelidade: ${tipo} para paciente ${patient_id}`);

    // Buscar configuração de fidelidade
    const { data: config, error: configError } = await supabase
      .from('fidelidade_config')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('ativo', true)
      .single();

    if (configError || !config) {
      console.error('Configuração de fidelidade não encontrada');
      throw new Error('Programa de fidelidade não configurado');
    }

    // Calcular pontos baseado no tipo
    let pontos = 0;
    switch (tipo) {
      case 'GANHO_CONSULTA':
        pontos = config.pontos_por_consulta;
        break;
      case 'GANHO_PAGAMENTO':
        pontos = Math.floor((valor_referencia || 0) * config.pontos_por_real);
        break;
      case 'GANHO_INDICACAO':
        pontos = config.pontos_indicacao;
        break;
      case 'RESGATE':
        pontos = -(valor_referencia || 0); // Pontos negativos para resgate
        break;
    }

    console.log(`Pontos calculados: ${pontos}`);

    // Buscar ou criar registro de pontos do paciente
    const { data: pontosExistentes, error: pontosError } = await supabase
      .from('fidelidade_pontos')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('patient_id', patient_id)
      .single();

    let novoPontos;
    if (pontosError && pontosError.code === 'PGRST116') {
      // Criar novo registro
      const { data, error } = await supabase
        .from('fidelidade_pontos')
        .insert({
          clinic_id: profile.clinic_id,
          patient_id,
          pontos_disponiveis: pontos,
          pontos_totais: pontos > 0 ? pontos : 0,
          nivel: 'BRONZE',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      novoPontos = data;
    } else if (pontosExistentes) {
      // Atualizar registro existente
      const novoPontosDisponiveis = pontosExistentes.pontos_disponiveis + pontos;
      const novoPontosTotais = pontosExistentes.pontos_totais + (pontos > 0 ? pontos : 0);

      // Calcular novo nível baseado em pontos totais
      const novoNivel = calcularNivel(novoPontosTotais);

      const { data, error } = await supabase
        .from('fidelidade_pontos')
        .update({
          pontos_disponiveis: novoPontosDisponiveis,
          pontos_totais: novoPontosTotais,
          nivel: novoNivel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pontosExistentes.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      novoPontos = data;
    }

    // Registrar transação de pontos
    await supabase
      .from('fidelidade_transacoes')
      .insert({
        clinic_id: profile.clinic_id,
        patient_id,
        tipo,
        pontos,
        descricao,
        referencia_id,
      });

    // Verificar badges conquistadas
    await verificarBadges(supabase, profile.clinic_id, patient_id, novoPontos);

    // Registrar log de auditoria
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        action: 'FIDELIDADE_PONTOS_PROCESSADOS',
        details: {
          patient_id,
          tipo,
          pontos,
          descricao,
          novo_saldo: novoPontos.pontos_disponiveis,
        },
      });

    console.log(`Pontos processados com sucesso: ${pontos} pontos (Saldo: ${novoPontos.pontos_disponiveis})`);

    return new Response(
      JSON.stringify({
        success: true,
        patient_id,
        tipo,
        pontos,
        novo_saldo: novoPontos.pontos_disponiveis,
        nivel: novoPontos.nivel,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro ao processar pontos de fidelidade:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar pontos de fidelidade' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Calcula o nível baseado em pontos totais
function calcularNivel(pontosTotais: number): string {
  if (pontosTotais >= 5000) return 'DIAMANTE';
  if (pontosTotais >= 2000) return 'PLATINA';
  if (pontosTotais >= 1000) return 'OURO';
  if (pontosTotais >= 500) return 'PRATA';
  return 'BRONZE';
}

// Verifica e concede badges conquistadas
async function verificarBadges(
  supabase: any,
  clinic_id: string,
  patient_id: string,
  pontos: any
) {
  // Buscar badges disponíveis
  const { data: badges, error: badgesError } = await supabase
    .from('fidelidade_badges')
    .select('*')
    .eq('clinic_id', clinic_id);

  if (badgesError || !badges) {
    console.log('Nenhuma badge configurada');
    return;
  }

  // Buscar badges já conquistadas
  const { data: badgesConquistadas, error: conquistadasError } = await supabase
    .from('fidelidade_badges_conquistadas')
    .select('badge_id')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id);

  if (conquistadasError) {
    console.error('Erro ao buscar badges conquistadas:', conquistadasError);
    return;
  }

  const badgesConquistadasIds = badgesConquistadas?.map((b: any) => b.badge_id) || [];

  // Verificar cada badge
  for (const badge of badges) {
    // Pular se já conquistou
    if (badgesConquistadasIds.includes(badge.id)) continue;

    // Avaliar critério da badge
    const criterioAtendido = avaliarCriterioBadge(badge.criterio, pontos);

    if (criterioAtendido) {
      // Conceder badge
      await supabase
        .from('fidelidade_badges_conquistadas')
        .insert({
          clinic_id,
          patient_id,
          badge_id: badge.id,
          conquistado_em: new Date().toISOString(),
        });

      console.log(`Badge "${badge.nome}" conquistada pelo paciente ${patient_id}`);
    }
  }
}

// Avalia se critério de badge foi atendido
function avaliarCriterioBadge(criterio: any, pontos: any): boolean {
  // Exemplo de critérios:
  // { tipo: 'pontos_totais', valor: 1000 }
  // { tipo: 'nivel', valor: 'OURO' }
  
  if (criterio.tipo === 'pontos_totais') {
    return pontos.pontos_totais >= criterio.valor;
  }

  if (criterio.tipo === 'nivel') {
    const niveis = ['BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE'];
    const indexAtual = niveis.indexOf(pontos.nivel);
    const indexRequerido = niveis.indexOf(criterio.valor);
    return indexAtual >= indexRequerido;
  }

  return false;
}
