import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xpub, derivationPath, index } = await req.json();

    // Mock validation - in production, use proper BIP32 library
    if (!xpub || !xpub.match(/^(xpub|ypub|zpub|tpub)/)) {
      throw new Error('xPub inválido');
    }

    // Generate mock address based on index
    const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;

    return new Response(JSON.stringify({ address: mockAddress }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
