import { serve } from 'https://deno.land/std@0.220.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduleExportRequest {
  dashboardName: string
  exportFormat: 'pdf' | 'excel' | 'csv'
  frequency: 'daily' | 'weekly' | 'monthly'
  email: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Buscar clinic_id do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Perfil não encontrado')
    }

    // Verificar se é ADMIN
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError || roleData?.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem agendar exportações' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { dashboardName, exportFormat, frequency, email }: ScheduleExportRequest = await req.json()

    // Validações
    if (!dashboardName || !exportFormat || !frequency || !email) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calcular próxima data de envio
    const now = new Date()
    let nextSendAt = new Date()

    switch (frequency) {
      case 'daily':
        nextSendAt.setDate(now.getDate() + 1)
        break
      case 'weekly':
        nextSendAt.setDate(now.getDate() + 7)
        break
      case 'monthly':
        nextSendAt.setMonth(now.getMonth() + 1)
        break
    }

    // Criar agendamento
    const { data: scheduled, error: scheduleError } = await supabaseClient
      .from('scheduled_exports')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        dashboard_name: dashboardName,
        export_format: exportFormat,
        frequency,
        email,
        next_send_at: nextSendAt.toISOString(),
      })
      .select()
      .single()

    if (scheduleError) {
      throw scheduleError
    }

    // Registrar no audit log
    await supabaseClient.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action: 'BI_EXPORT_SCHEDULED',
      details: {
        dashboard_name: dashboardName,
        export_format: exportFormat,
        frequency,
        email,
        scheduled_id: scheduled.id,
      },
    })

    console.log('Exportação agendada:', scheduled)

    return new Response(
      JSON.stringify({
        success: true,
        scheduled,
        message: `Exportação agendada com sucesso. Próximo envio: ${nextSendAt.toLocaleDateString('pt-BR')}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro ao agendar exportação:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
