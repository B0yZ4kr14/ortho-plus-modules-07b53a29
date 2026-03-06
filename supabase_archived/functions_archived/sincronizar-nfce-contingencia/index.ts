import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('sincronizar-nfce-contingencia function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clinicId, contingenciaId } = await req.json()

    console.log(`Sincronizando NFCe de contingência - Clínica: ${clinicId}`)

    // Buscar NFCe em contingência pendentes
    let query = supabase
      .from('nfce_contingencia')
      .select('*')
      .eq('status_sincronizacao', 'PENDENTE')
      .lt('tentativas_sincronizacao', 5)
      .order('emitido_em', { ascending: true })
      .limit(50) // Processar até 50 NFCe por vez

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    if (contingenciaId) {
      query = query.eq('id', contingenciaId)
    }

    const { data: contingencias, error: contingenciaError } = await query

    if (contingenciaError) throw contingenciaError

    if (!contingencias || contingencias.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma NFCe em contingência para sincronizar',
          total_sincronizadas: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resultados = []

    for (const contingencia of contingencias) {
      // Atualizar status para sincronizando
      await supabase
        .from('nfce_contingencia')
        .update({ 
          status_sincronizacao: 'SINCRONIZANDO',
          tentativas_sincronizacao: contingencia.tentativas_sincronizacao + 1,
        })
        .eq('id', contingencia.id)

      try {
        // Tentar autorizar NFCe na SEFAZ
        const resultadoAutorizacao = await autorizarNFCeContingencia(
          contingencia.xml_nfce,
          contingencia.chave_acesso,
          contingencia.clinic_id
        )

        if (resultadoAutorizacao.sucesso) {
          // Autorizada com sucesso
          await supabase
            .from('nfce_contingencia')
            .update({
              status_sincronizacao: 'SINCRONIZADO',
              protocolo_autorizacao: resultadoAutorizacao.protocolo,
              sincronizado_em: new Date().toISOString(),
            })
            .eq('id', contingencia.id)

          // Criar registro normal de NFCe emitida
          await supabase
            .from('nfce_emitidas')
            .insert({
              clinic_id: contingencia.clinic_id,
              numero_nfce: contingencia.numero_nfce,
              serie: contingencia.serie,
              chave_acesso: contingencia.chave_acesso,
              xml_nfce: contingencia.xml_nfce,
              valor_total: contingencia.valor_total,
              status: 'AUTORIZADA',
              protocolo_autorizacao: resultadoAutorizacao.protocolo,
              metadata: {
                modo_contingencia: contingencia.modo_contingencia,
                emitido_em_contingencia: contingencia.emitido_em,
                sincronizado_em: new Date().toISOString(),
              },
            })

          // Registrar audit log
          await supabase
            .from('audit_logs')
            .insert({
              clinic_id: contingencia.clinic_id,
              action: 'NFCE_CONTINGENCIA_SINCRONIZADA',
              details: {
                contingencia_id: contingencia.id,
                chave_acesso: contingencia.chave_acesso,
                protocolo: resultadoAutorizacao.protocolo,
              },
            })

          resultados.push({
            contingencia_id: contingencia.id,
            sucesso: true,
            protocolo: resultadoAutorizacao.protocolo,
          })

          console.log(`✅ NFCe ${contingencia.numero_nfce} sincronizada - Protocolo: ${resultadoAutorizacao.protocolo}`)

        } else {
          // Erro na autorização
          throw new Error(resultadoAutorizacao.mensagem)
        }

      } catch (error: any) {
        console.error(`Error syncing contingencia ${contingencia.id}:`, error)

        // Atualizar status de erro
        await supabase
          .from('nfce_contingencia')
          .update({
            status_sincronizacao: contingencia.tentativas_sincronizacao >= 4 ? 'ERRO' : 'PENDENTE',
            erro_sincronizacao: error.message,
          })
          .eq('id', contingencia.id)

        resultados.push({
          contingencia_id: contingencia.id,
          sucesso: false,
          erro: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_processadas: resultados.length,
        sincronizadas: resultados.filter(r => r.sucesso).length,
        falhas: resultados.filter(r => !r.sucesso).length,
        resultados,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sincronizar-nfce-contingencia:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Autorizar NFCe de contingência na SEFAZ
async function autorizarNFCeContingencia(
  xmlNFCe: string,
  chaveAcesso: string,
  clinicId: string
) {
  console.log(`Autorizando NFCe de contingência: ${chaveAcesso}`)

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500))

  // SIMULAÇÃO - Em produção, fazer request SOAP real para SEFAZ
  // com certificado digital A1/A3 e enviar XML de contingência
  const protocolo = `135${String(Date.now()).slice(-12)}`
  const status = '100' // 100 = Autorizado

  return {
    sucesso: status === '100',
    protocolo,
    mensagem: status === '100' 
      ? 'NFCe de contingência autorizada com sucesso' 
      : 'Erro ao autorizar NFCe de contingência',
  }
}
