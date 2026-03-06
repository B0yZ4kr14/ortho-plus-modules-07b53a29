import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { teleconsultaId } = await req.json();

    if (!teleconsultaId) {
      throw new Error('teleconsultaId is required');
    }

    // Get teleconsulta details
    const { data: teleconsulta, error: teleconsultaError } = await supabase
      .from('teleconsultas')
      .select('*')
      .eq('id', teleconsultaId)
      .single();

    if (teleconsultaError) throw teleconsultaError;

    // Generate Agora.io token
    // In production, you would use Agora.io SDK to generate real tokens
    // For now, we'll create a mock token structure
    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID') || 'demo-app-id';
    const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    // Mock token generation (replace with real Agora.io SDK in production)
    const channelName = `teleconsulta-${teleconsultaId}`;
    const uid = Math.floor(Math.random() * 100000);
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    let token: string;
    
    if (AGORA_APP_CERTIFICATE) {
      // In production, use Agora RTC SDK to generate real token
      // npm install agora-access-token
      // import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
      // token = RtcTokenBuilder.buildTokenWithUid(
      //   AGORA_APP_ID,
      //   AGORA_APP_CERTIFICATE,
      //   channelName,
      //   uid,
      //   RtcRole.PUBLISHER,
      //   expirationTime
      // );
      
      // For now, mock token
      token = `mock-token-${Date.now()}`;
    } else {
      // Development mode - no certificate needed
      token = `dev-token-${Date.now()}`;
    }

    // Update teleconsulta with link_sala
    const salaUrl = `${supabaseUrl}/teleconsulta/sala/${teleconsultaId}`;
    
    const { error: updateError } = await supabase
      .from('teleconsultas')
      .update({ link_sala: salaUrl })
      .eq('id', teleconsultaId);

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: teleconsulta.dentist_id,
      clinic_id: teleconsulta.clinic_id,
      action: 'TELECONSULTA_STARTED',
      details: {
        teleconsulta_id: teleconsultaId,
        channel_name: channelName,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        token,
        appId: AGORA_APP_ID,
        channelName,
        uid,
        salaUrl,
        expirationTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating video token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
