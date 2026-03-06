import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('imprimir-cupom-sat function started')

// Interface para dados da venda
interface VendaItem {
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { vendaId, clinicId, items, valorTotal, formaPagamento } = await req.json()

    console.log(`Processando impressão SAT/MFe para venda ${vendaId}`)

    // Buscar configuração ativa do equipamento SAT/MFe
    const { data: config, error: configError } = await supabase
      .from('sat_mfe_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)
      .single()

    if (configError || !config) {
      throw new Error('Nenhum equipamento SAT/MFe ativo encontrado para esta clínica')
    }

    // Buscar dados da clínica (fiscal_config)
    const { data: fiscalConfig, error: fiscalError } = await supabase
      .from('fiscal_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)
      .single()

    if (fiscalError || !fiscalConfig) {
      throw new Error('Configuração fiscal não encontrada')
    }

    // Gerar número de sessão único
    const numeroSessao = String(Date.now()).slice(-6)

    // Construir XML para SAT/MFe (formato simplificado)
    const xmlCupom = construirXMLCupomFiscal(
      config,
      fiscalConfig,
      items,
      valorTotal,
      formaPagamento,
      numeroSessao
    )

    console.log('XML Cupom Fiscal gerado:', xmlCupom.substring(0, 200))

    // Registrar tentativa de impressão
    const { data: impressao, error: impressaoError } = await supabase
      .from('sat_mfe_impressoes')
      .insert({
        clinic_id: clinicId,
        config_id: config.id,
        venda_id: vendaId,
        tipo_equipamento: config.tipo_equipamento,
        numero_sessao: numeroSessao,
        xml_enviado: xmlCupom,
        status: 'PROCESSANDO',
        tentativas: 1,
      })
      .select()
      .single()

    if (impressaoError) throw impressaoError

    // MODO HOMOLOGAÇÃO: Simular comunicação com equipamento SAT/MFe
    // Em produção, aqui seria feita comunicação real com o equipamento via TCP/IP ou DLL
    const resultadoImpressao = await simularComunicacaoSAT(
      config.tipo_equipamento,
      config.ip_address,
      config.porta,
      xmlCupom,
      numeroSessao
    )

    // Atualizar status da impressão
    const { error: updateError } = await supabase
      .from('sat_mfe_impressoes')
      .update({
        status: resultadoImpressao.sucesso ? 'SUCESSO' : 'ERRO',
        codigo_autorizacao: resultadoImpressao.codigoAutorizacao,
        chave_consulta: resultadoImpressao.chaveConsulta,
        xml_retorno: resultadoImpressao.xmlRetorno,
        mensagem_retorno: resultadoImpressao.mensagem,
      })
      .eq('id', impressao.id)

    if (updateError) throw updateError

    // Registrar no audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: clinicId,
        action: resultadoImpressao.sucesso ? 'CUPOM_FISCAL_IMPRESSO' : 'ERRO_IMPRESSAO_CUPOM',
        details: {
          venda_id: vendaId,
          tipo_equipamento: config.tipo_equipamento,
          numero_sessao: numeroSessao,
          codigo_autorizacao: resultadoImpressao.codigoAutorizacao,
          mensagem: resultadoImpressao.mensagem,
        },
      })

    console.log(`✅ Cupom fiscal ${resultadoImpressao.sucesso ? 'impresso' : 'com erro'} - Sessão: ${numeroSessao}`)

