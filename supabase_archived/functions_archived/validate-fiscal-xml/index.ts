import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('validate-fiscal-xml function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clinicId, tipoDocumento, xmlContent, documentoId } = await req.json()

    console.log(`Validando XML ${tipoDocumento} - Clínica: ${clinicId}`)

    // Validar estrutura básica do XML
    const erros: string[] = []
    const warnings: string[] = []

    // Verificar se é XML válido (validação básica)
    if (!xmlContent.trim().startsWith('<') && !xmlContent.trim().startsWith('|')) {
      erros.push('Documento não é XML ou SPED válido')
    }

    if (tipoDocumento === 'NFCE') {
      // Validações específicas de NFCe
      if (!xmlContent.includes('<infNFe')) {
        erros.push('Tag <infNFe> obrigatória não encontrada')
      }
      
      if (!xmlContent.includes('<emit>')) {
        erros.push('Tag <emit> (emitente) obrigatória não encontrada')
      }
      
      if (!xmlContent.includes('<det ')) {
        warnings.push('Nenhum item <det> encontrado - nota sem produtos')
      }
      
      if (!xmlContent.includes('<total>')) {
        erros.push('Tag <total> obrigatória não encontrada')
      }

      // Validar CNPJs
      const cnpjMatches = xmlContent.match(/<CNPJ>(\d+)<\/CNPJ>/g)
      if (cnpjMatches) {
        cnpjMatches.forEach((cnpj: string) => {
          const numero = cnpj.replace(/<\/?CNPJ>/g, '')
          if (numero.length !== 14) {
            erros.push(`CNPJ inválido: ${numero} (deve ter 14 dígitos)`)
          }
        })
      }

      // Validar valores numéricos
      const valorMatches = xmlContent.match(/<v[A-Za-z]+>([\d.]+)<\/v[A-Za-z]+>/g)
      if (valorMatches) {
        valorMatches.forEach((valor: string) => {
          const numero = valor.match(/>([\d.]+)</)?.[1]
          if (numero && isNaN(parseFloat(numero))) {
            erros.push(`Valor numérico inválido: ${numero}`)
          }
        })
      }

      // Validar chave de acesso (44 dígitos)
      const chaveMatch = xmlContent.match(/<Id>NFe(\d{44})<\/Id>/)
      if (chaveMatch) {
        if (chaveMatch[1].length !== 44) {
          erros.push('Chave de acesso deve ter 44 dígitos')
        }
      } else {
        erros.push('Chave de acesso não encontrada')
      }

    } else if (tipoDocumento === 'SPED_FISCAL') {
      // Validações específicas de SPED Fiscal
      if (!xmlContent.startsWith('|0000|')) {
        erros.push('SPED deve iniciar com registro 0000')
      }

      if (!xmlContent.includes('|9999|')) {
        erros.push('SPED deve terminar com registro 9999 (encerramento)')
      }

      // Validar estrutura de blocos obrigatórios
      const blocosObrigatorios = ['|0000|', '|C100|', '|E100|', '|9999|']
      blocosObrigatorios.forEach((bloco: string) => {
        if (!xmlContent.includes(bloco)) {
          warnings.push(`Bloco ${bloco} não encontrado - pode ser obrigatório`)
        }
      })

      // Validar formato de linhas SPED (devem terminar com |)
      const linhas = xmlContent.split('\n')
      linhas.forEach((linha: string, idx: number) => {
        if (linha.trim() && !linha.trim().endsWith('|')) {
          erros.push(`Linha ${idx + 1} não termina com | (formato SPED inválido)`)
        }
      })

      // Validar CNPJ do registro 0000
      const cnpjMatch = xmlContent.match(/\|0000\|.*?\|(\d+)\|/)
      if (cnpjMatch) {
        if (cnpjMatch[1].length !== 14) {
          erros.push(`CNPJ no registro 0000 inválido: ${cnpjMatch[1]}`)
        }
      }
    }

    const validacaoStatus = erros.length > 0 ? 'INVALIDO' : 'VALIDO'

    // Registrar validação
    const { data: validacao, error: validacaoError } = await supabase
      .from('validacao_xml_fiscal')
      .insert({
        clinic_id: clinicId,
        tipo_documento: tipoDocumento,
        documento_id: documentoId,
        xml_content: xmlContent,
        validacao_status: validacaoStatus,
        erros_encontrados: erros.length > 0 ? { erros } : null,
        warnings: warnings.length > 0 ? { warnings } : null,
        validado_em: new Date().toISOString(),
      })
      .select()
      .single()

    if (validacaoError) throw validacaoError

    // Registrar audit log
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: clinicId,
        action: validacaoStatus === 'VALIDO' ? 'XML_VALIDADO_SUCESSO' : 'XML_VALIDACAO_FALHOU',
        details: {
          tipo_documento: tipoDocumento,
          validacao_id: validacao.id,
          erros: erros.length,
          warnings: warnings.length,
        },
      })

    console.log(`✅ Validação concluída: ${validacaoStatus} (${erros.length} erros, ${warnings.length} avisos)`)

    return new Response(
      JSON.stringify({
        success: true,
        validacao_status: validacaoStatus,
        validacao_id: validacao.id,
        erros: erros.length > 0 ? erros : null,
        warnings: warnings.length > 0 ? warnings : null,
        pode_enviar: erros.length === 0,
        mensagem: erros.length === 0 
          ? 'XML válido e pronto para envio à contabilidade'
          : `XML inválido: ${erros.length} erro(s) encontrado(s)`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in validate-fiscal-xml:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})