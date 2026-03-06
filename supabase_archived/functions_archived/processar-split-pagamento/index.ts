import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gateway PIX Configuration (Mercado Pago, PicPay, or Banco do Brasil)
const PIX_GATEWAY_API_URL = Deno.env.get('PIX_GATEWAY_API_URL') || 'https://api.mercadopago.com';
const PIX_GATEWAY_TOKEN = Deno.env.get('PIX_GATEWAY_TOKEN') || '';

interface SplitPaymentRequest {
  transacao_origem_id: string;
  valor_original: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Não autenticado');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Perfil não encontrado');
    }

    const { transacao_origem_id, valor_original }: SplitPaymentRequest = await req.json();

    console.log(`Processando split de pagamento para transação ${transacao_origem_id}, valor: R$ ${valor_original}`);

    // Buscar configurações de split para esta transação
    // Assumindo que a transação está vinculada a um procedimento/dentista
    const { data: splitConfigs, error: splitError } = await supabase
      .from('split_config')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('ativo', true);

    if (splitError) {
      console.error('Erro ao buscar configurações de split:', splitError);
      throw new Error('Erro ao buscar configurações de split');
    }

    if (!splitConfigs || splitConfigs.length === 0) {
      console.log('Nenhuma configuração de split ativa encontrada');
      return new Response(
        JSON.stringify({ 
          message: 'Nenhuma configuração de split ativa',
          splits_processados: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const splitsProcessados = [];

    // Processar cada configuração de split
    for (const config of splitConfigs) {
      const valor_split = (valor_original * config.percentual_split) / 100;

      console.log(`Processando split para dentista ${config.dentist_id}: ${config.percentual_split}% = R$ ${valor_split}`);

      // Criar registro de transação de split
      const { data: splitTransacao, error: transacaoError } = await supabase
        .from('split_transacoes')
        .insert({
          clinic_id: profile.clinic_id,
          transacao_origem_id,
          dentist_id: config.dentist_id,
          valor_original,
          percentual_split: config.percentual_split,
          valor_split,
          status: 'PENDENTE',
          chave_pix_destino: config.chave_pix,
        })
        .select()
        .single();

      if (transacaoError) {
        console.error('Erro ao criar transação de split:', transacaoError);
        continue;
      }

      // Simular processamento de PIX
      // Em produção, aqui seria feita a integração com gateway de pagamento PIX
      const pixProcessado = await processarPixTransfer(config.chave_pix, valor_split);

      if (pixProcessado.success) {
        // Atualizar transação como concluída
        await supabase
          .from('split_transacoes')
          .update({
            status: 'CONCLUIDO',
            processado_em: new Date().toISOString(),
            comprovante_pix: pixProcessado.comprovante_id,
          })
          .eq('id', splitTransacao.id);

        // Atualizar comissões do mês
        await atualizarComissaoMensal(supabase, profile.clinic_id, config.dentist_id, valor_split);

        // Gerar nota fiscal automática
        const notaFiscal = await gerarNotaFiscalAutomatica(
          supabase,
          profile.clinic_id,
          config.dentist_id,
          valor_split,
          splitTransacao.id
        );

        splitsProcessados.push({
          dentist_id: config.dentist_id,
          valor_split,
          status: 'CONCLUIDO',
          comprovante_pix: pixProcessado.comprovante_id,
          nota_fiscal_url: notaFiscal.url,
        });

        console.log(`Split processado com sucesso: R$ ${valor_split} para dentista ${config.dentist_id}`);
      } else {
        // Marcar como falha
        await supabase
          .from('split_transacoes')
          .update({
            status: 'FALHA',
            erro_mensagem: pixProcessado.erro,
          })
          .eq('id', splitTransacao.id);

        splitsProcessados.push({
          dentist_id: config.dentist_id,
          valor_split,
          status: 'FALHA',
          erro: pixProcessado.erro,
        });

        console.error(`Falha ao processar split: ${pixProcessado.erro}`);
      }
    }

    // Registrar log de auditoria
    await supabase
      .from('audit_logs')
      .insert({
        clinic_id: profile.clinic_id,
        user_id: user.id,
        action: 'SPLIT_PAGAMENTO_PROCESSADO',
        details: {
          transacao_origem_id,
          valor_original,
          splits_processados: splitsProcessados.length,
          splits: splitsProcessados,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        transacao_origem_id,
        valor_original,
        splits_processados: splitsProcessados.length,
        splits: splitsProcessados,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro ao processar split de pagamento:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar split de pagamento' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Função auxiliar para processar transferência PIX via Mercado Pago
async function processarPixTransfer(
  chave_pix: string | null,
  valor: number
): Promise<{ success: boolean; erro?: string; comprovante_id?: string; qr_code?: string; qr_code_base64?: string }> {
  const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  // Se o token do Mercado Pago estiver configurado, usar API real
  if (MERCADOPAGO_ACCESS_TOKEN && chave_pix) {
    try {
      console.log(`[MERCADO PAGO] Processando PIX de R$ ${valor.toFixed(2)} para chave: ${chave_pix}`);
      
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_amount: valor,
          description: 'Split de Pagamento - Ortho+',
          payment_method_id: 'pix',
          payer: {
            email: 'repasse@orthoplus.com'
          },
          metadata: {
            chave_pix: chave_pix
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[MERCADO PAGO] Erro:', errorData);
        throw new Error(errorData.message || 'Erro ao processar PIX com Mercado Pago');
      }

      const data = await response.json();
      
      return {
        success: data.status === 'approved' || data.status === 'pending',
        comprovante_id: data.id?.toString(),
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64
      };

    } catch (error) {
      console.error('[MERCADO PAGO] Erro ao processar PIX:', error);
      return {
        success: false,
        erro: error instanceof Error ? error.message : 'Erro ao processar PIX'
      };
    }
  }
  
  // Fallback: Simulação se o token não estiver configurado
  console.log(`[SIMULAÇÃO] Processando PIX de R$ ${valor.toFixed(2)} para chave: ${chave_pix}`);
  console.log('[SIMULAÇÃO] Configure MERCADOPAGO_ACCESS_TOKEN para usar API real');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const success = Math.random() > 0.05;
  
  if (success) {
    return {
      success: true,
      comprovante_id: `PIX-SIM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      qr_code: `00020126580014BR.GOV.BCB.PIX0136${chave_pix}520400005303986540${valor.toFixed(2)}5802BR5925Ortho Plus6009Sao Paulo62070503***6304`,
      qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
  } else {
    return {
      success: false,
      erro: 'Falha ao processar PIX. Tente novamente.'
    };
  }
}

// Atualiza comissão mensal do dentista
async function atualizarComissaoMensal(
  supabase: any,
  clinic_id: string,
  dentist_id: string,
  valor_split: number
) {
  const mesReferencia = new Date().toISOString().slice(0, 7) + '-01';

  const { data: comissaoExistente, error: buscaError } = await supabase
    .from('split_comissoes')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('dentist_id', dentist_id)
    .eq('mes_referencia', mesReferencia)
    .single();

  if (buscaError && buscaError.code !== 'PGRST116') {
    console.error('Erro ao buscar comissão:', buscaError);
    return;
  }

  if (comissaoExistente) {
    // Atualizar comissão existente
    await supabase
      .from('split_comissoes')
      .update({
        total_comissao: comissaoExistente.total_comissao + valor_split,
        total_pago: comissaoExistente.total_pago + valor_split,
        updated_at: new Date().toISOString(),
      })
      .eq('id', comissaoExistente.id);
  } else {
    // Criar nova comissão
    await supabase
      .from('split_comissoes')
      .insert({
        clinic_id,
        dentist_id,
        mes_referencia: mesReferencia,
        total_vendas: valor_split / 0.6, // Assumindo split de 60%
        total_comissao: valor_split,
        total_pago: valor_split,
        total_pendente: 0,
      });
  }
}

// Gera nota fiscal automática do split
async function gerarNotaFiscalAutomatica(
  supabase: any,
  clinic_id: string,
  dentist_id: string,
  valor: number,
  split_transacao_id: string
) {
  // Em produção, aqui seria feita a integração com sistema de emissão de NF-e
  // Exemplo: Focus NFe, eNotas, NFe.io, etc.

  const numeroNota = `NF-SPLIT-${Date.now()}`;
  const chaveAcesso = `${Date.now()}${Math.random().toString(36).substring(2, 15)}`;

  console.log(`[SIMULAÇÃO] Gerando nota fiscal ${numeroNota} para valor R$ ${valor}`);

  // Criar registro de nota fiscal
  const { error: nfError } = await supabase
    .from('notas_fiscais')
    .insert({
      clinic_id,
      numero_nota: numeroNota,
      serie: '1',
      chave_acesso: chaveAcesso,
      tipo: 'SAIDA',
      valor_total: valor,
      status_sefaz: 'AUTORIZADA',
      destinatario_id: dentist_id,
      observacoes: `Repasse de comissão - Split de Pagamento (ID: ${split_transacao_id})`,
    });

  if (nfError) {
    console.error('Erro ao registrar nota fiscal:', nfError);
  }

  // Atualizar transação de split com URL da nota fiscal
  const notaFiscalUrl = `https://nfe-simulator.com/${chaveAcesso}`;
  
  await supabase
    .from('split_transacoes')
    .update({
      nota_fiscal_url: notaFiscalUrl,
    })
    .eq('id', split_transacao_id);

  return {
    numero_nota: numeroNota,
    chave_acesso: chaveAcesso,
    url: notaFiscalUrl,
  };
}