    return new Response(
      JSON.stringify({
        success: resultadoImpressao.sucesso,
        numeroSessao,
        codigoAutorizacao: resultadoImpressao.codigoAutorizacao,
        chaveConsulta: resultadoImpressao.chaveConsulta,
        mensagem: resultadoImpressao.mensagem,
        impressaoId: impressao.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in imprimir-cupom-sat:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Função para construir XML do cupom fiscal
function construirXMLCupomFiscal(
  config: any,
  fiscalConfig: any,
  items: VendaItem[],
  valorTotal: number,
  formaPagamento: string,
  numeroSessao: string
): string {
  const dataHora = new Date().toISOString()
  
  // Itens do cupom
  const xmlItens = items.map((item, index) => `
    <det nItem="${index + 1}">
      <prod>
        <cProd>${index + 1}</cProd>
        <xProd>${item.descricao}</xProd>
        <qCom>${item.quantidade}</qCom>
        <vUnCom>${item.valor_unitario.toFixed(2)}</vUnCom>
        <vProd>${item.valor_total.toFixed(2)}</vProd>
      </prod>
    </det>
  `).join('')

  // XML simplificado conforme layout CF-e-SAT
  return `<?xml version="1.0" encoding="UTF-8"?>
<CFe>
  <infCFe versao="0.07">
    <ide>
      <CNPJ>${fiscalConfig.cnpj}</CNPJ>
      <signAC>${config.codigo_ativacao || ''}</signAC>
      <numeroCaixa>1</numeroCaixa>
      <dhEmissao>${dataHora}</dhEmissao>
    </ide>
    <emit>
      <CNPJ>${fiscalConfig.cnpj}</CNPJ>
      <xNome>${fiscalConfig.razao_social}</xNome>
      <xFant>${fiscalConfig.nome_fantasia || fiscalConfig.razao_social}</xFant>
      <enderEmit>
        <xLgr>${fiscalConfig.logradouro}</xLgr>
        <nro>${fiscalConfig.numero}</nro>
        <xBairro>${fiscalConfig.bairro}</xBairro>
        <xMun>${fiscalConfig.municipio}</xMun>
        <CEP>${fiscalConfig.cep}</CEP>
      </enderEmit>
      <IE>${fiscalConfig.inscricao_estadual}</IE>
      <IM>${fiscalConfig.inscricao_municipal || ''}</IM>
      <cRegTrib>3</cRegTrib>
    </emit>
    ${xmlItens}
    <total>
      <vCFe>${valorTotal.toFixed(2)}</vCFe>
    </total>
    <pgto>
      <MP>
        <cMP>${getCodigoMeioPagamento(formaPagamento)}</cMP>
        <vMP>${valorTotal.toFixed(2)}</vMP>
      </MP>
    </pgto>
  </infCFe>
</CFe>`
}

// Mapear forma de pagamento para código SAT
function getCodigoMeioPagamento(forma: string): string {
  const mapeamento: Record<string, string> = {
    'DINHEIRO': '01',
    'CREDITO': '03',
    'DEBITO': '04',
    'PIX': '17',
    'TRANSFERENCIA': '05',
    'CRYPTO': '99', // Outros
  }
  return mapeamento[forma] || '99'
}

// Simular comunicação com equipamento SAT/MFe (HOMOLOGAÇÃO)
async function simularComunicacaoSAT(
  tipoEquipamento: string,
  ipAddress: string | null,
  porta: number | null,
  xmlCupom: string,
  numeroSessao: string
) {
  // SIMULAÇÃO - Em produção, fazer comunicação real com equipamento
  console.log(`Simulando comunicação ${tipoEquipamento} em ${ipAddress}:${porta}`)
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Gerar código de autorização simulado
  const codigoAutorizacao = `${tipoEquipamento.substring(0, 3)}${Date.now().toString().slice(-10)}`
  const chaveConsulta = `CFe${String(Date.now()).slice(-35)}${numeroSessao}`
  
  // Simular XML de retorno
  const xmlRetorno = `<?xml version="1.0" encoding="UTF-8"?>
<retorno>
  <codigoAutorizacao>${codigoAutorizacao}</codigoAutorizacao>
  <chaveConsulta>${chaveConsulta}</chaveConsulta>
  <status>06000</status>
  <mensagem>Cupom Fiscal Autorizado - SIMULAÇÃO HOMOLOGAÇÃO</mensagem>
</retorno>`

  return {
    sucesso: true,
    codigoAutorizacao,
    chaveConsulta,
    xmlRetorno,
    mensagem: 'Cupom Fiscal Autorizado com Sucesso (HOMOLOGAÇÃO)',
  }
}
