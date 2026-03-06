import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('enviar-dados-contabilidade function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clinicId, tipoDocumento, periodoReferencia, forcarEnvio } = await req.json()

    console.log(`Enviando ${tipoDocumento} para contabilidade - Clínica: ${clinicId}`)

    // Buscar configurações ativas de integração contábil
    const { data: configs, error: configError } = await supabase
      .from('integracao_contabil_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)

    if (configError) throw configError

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhuma integração contábil ativa encontrada' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resultados = []

    for (const config of configs) {
      // Verificar se deve enviar este tipo de documento
      if (tipoDocumento === 'SPED_FISCAL' && !config.enviar_sped_fiscal) continue
      if (tipoDocumento === 'NFCE_DADOS' && !config.enviar_nfce_dados) continue

      // Criar registro de envio
      const { data: envio, error: envioError } = await supabase
        .from('integracao_contabil_envios')
        .insert({
          clinic_id: clinicId,
          config_id: config.id,
          tipo_documento: tipoDocumento,
          periodo_referencia: periodoReferencia,
          status: 'ENVIANDO',
        })
        .select()
        .single()

      if (envioError) {
        console.error('Error creating envio record:', envioError)
        continue
      }

      try {
        // Buscar dados para envio
        let dadosEnvio: any = {}
        let xmlContent = ''

        if (tipoDocumento === 'SPED_FISCAL') {
          // Gerar SPED Fiscal
          const spedResult = await supabase.functions.invoke('gerar-sped-fiscal', {
            body: { clinicId, periodo: periodoReferencia }
          })

          if (spedResult.error) throw spedResult.error
          dadosEnvio = spedResult.data
          xmlContent = spedResult.data.sped_content || ''
        } else if (tipoDocumento === 'NFCE_DADOS') {
          // Buscar NFCe do período
          const { data: nfces, error: nfceError } = await supabase
            .from('nfce_emitidas')
            .select('*')
            .eq('clinic_id', clinicId)
            .gte('created_at', `${periodoReferencia}-01`)
            .lte('created_at', `${periodoReferencia}-31`)

          if (nfceError) throw nfceError
          dadosEnvio = { nfces, periodo: periodoReferencia }
          xmlContent = nfces.map((nfce: any) => nfce.xml_nfce).join('\n')
        }

        // VALIDAR XML FISCAL ANTES DE ENVIAR
        console.log(`Validando XML ${tipoDocumento} antes do envio...`)
        const validacaoResult = await supabase.functions.invoke('validate-fiscal-xml', {
          body: {
            clinicId,
            tipoDocumento,
            xmlContent,
            documentoId: envio.id,
          }
        })

        if (validacaoResult.error) {
          throw new Error(`Falha na validação do XML: ${validacaoResult.error.message}`)
        }

        if (!validacaoResult.data.pode_enviar) {
          throw new Error(`XML inválido: ${validacaoResult.data.erros?.join(', ')}`)
        }

        console.log(`✅ XML validado com sucesso: ${validacaoResult.data.mensagem}`)

        // SIMULAÇÃO DE ENVIO - Em produção, fazer request real para API do software contábil
        const resultadoEnvio = await enviarParaSoftwareContabil(
          config.software,
          config.api_url,
          config.api_key,
          config.api_secret,
          config.codigo_empresa,
          tipoDocumento,
          dadosEnvio
        )

        // Atualizar status do envio
        await supabase
          .from('integracao_contabil_envios')
          .update({
            status: resultadoEnvio.sucesso ? 'SUCESSO' : 'ERRO',
            response_data: resultadoEnvio.response,
            erro_mensagem: resultadoEnvio.erro,
            enviado_em: resultadoEnvio.sucesso ? new Date().toISOString() : null,
          })
          .eq('id', envio.id)

        // Registrar no audit log
        await supabase
          .from('audit_logs')
          .insert({
            clinic_id: clinicId,
            action: resultadoEnvio.sucesso ? 'DADOS_ENVIADOS_CONTABILIDADE' : 'ERRO_ENVIO_CONTABILIDADE',
            details: {
              software: config.software,
              tipo_documento: tipoDocumento,
              periodo: periodoReferencia,
              envio_id: envio.id,
            },
          })

        resultados.push({
          software: config.software,
          sucesso: resultadoEnvio.sucesso,
          mensagem: resultadoEnvio.mensagem,
        })

        console.log(`✅ Envio para ${config.software}: ${resultadoEnvio.mensagem}`)

      } catch (error: any) {
        console.error(`Error sending to ${config.software}:`, error)

        // Marcar como erro e incrementar tentativas
        await supabase
          .from('integracao_contabil_envios')
          .update({
            status: envio.tentativas + 1 < envio.max_tentativas ? 'RETRY' : 'ERRO',
            tentativas: envio.tentativas + 1,
            erro_mensagem: error.message,
          })
          .eq('id', envio.id)

        resultados.push({
          software: config.software,
          sucesso: false,
          mensagem: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultados,
        total_envios: resultados.length,
        sucesso: resultados.filter(r => r.sucesso).length,
        falhas: resultados.filter(r => !r.sucesso).length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in enviar-dados-contabilidade:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Simular envio para software contábil (HOMOLOGAÇÃO)
async function enviarParaSoftwareContabil(
  software: string,
  apiUrl: string,
  apiKey: string | null,
  apiSecret: string | null,
  codigoEmpresa: string | null,
  tipoDocumento: string,
  dados: any
) {
  console.log(`Simulando envio para ${software} - ${tipoDocumento}`)
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Em produção, fazer request real para API do software contábil
  // Exemplo para TOTVS:
  // const response = await fetch(`${apiUrl}/api/fiscal/importar`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${apiKey}`,
  //     'X-API-Secret': apiSecret,
  //   },
  //   body: JSON.stringify({
  //     codigo_empresa: codigoEmpresa,
  //     tipo_documento: tipoDocumento,
  //     dados: dados,
  //   }),
  // })

  // Simular resposta de sucesso
  return {
    sucesso: true,
    mensagem: `${tipoDocumento} enviado com sucesso para ${software} (HOMOLOGAÇÃO)`,
    response: {
      protocolo: `${software.substring(0, 3).toUpperCase()}${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'PROCESSADO',
    },
    erro: null,
  }
}
