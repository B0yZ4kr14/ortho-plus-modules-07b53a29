import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { clinic_id, user_id, tipo, titulo, mensagem, link_acao } = await req.json();

    if (!clinic_id || !tipo || !titulo || !mensagem) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert({
        clinic_id,
        user_id: user_id || null,
        tipo,
        titulo,
        mensagem,
        link_acao: link_acao || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit
    await supabaseClient.from('audit_logs').insert({
      clinic_id,
      user_id,
      action: 'NOTIFICATION_CREATED',
      details: { tipo, titulo, notification_id: data.id },
    });

    return new Response(
      JSON.stringify({ success: true, notification: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
