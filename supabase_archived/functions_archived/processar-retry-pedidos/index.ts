import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para calcular backoff exponencial
function calcularProximoRetry(tentativa: number): Date {
  // Backoff exponencial: 2^tentativa minutos
  // Tentativa 1: 2 minutos
  // Tentativa 2: 4 minutos
  // Tentativa 3: 8 minutos
  // Tentativa 4: 16 minutos
  // Tentativa 5: 32 minutos
  const minutosEspera = Math.pow(2, tentativa);
  const proximo = new Date();
  proximo.setMinutes(proximo.getMinutes() + minutosEspera);
  return proximo;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("processar-retry-pedidos function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar pedidos que precisam de retry
    const agora = new Date().toISOString();
    const { data: retries, error: retryError } = await supabase
      .from('pedido_api_retry')
      .select(`
        *,
        pedido:estoque_pedidos(
          *,
          fornecedor:estoque_fornecedores(*)
        )
      `)
      .eq('status', 'PENDENTE')
      .lte('proximo_retry', agora)
      .lt('tentativa', 5);

    if (retryError) {
      throw retryError;
    }

    console.log(`Processando ${retries?.length || 0} pedidos para retry`);

    const resultados = [];

    for (const retry of retries || []) {
      try {
        // Marcar como processando
        await supabase
          .from('pedido_api_retry')
          .update({ status: 'PROCESSANDO' })
          .eq('id', retry.id);

        const fornecedor = retry.pedido.fornecedor;
        
        if (!fornecedor.api_enabled || !fornecedor.api_endpoint) {
          throw new Error("Fornecedor sem API configurada");
        }

        // Preparar o corpo da requisição
        const pedidoData = {
          numero_pedido: retry.pedido.numero_pedido,
          data_pedido: retry.pedido.data_pedido,
          itens: [], // Buscar itens do pedido
        };

        // Preparar headers de autenticação
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (fornecedor.api_auth_type === 'bearer' && fornecedor.api_token) {
          headers['Authorization'] = `Bearer ${fornecedor.api_token}`;
        } else if (fornecedor.api_auth_type === 'api_key' && fornecedor.api_key_header && fornecedor.api_key_value) {
          headers[fornecedor.api_key_header] = fornecedor.api_key_value;
        } else if (fornecedor.api_auth_type === 'basic' && fornecedor.api_username && fornecedor.api_password) {
          const auth = btoa(`${fornecedor.api_username}:${fornecedor.api_password}`);
          headers['Authorization'] = `Basic ${auth}`;
        }

        // Tentar enviar o pedido
        const response = await fetch(fornecedor.api_endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(pedidoData),
        });

        if (response.ok) {
          // Sucesso!
          await supabase
            .from('pedido_api_retry')
            .update({ 
              status: 'SUCESSO',
              updated_at: new Date().toISOString(),
            })
            .eq('id', retry.id);

          await supabase
            .from('estoque_pedidos')
            .update({ status: 'ENVIADO' })
            .eq('id', retry.pedido.id);

          console.log(`Pedido ${retry.pedido.numero_pedido} enviado com sucesso na tentativa ${retry.tentativa + 1}`);
          
          resultados.push({
            pedido_id: retry.pedido.id,
            status: 'SUCESSO',
            tentativa: retry.tentativa + 1,
          });

        } else {
          throw new Error(`API retornou status ${response.status}: ${await response.text()}`);
        }

      } catch (error: any) {
        console.error(`Erro ao processar retry ${retry.id}:`, error.message);

        const novaTentativa = retry.tentativa + 1;
        
        if (novaTentativa >= retry.max_tentativas) {
          // Falha permanente - notificar administradores
          await supabase
            .from('pedido_api_retry')
            .update({
              status: 'FALHA_PERMANENTE',
              ultimo_erro: error.message,
              updated_at: new Date().toISOString(),
            })
            .eq('id', retry.id);

          // Buscar administradores da clínica para notificar
          const { data: admins } = await supabase
            .from('user_roles')
            .select(`
              user_id,
              profiles:user_id(email, full_name)
            `)
            .eq('role', 'ADMIN')
            .eq('profiles.clinic_id', retry.pedido.clinic_id);

          console.log(`Falha permanente no pedido ${retry.pedido.numero_pedido}. Notificando ${admins?.length || 0} administradores`);

          // Aqui você poderia enviar email ou notificação push para os admins
          // Por enquanto apenas registramos no log

          resultados.push({
            pedido_id: retry.pedido.id,
            status: 'FALHA_PERMANENTE',
            tentativa: novaTentativa,
            erro: error.message,
          });

        } else {
          // Agendar próximo retry com backoff exponencial
          const proximoRetry = calcularProximoRetry(novaTentativa);
          
          await supabase
            .from('pedido_api_retry')
            .update({
              status: 'PENDENTE',
              tentativa: novaTentativa,
              proximo_retry: proximoRetry.toISOString(),
              ultimo_erro: error.message,
              updated_at: new Date().toISOString(),
            })
            .eq('id', retry.id);

          console.log(`Retry agendado para ${proximoRetry.toLocaleString()} (tentativa ${novaTentativa}/${retry.max_tentativas})`);

          resultados.push({
            pedido_id: retry.pedido.id,
            status: 'RETRY_AGENDADO',
            tentativa: novaTentativa,
            proximo_retry: proximoRetry,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processados: resultados.length,
        resultados,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in processar-retry-pedidos:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
