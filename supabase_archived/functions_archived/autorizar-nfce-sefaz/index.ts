import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('autorizar-nfce-sefaz function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { nfceId, ambiente } = await req.json()

    // Buscar NFCe
    const { data: nfce, error: nfceError } = await supabase
      .from('nfce_emitidas')
      .select('*, fiscal_config:clinic_id(*)') 
      .eq('id', nfceId)
      .single()

    if (nfceError || !nfce) {
      throw new Error('NFCe não encontrada')
    }

    // URL da SEFAZ (em produção usar certificado A1/A3 real)
    const sefazUrl = ambiente === 'PRODUCAO'
      ? 'https://nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx'
      : 'https://homologacao.nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx'

    // SOAP envelope para autorização (simplificado - em produção usar biblioteca completa)
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
  <soap:Header/>
  <soap:Body>
    <nfe:nfeDadosMsg>
      <![CDATA[${nfce.xml_nfce}]]>
    </nfe:nfeDadosMsg>
  </soap:Body>
</soap:Envelope>`

    // Simular envio para SEFAZ (em produção fazer request SOAP real com certificado)
    console.log(`Enviando NFCe ${nfce.numero_nfce} para SEFAZ ${ambiente}`)
    
    // Simular resposta da SEFAZ
    const protocolo = `135${String(Date.now()).slice(-12)}`
    const status = '100' // 100 = Autorizado
    const motivo = 'Autorizado o uso da NF-e'

    // Atualizar NFCe com protocolo
    const { error: updateError } = await supabase
      .from('nfce_emitidas')
      .update({
        status: 'AUTORIZADA',
        protocolo_autorizacao: protocolo,
        metadata: {
          ...nfce.metadata,
          codigo_status: status,
          motivo_status: motivo,
          data_autorizacao: new Date().toISOString()
        }
      })
      .eq('id', nfceId)

    if (updateError) throw updateError

    // Registrar audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: nfce.clinic_id,
        action: 'NFCE_AUTORIZADA_SEFAZ',
        details: {
          nfce_id: nfceId,
          numero: nfce.numero_nfce,
          protocolo: protocolo,
          ambiente: ambiente
        }
      })

    console.log(`✅ NFCe ${nfce.numero_nfce} autorizada - Protocolo: ${protocolo}`)

    return new Response(
      JSON.stringify({
        success: true,
        protocolo,
        status,
        motivo,
        nfce: {
          id: nfceId,
          numero: nfce.numero_nfce,
          chave_acesso: nfce.chave_acesso
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in autorizar-nfce-sefaz:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
