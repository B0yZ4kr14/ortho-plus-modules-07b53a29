import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('carta-correcao-nfce function started')

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

    const { nfceId, correcao } = await req.json()

    // Validar correção
    if (correcao.length < 15) {
      throw new Error('Correção deve ter no mínimo 15 caracteres')
    }

    // Buscar NFCe
    const { data: nfce, error: nfceError } = await supabase
      .from('nfce_emitidas')
      .select('*')
      .eq('id', nfceId)
      .single()

    if (nfceError || !nfce) {
      throw new Error('NFCe não encontrada')
    }

    if (nfce.status !== 'AUTORIZADA') {
      throw new Error('Apenas NFCe autorizadas podem ter carta de correção')
    }

    // Verificar sequência
    const { data: cceExistentes, error: cceError } = await supabase
      .from('nfce_carta_correcao')
      .select('sequencia')
      .eq('nfce_id', nfceId)
      .order('sequencia', { ascending: false })
      .limit(1)

    if (cceError) throw cceError

    const proximaSequencia = cceExistentes && cceExistentes.length > 0
      ? cceExistentes[0].sequencia + 1
      : 1

    // XML do evento CCe (simplificado)
    const xmlEvento = `<?xml version="1.0" encoding="UTF-8"?>
<evento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <infEvento Id="ID110110${nfce.chave_acesso}${String(proximaSequencia).padStart(2, '0')}">
    <cOrgao>35</cOrgao>
    <tpAmb>${nfce.ambiente === 'PRODUCAO' ? '1' : '2'}</tpAmb>
    <CNPJ>00000000000000</CNPJ>
    <chNFe>${nfce.chave_acesso}</chNFe>
    <dhEvento>${new Date().toISOString()}</dhEvento>
    <tpEvento>110110</tpEvento>
    <nSeqEvento>${proximaSequencia}</nSeqEvento>
    <verEvento>1.00</verEvento>
    <detEvento versao="1.00">
      <descEvento>Carta de Correcao</descEvento>
      <xCorrecao>${correcao}</xCorrecao>
      <xCondUso>A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.</xCondUso>
    </detEvento>
  </infEvento>
</evento>`

    // Simular protocolo
    const protocolo = `135${String(Date.now()).slice(-12)}`

    // Salvar CCe
    const { data: cce, error: insertError } = await supabase
      .from('nfce_carta_correcao')
      .insert({
        clinic_id: nfce.clinic_id,
        nfce_id: nfceId,
        sequencia: proximaSequencia,
        correcao: correcao,
        protocolo: protocolo,
        xml_evento: xmlEvento,
        status: 'REGISTRADO',
        codigo_status: '135',
        motivo: 'Evento registrado e vinculado a NF-e',
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: nfce.clinic_id,
        user_id: user.id,
        action: 'CCE_REGISTRADA',
        details: {
          nfce_id: nfceId,
          numero_nfce: nfce.numero_nfce,
          chave_acesso: nfce.chave_acesso,
          sequencia: proximaSequencia,
          protocolo
        }
      })

    console.log(`✅ CCe registrada: NFCe ${nfce.numero_nfce}, Seq ${proximaSequencia}`)

    return new Response(
      JSON.stringify({
        success: true,
        cce: {
          id: cce.id,
          protocolo,
          sequencia: proximaSequencia,
          nfce_numero: nfce.numero_nfce
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in carta-correcao-nfce:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
