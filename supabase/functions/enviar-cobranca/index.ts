import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnviarCobrancaRequest {
  cobrancaId: string;
  tipo: 'EMAIL' | 'WHATSAPP';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("enviar-cobranca function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { cobrancaId, tipo }: EnviarCobrancaRequest = await req.json();

    // Buscar dados da cobrança
    const { data: cobranca, error: cobrancaError } = await supabase
      .from('cobrancas')
      .select(`
        *,
        cobranca_config:clinic_id(
          mensagem_email_template,
          mensagem_whatsapp_template
        )
      `)
      .eq('id', cobrancaId)
      .single();

    if (cobrancaError || !cobranca) {
      throw new Error("Cobrança não encontrada");
    }

    let resultado: any = { sucesso: false };

    if (tipo === 'EMAIL') {
      // Enviar email via Resend
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      
      const template = cobranca.cobranca_config?.mensagem_email_template || `
        <h2>Lembrete de Pagamento - Ortho+</h2>
        <p>Olá ${cobranca.paciente_nome},</p>
        <p>Identificamos um pagamento pendente em sua conta:</p>
        <ul>
          <li><strong>Descrição:</strong> ${cobranca.descricao || 'Serviço odontológico'}</li>
          <li><strong>Valor:</strong> R$ ${cobranca.valor_pendente.toFixed(2)}</li>
          <li><strong>Vencimento:</strong> ${new Date(cobranca.data_vencimento).toLocaleDateString('pt-BR')}</li>
          <li><strong>Dias em atraso:</strong> ${cobranca.dias_atraso} dias</li>
        </ul>
        <p>Por favor, regularize sua situação o mais breve possível.</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <br>
        <p>Atenciosamente,<br>Equipe Ortho+</p>
      `;

      const emailResponse = await resend.emails.send({
        from: "Ortho+ Cobranças <onboarding@resend.dev>",
        to: [cobranca.email],
        subject: `Lembrete de Pagamento - ${cobranca.dias_atraso} dias em atraso`,
        html: template,
      });

      resultado = { sucesso: true, detalhes: emailResponse };
      console.log("Email enviado com sucesso:", emailResponse);

    } else if (tipo === 'WHATSAPP') {
      // Para WhatsApp, seria necessário integração com API do WhatsApp Business
      // Por enquanto, vamos simular o envio
      const mensagem = cobranca.cobranca_config?.mensagem_whatsapp_template || 
        `Olá ${cobranca.paciente_nome}! Identificamos um pagamento pendente no valor de R$ ${cobranca.valor_pendente.toFixed(2)} com ${cobranca.dias_atraso} dias de atraso. Por favor, regularize sua situação. Em caso de dúvidas, entre em contato.`;
      
      console.log("WhatsApp message prepared:", mensagem);
      resultado = { sucesso: true, detalhes: { mensagem, telefone: cobranca.telefone } };
    }

    // Registrar tentativa de cobrança
    const { error: tentativaError } = await supabase
      .from('cobranca_tentativas')
      .insert({
        cobranca_id: cobrancaId,
        tipo_contato: tipo,
        status: resultado.sucesso ? 'ENVIADO' : 'FALHA',
        mensagem_enviada: tipo === 'WHATSAPP' ? resultado.detalhes.mensagem : 'Email HTML',
        erro: resultado.sucesso ? null : resultado.erro,
        created_by: user.id,
      });

    if (tentativaError) {
      console.error("Erro ao registrar tentativa:", tentativaError);
    }

    // Atualizar cobrança
    const { error: updateError } = await supabase
      .from('cobrancas')
      .update({
        tentativas_contato: cobranca.tentativas_contato + 1,
        ultima_tentativa_contato: new Date().toISOString(),
        status: 'EM_COBRANCA',
      })
      .eq('id', cobrancaId);

    if (updateError) {
      console.error("Erro ao atualizar cobrança:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cobrança enviada via ${tipo} com sucesso`,
        resultado 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in enviar-cobranca:", error);
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
