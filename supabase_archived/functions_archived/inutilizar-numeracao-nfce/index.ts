import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('inutilizar-numeracao-nfce function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) throw new Error('Unauthorized')

    const { clinicId, serie, numeroInicial, numeroFinal, ano, justificativa } = await req.json()

    // Validações
    if (numeroFinal < numeroInicial) {
      throw new Error('Número final deve ser maior que número inicial')
    }

    if (justificativa.length < 15) {
      throw new Error('Justificativa deve ter no mínimo 15 caracteres')
    }

    // Verificar se numeração já foi usada
    const { data: nfcesUsadas, error: checkError } = await supabase
      .from('nfce_emitidas')
      .select('numero_nfce')
      .eq('clinic_id', clinicId)
      .eq('serie', serie)
      .gte('numero_nfce', numeroInicial)
      .lte('numero_nfce', numeroFinal)

    if (checkError) throw checkError

    if (nfcesUsadas && nfcesUsadas.length > 0) {
      throw new Error(`Numeração já foi utilizada: ${nfcesUsadas.map(n => n.numero_nfce).join(', ')}`)
    }

    // XML de inutilização (simplificado)
    const xmlInutilizacao = `<?xml version="1.0" encoding="UTF-8"?>
<inutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <infInut Id="ID${ano}${serie}${numeroInicial}${numeroFinal}">
    <tpAmb>2</tpAmb>
    <xServ>INUTILIZAR</xServ>
    <cUF>35</cUF>
    <ano>${ano}</ano>
    <CNPJ>00000000000000</CNPJ>
    <mod>65</mod>
    <serie>${serie}</serie>
    <nNFIni>${numeroInicial}</nNFIni>
    <nNFFin>${numeroFinal}</nNFFin>
    <xJust>${justificativa}</xJust>
  </infInut>
</inutNFe>`

    // Simular protocolo de inutilização
    const protocolo = `142${String(Date.now()).slice(-12)}`

    // Salvar inutilização
    const { data: inutilizacao, error: insertError } = await supabase
      .from('nfce_inutilizacao')
      .insert({
        clinic_id: clinicId,
        serie: serie,
        numero_inicial: numeroInicial,
        numero_final: numeroFinal,
        ano: ano,
        justificativa: justificativa,
        protocolo: protocolo,
        xml_inutilizacao: xmlInutilizacao,
        status: 'AUTORIZADO',
        codigo_status: '102',
        motivo: 'Inutilização de número homologado',
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: clinicId,
        user_id: user.id,
        action: 'NUMERACAO_INUTILIZADA',
        details: {
          serie,
          numero_inicial: numeroInicial,
          numero_final: numeroFinal,
          protocolo
        }
      })

    console.log(`✅ Numeração inutilizada: Série ${serie}, ${numeroInicial} a ${numeroFinal}`)

    return new Response(
      JSON.stringify({
        success: true,
        inutilizacao: {
          id: inutilizacao.id,
          protocolo,
          serie,
          numero_inicial: numeroInicial,
          numero_final: numeroFinal
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in inutilizar-numeracao-nfce:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
