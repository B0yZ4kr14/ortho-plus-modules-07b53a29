import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('sincronizar-extrato-bancario function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bancoConfigId, dataInicio, dataFim } = await req.json()

    console.log(`Sincronizando extrato bancário - Config: ${bancoConfigId}`)

    // Buscar configuração do banco
    const { data: config, error: configError } = await supabase
      .from('banco_config')
      .select('*')
      .eq('id', bancoConfigId)
      .single()

    if (configError || !config) {
      throw new Error('Configuração bancária não encontrada')
    }

    // SIMULAÇÃO DE INTEGRAÇÃO COM API BANCÁRIA
    // Em produção, fazer request real para API do banco (Banco do Brasil, Itaú, Bradesco, etc)
    console.log(`Consultando API do ${config.banco_nome}...`)
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simular dados de extrato bancário
    const extratoSimulado = gerarExtratoSimulado(config.clinic_id, bancoConfigId, dataInicio, dataFim)

    // Inserir lançamentos no banco
    const { data: extratos, error: extratoError } = await supabase
      .from('banco_extratos')
      .insert(extratoSimulado)
      .select()

    if (extratoError) throw extratoError

    // Atualizar última sincronização
    await supabase
      .from('banco_config')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('id', bancoConfigId)

    // Tentar conciliação automática
    const conciliados = await tentarConciliacaoAutomatica(supabase, extratos, config.clinic_id)

    // Registrar audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: config.clinic_id,
        action: 'EXTRATO_BANCARIO_SINCRONIZADO',
        details: {
          banco_config_id: bancoConfigId,
          banco: config.banco_nome,
          periodo: { inicio: dataInicio, fim: dataFim },
          lancamentos: extratos.length,
          conciliados: conciliados,
        },
      })

    console.log(`✅ ${extratos.length} lançamentos sincronizados (${conciliados} conciliados automaticamente)`)

    return new Response(
      JSON.stringify({
        success: true,
        lancamentos_sincronizados: extratos.length,
        conciliados_automaticamente: conciliados,
        extratos: extratos,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sincronizar-extrato-bancario:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Gerar dados simulados de extrato bancário (HOMOLOGAÇÃO)
function gerarExtratoSimulado(clinicId: string, bancoConfigId: string, dataInicio: string, dataFim: string) {
  const lancamentos = []
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  
  let saldoAtual = 15000.00

  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    // Simular 2-4 lançamentos por dia
    const qtdLancamentos = Math.floor(Math.random() * 3) + 2
    
    for (let i = 0; i < qtdLancamentos; i++) {
      const isCredito = Math.random() > 0.3 // 70% créditos, 30% débitos
      const valor = parseFloat((Math.random() * 500 + 50).toFixed(2))
      
      const saldoAnterior = saldoAtual
      saldoAtual = isCredito ? saldoAtual + valor : saldoAtual - valor

      lancamentos.push({
        clinic_id: clinicId,
        banco_config_id: bancoConfigId,
        data_movimento: d.toISOString().split('T')[0],
        descricao: isCredito 
          ? `CREDITO PIX - ${gerarNomeAleatorio()}`
          : `PAGAMENTO ${gerarFornecedorAleatorio()}`,
        valor: valor,
        tipo: isCredito ? 'CREDITO' : 'DEBITO',
        documento: isCredito ? `PIX${Math.floor(Math.random() * 9999999)}` : null,
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoAtual,
        conciliado: false,
        metadata: {
          origem: 'API_BANCARIA_SIMULACAO',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  return lancamentos
}

function gerarNomeAleatorio() {
  const nomes = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza']
  return nomes[Math.floor(Math.random() * nomes.length)]
}

function gerarFornecedorAleatorio() {
  const fornecedores = ['DENTAL SHOP', 'ORTHOMAIS MATERIAIS', 'DENTAL SUPPLY', 'CLINICA EQUIPAMENTOS']
  return fornecedores[Math.floor(Math.random() * fornecedores.length)]
}

// Tentar conciliação automática de lançamentos
async function tentarConciliacaoAutomatica(supabase: any, extratos: any[], clinicId: string) {
  let conciliados = 0

  for (const extrato of extratos) {
    if (extrato.tipo !== 'CREDITO') continue

    // Buscar contas a receber com valor similar na data próxima
    const { data: contasReceber } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PAGO')
      .gte('data_pagamento', new Date(new Date(extrato.data_movimento).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .lte('data_pagamento', new Date(new Date(extrato.data_movimento).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString())

    if (contasReceber && contasReceber.length > 0) {
      // Procurar match exato de valor
      const matchExato = contasReceber.find((cr: any) => Math.abs(cr.valor_pago - extrato.valor) < 0.01)
      
      if (matchExato) {
        // Conciliar automaticamente
        await supabase
          .from('banco_extratos')
          .update({
            conciliado: true,
            conta_receber_id: matchExato.id,
            observacoes: 'Conciliado automaticamente por match de valor e data',
          })
          .eq('id', extrato.id)

        conciliados++
        console.log(`✅ Conciliado: R$ ${extrato.valor} - ${extrato.descricao}`)
      }
    }
  }

  return conciliados
}