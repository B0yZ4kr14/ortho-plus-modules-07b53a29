import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('sugerir-sangria-ia function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clinicId, valorAtualCaixa } = await req.json()

    // Buscar histórico de incidentes
    const { data: incidentes, error: incidentesError } = await supabase
      .from('caixa_incidentes')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('data_incidente', { ascending: false })
      .limit(100)

    if (incidentesError) throw incidentesError

    // Buscar padrões de sangria
    const { data: sangrias, error: sangriasError } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('tipo', 'SANGRIA')
      .order('created_at', { ascending: false })
      .limit(50)

    if (sangriasError) throw sangriasError

    // Análise de risco baseada em ML simplificado
    const horaAtual = new Date().getHours()
    const diaSemanAtual = new Date().getDay()

    // Calcular incidentes por horário
    const incidentesPorHorario = incidentes?.reduce((acc, inc) => {
      const hora = new Date(inc.data_incidente).getHours()
      if (!acc[hora]) {
        acc[hora] = { count: 0, totalPerdido: 0 }
      }
      acc[hora].count += 1
      acc[hora].totalPerdido += Number(inc.valor_perdido || 0)
      return acc
    }, {} as Record<number, { count: number; totalPerdido: number }>) || {}

    // Calcular risco para hora atual
    const riscoPorHora = incidentesPorHorario[horaAtual] || { count: 0, totalPerdido: 0 }
    const riscoPercentual = incidentes && incidentes.length > 0
      ? (riscoPorHora.count / incidentes.length) * 100
      : 0

    // Calcular threshold de sangria baseado em histórico
    const mediaValorSangrias = sangrias && sangrias.length > 0
      ? sangrias.reduce((sum, s) => sum + Number(s.valor), 0) / sangrias.length
      : 500 // R$ 500 default

    // Lógica de decisão IA
    let deveSugerirSangria = false
    let motivo = ''
    let valorSugerido = 0

    // Regra 1: Valor alto em horário de risco
    if (valorAtualCaixa > mediaValorSangrias * 1.5 && riscoPercentual > 10) {
      deveSugerirSangria = true
      motivo = `Alto risco detectado: ${riscoPercentual.toFixed(1)}% dos incidentes ocorrem neste horário (${horaAtual}h)`
      valorSugerido = Math.floor(valorAtualCaixa - mediaValorSangrias)
    }

    // Regra 2: Valor muito alto independente do horário
    if (valorAtualCaixa > 2000) {
      deveSugerirSangria = true
      motivo = motivo || `Valor em caixa muito alto: R$ ${valorAtualCaixa.toFixed(2)}`
      valorSugerido = Math.floor(valorAtualCaixa - 1000) // Manter no máximo R$ 1000
    }

    // Regra 3: Dia da semana de risco (sexta e sábado)
    if ((diaSemanAtual === 5 || diaSemanAtual === 6) && valorAtualCaixa > 1500) {
      deveSugerirSangria = true
      motivo = motivo || 'Fim de semana: período de maior risco de incidentes'
      valorSugerido = Math.floor(valorAtualCaixa * 0.6) // Sangrar 60%
    }

    // Horários específicos de risco (após 18h)
    if (horaAtual >= 18 && valorAtualCaixa > 1200) {
      deveSugerirSangria = true
      motivo = motivo || 'Horário noturno: recomendado reduzir valor em caixa'
      valorSugerido = Math.floor(valorAtualCaixa * 0.7)
    }

    // Análise preditiva usando padrões históricos
    const incidentesNaHora = incidentes?.filter(inc => {
      const hora = new Date(inc.data_incidente).getHours()
      return hora === horaAtual
    }).length || 0

    const riscoPredito = incidentes && incidentes.length > 0
      ? (incidentesNaHora / incidentes.length) * 100
      : 0

    console.log(`📊 Análise IA: Valor=${valorAtualCaixa}, Hora=${horaAtual}h, Risco=${riscoPercentual.toFixed(1)}%, Sugerir=${deveSugerirSangria}`)

    return new Response(
      JSON.stringify({
        deveSugerirSangria,
        valorSugerido,
        motivo,
        analise: {
          valorAtualCaixa,
          horaAtual,
          diaSemanAtual,
          riscoPercentual: Number(riscoPercentual.toFixed(2)),
          riscoPredito: Number(riscoPredito.toFixed(2)),
          mediaValorSangrias: Number(mediaValorSangrias.toFixed(2)),
          totalIncidentes: incidentes?.length || 0,
          incidentesNaHora,
          horariosRisco: Object.keys(incidentesPorHorario)
            .sort((a, b) => incidentesPorHorario[b].count - incidentesPorHorario[a].count)
            .slice(0, 3)
            .map(h => ({
              hora: parseInt(h),
              incidentes: incidentesPorHorario[h].count,
              perdaMedia: incidentesPorHorario[h].totalPerdido / incidentesPorHorario[h].count
            }))
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sugerir-sangria-ia:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
