import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('gerar-sped-fiscal function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clinicId, dataInicio, dataFim } = await req.json()

    // Buscar configuração fiscal
    const { data: fiscalConfig, error: configError } = await supabase
      .from('fiscal_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    if (configError || !fiscalConfig) {
      throw new Error('Configuração fiscal não encontrada')
    }

    // Buscar NFCe emitidas no período
    const { data: nfces, error: nfcesError } = await supabase
      .from('nfce_emitidas')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('data_emissao', dataInicio)
      .lte('data_emissao', dataFim)
      .eq('status', 'AUTORIZADA')
      .order('data_emissao', { ascending: true })

    if (nfcesError) throw nfcesError

    const totalNFCe = nfces?.reduce((sum, n) => sum + Number(n.valor_total), 0) || 0

    // Gerar arquivo SPED Fiscal (formato simplificado)
    const linhasSped = []

    // Bloco 0: Abertura, Identificação e Referências
    linhasSped.push('|0000|014|0|' + dataInicio.replace(/-/g, '') + '|' + dataFim.replace(/-/g, '') + '|' + fiscalConfig.razao_social + '|' + fiscalConfig.cnpj + '||||SP||||||A|1|')
    linhasSped.push('|0001|0|')
    linhasSped.push('|0005|' + fiscalConfig.nome_fantasia + '|35|SP|' + fiscalConfig.cnpj.slice(8, 12) + '|')
    linhasSped.push('|0015|35|SP|')
    linhasSped.push('|0100|' + fiscalConfig.razao_social + '|' + fiscalConfig.cnpj + '||||||||||')
    linhasSped.push('|0150|' + fiscalConfig.cnpj + '|' + fiscalConfig.razao_social + '|SP|' + fiscalConfig.inscricao_estadual + '|||')
    linhasSped.push('|0190|' + fiscalConfig.cnpj + '|')

    // Bloco C: Documentos Fiscais I - Mercadorias (ICMS/IPI)
    linhasSped.push('|C001|0|')

    nfces?.forEach((nfce, index) => {
      const data = new Date(nfce.data_emissao).toISOString().split('T')[0].replace(/-/g, '')
      
      // Registro C100: Documento Fiscal
      linhasSped.push(`|C100|0|1|${nfce.numero_nfce}|65|00|${nfce.serie}|${data}|${data}|${Number(nfce.valor_total).toFixed(2)}|0|0|${Number(nfce.valor_total).toFixed(2)}|00|0.00|0.00|0.00|0.00|0|${nfce.chave_acesso}|`)
      
      // Registro C170: Itens do Documento (simplificado)
      linhasSped.push(`|C170|${index + 1}|SERVICO ODONTOLOGICO|1.00|UN|${Number(nfce.valor_total).toFixed(2)}|0.00|${Number(nfce.valor_total).toFixed(2)}|5102|CFOP 5102|102|00|`)
    })

    linhasSped.push('|C990|' + (linhasSped.filter(l => l.startsWith('|C')).length + 1) + '|')

    // Bloco D: Documentos Fiscais II - Serviços (ICMS)
    linhasSped.push('|D001|1|')
    linhasSped.push('|D990|2|')

    // Bloco E: Apuração do ICMS e do IPI
    linhasSped.push('|E001|0|')
    linhasSped.push('|E100|' + dataInicio.slice(0, 7).replace('-', '') + '|')
    linhasSped.push('|E110|${Number(totalNFCe).toFixed(2)}|0.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|')
    linhasSped.push('|E990|4|')

    // Bloco H: Inventário Físico
    linhasSped.push('|H001|1|')
    linhasSped.push('|H990|2|')

    // Bloco 1: Outras Informações
    linhasSped.push('|1001|1|')
    linhasSped.push('|1990|2|')

    // Bloco 9: Controle e Encerramento do Arquivo Digital
    linhasSped.push('|9001|0|')
    linhasSped.push('|9900|0000|1|')
    linhasSped.push('|9900|0001|1|')
    linhasSped.push('|9900|0005|1|')
    linhasSped.push('|9900|0015|1|')
    linhasSped.push('|9900|0100|1|')
    linhasSped.push('|9900|0150|' + (nfces?.length || 0) + '|')
    linhasSped.push('|9900|0190|1|')
    linhasSped.push('|9900|C001|1|')
    linhasSped.push('|9900|C100|' + (nfces?.length || 0) + '|')
    linhasSped.push('|9900|C170|' + (nfces?.length || 0) + '|')
    linhasSped.push('|9900|C990|1|')
    linhasSped.push('|9900|D001|1|')
    linhasSped.push('|9900|D990|1|')
    linhasSped.push('|9900|E001|1|')
    linhasSped.push('|9900|E100|1|')
    linhasSped.push('|9900|E110|1|')
    linhasSped.push('|9900|E990|1|')
    linhasSped.push('|9900|H001|1|')
    linhasSped.push('|9900|H990|1|')
    linhasSped.push('|9900|1001|1|')
    linhasSped.push('|9900|1990|1|')
    linhasSped.push('|9900|9001|1|')
    linhasSped.push('|9900|9900|' + (23 + (nfces?.length || 0) * 2) + '|')
    linhasSped.push('|9900|9990|1|')
    linhasSped.push('|9900|9999|1|')
    linhasSped.push('|9990|' + (23 + (nfces?.length || 0) * 2 + 3) + '|')
    linhasSped.push('|9999|' + (linhasSped.length + 2) + '|')

    const conteudoSped = linhasSped.join('\n')

    console.log(`✅ SPED Fiscal gerado: ${nfces?.length || 0} NFCe, Total: R$ ${totalNFCe.toFixed(2)}`)

    return new Response(
      JSON.stringify({
        success: true,
        arquivo: conteudoSped,
        estatisticas: {
          totalNFCe: nfces?.length || 0,
          valorTotal: Number(totalNFCe.toFixed(2)),
          periodo: `${dataInicio} a ${dataFim}`,
          linhas: linhasSped.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in gerar-sped-fiscal:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
