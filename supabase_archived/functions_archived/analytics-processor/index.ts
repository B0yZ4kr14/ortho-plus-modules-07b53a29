import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * FASE 0 - T0.2: ANALYTICS PROCESSOR (Consolidado)
 * Consolida 4 funções de analytics/gamificação em uma única função
 * 
 * Actions suportadas:
 * - loyalty-points: Processa pontos de fidelidade
 * - gamification-goals: Processa metas de gamificação
 * - bi-export: Agenda exportação de BI
 * - onboarding-analytics: Salva analytics de onboarding
 */

interface AnalyticsProcessorRequest {
  action: 'loyalty-points' | 'gamification-goals' | 'bi-export' | 'onboarding-analytics';
  clinicId?: string;
  userId?: string;
  patientId?: string;
  points?: number;
  goalType?: string;
  analyticsData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const { action, clinicId, userId, patientId, points, goalType, analyticsData }: AnalyticsProcessorRequest = await req.json();

    console.log(`Analytics Processor - Action: ${action}, Clinic: ${clinicId || 'N/A'}`);

    let result;

    switch (action) {
      case 'loyalty-points':
        if (!clinicId || !patientId) throw new Error('clinicId and patientId required');
        result = await processLoyaltyPoints(supabase, clinicId, patientId, points || 0);
        break;
      
      case 'gamification-goals':
        if (!clinicId || !userId) throw new Error('clinicId and userId required');
        result = await processGamificationGoals(supabase, clinicId, userId, goalType);
        break;
      
      case 'bi-export':
        if (!clinicId) throw new Error('clinicId required');
        result = await scheduleBIExport(supabase, clinicId);
        break;
      
      case 'onboarding-analytics':
        if (!analyticsData) throw new Error('analyticsData required');
        result = await saveOnboardingAnalytics(supabase, analyticsData);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics Processor Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function processLoyaltyPoints(supabase: any, clinicId: string, patientId: string, points: number) {
  // Busca ou cria registro de fidelidade
  const { data: loyalty, error } = await supabase
    .from('fidelidade_pacientes')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;

  if (!loyalty) {
    // Cria novo registro
    const { data: newLoyalty } = await supabase
      .from('fidelidade_pacientes')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        pontos_acumulados: points,
        nivel: 'BRONZE'
      })
      .select()
      .single();

    return { patientId, pointsAdded: points, totalPoints: points, level: 'BRONZE', isNew: true };
  }

  // Atualiza pontos
  const newTotal = loyalty.pontos_acumulados + points;
  let newLevel = loyalty.nivel;

  // Calcula novo nível
  if (newTotal >= 1000) newLevel = 'PLATINUM';
  else if (newTotal >= 500) newLevel = 'GOLD';
  else if (newTotal >= 100) newLevel = 'SILVER';

  await supabase
    .from('fidelidade_pacientes')
    .update({
      pontos_acumulados: newTotal,
      nivel: newLevel,
      ultima_atualizacao: new Date().toISOString()
    })
    .eq('id', loyalty.id);

  // Registra transação de pontos
  await supabase
    .from('fidelidade_transacoes')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      tipo: 'CREDITO',
      pontos: points,
      descricao: 'Pontos por consulta realizada'
    });

  return { 
    patientId, 
    pointsAdded: points, 
    totalPoints: newTotal, 
    level: newLevel, 
    levelUp: newLevel !== loyalty.nivel 
  };
}

async function processGamificationGoals(supabase: any, clinicId: string, userId: string, goalType?: string) {
  // Busca metas ativas do usuário
  const { data: goals } = await supabase
    .from('gamification_goals')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .gte('deadline', new Date().toISOString());

  const goalsProcessed = [];

  for (const goal of goals || []) {
    if (goalType && goal.type !== goalType) continue;

    // Calcula progresso (implementação simplificada)
    let progress = 0;
    let isCompleted = false;

    switch (goal.type) {
      case 'CONSULTAS_MES':
        const { count: consultasCount } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('dentist_id', userId)
          .eq('status', 'CONCLUIDA')
          .gte('start_time', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        progress = (consultasCount / goal.target_value) * 100;
        isCompleted = consultasCount >= goal.target_value;
        break;

      case 'RECEITA_MES':
        const { data: receitas } = await supabase
          .from('contas_receber')
          .select('valor_pago')
          .eq('clinic_id', clinicId)
          .eq('status', 'PAGO')
          .gte('data_pagamento', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        const totalReceita = receitas?.reduce((sum: number, r: any) => sum + (r.valor_pago || 0), 0) || 0;
        progress = (totalReceita / goal.target_value) * 100;
        isCompleted = totalReceita >= goal.target_value;
        break;
    }

    await supabase
      .from('gamification_goals')
      .update({
        current_value: Math.round(progress),
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', goal.id);

    goalsProcessed.push({ goalId: goal.id, progress, isCompleted });
  }

  return { userId, goalsProcessed: goalsProcessed.length, goals: goalsProcessed };
}

async function scheduleBIExport(supabase: any, clinicId: string) {
  // Cria job de exportação de BI
  const { data: exportJob } = await supabase
    .from('bi_export_jobs')
    .insert({
      clinic_id: clinicId,
      export_type: 'MONTHLY_REPORT',
      scheduled_for: new Date(Date.now() + 3600000).toISOString(), // +1 hora
      status: 'SCHEDULED',
      format: 'PDF'
    })
    .select()
    .single();

  return { clinicId, exportJobId: exportJob.id, scheduled_for: exportJob.scheduled_for };
}

async function saveOnboardingAnalytics(supabase: any, analyticsData: any) {
  const { userId, clinicId, step, action, duration, metadata } = analyticsData;

  await supabase
    .from('onboarding_analytics')
    .insert({
      user_id: userId,
      clinic_id: clinicId,
      step_name: step,
      action_type: action,
      duration_seconds: duration,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

  return { userId, step, action, saved_at: new Date().toISOString() };
}
