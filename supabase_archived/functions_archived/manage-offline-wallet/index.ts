import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, wallet_name, hardware_type, xpub, derivation_path, supported_coins, notes } = await req.json();

    if (action === 'create') {
      // Encrypt xPub (simplified - in production use proper encryption)
      const encryptionKey = Deno.env.get('XPUB_ENCRYPTION_KEY') || 'default-key';
      
      const { data, error } = await supabaseClient
        .from('crypto_offline_wallets')
        .insert({
          wallet_name,
          hardware_type,
          xpub_encrypted: xpub, // TODO: Implement encryption
          derivation_path,
          supported_coins,
          notes,
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, wallet: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
