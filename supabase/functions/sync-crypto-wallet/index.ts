import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { walletId } = await req.json();

    if (!walletId) {
      return new Response(
        JSON.stringify({ error: 'walletId is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscar dados da carteira
    const { data: wallet, error: walletError } = await supabaseClient
      .from('crypto_wallets')
      .select('*, exchange:crypto_exchange_config(*)')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    console.log(`Syncing wallet ${wallet.wallet_name} (${wallet.coin_type})`);

    // Buscar taxa de câmbio atual
    const { data: latestRate } = await supabaseClient
      .from('crypto_exchange_rates')
      .select('*')
      .eq('coin_type', wallet.coin_type)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    let exchangeRate = latestRate?.rate_brl || 0;

    // Se não houver taxa recente, buscar da API (Binance public API como exemplo)
    if (!latestRate || new Date(latestRate.timestamp) < new Date(Date.now() - 5 * 60 * 1000)) {
      try {
        const symbol = `${wallet.coin_type}BRL`;
        const binanceResponse = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        
        if (binanceResponse.ok) {
          const binanceData = await binanceResponse.json();
          exchangeRate = parseFloat(binanceData.price);

          // Salvar nova taxa
          await supabaseClient
            .from('crypto_exchange_rates')
            .insert({
              coin_type: wallet.coin_type,
              rate_brl: exchangeRate,
              rate_usd: 0, // Pode ser implementado depois
              source: 'BINANCE',
            });

          console.log(`Updated exchange rate for ${wallet.coin_type}: R$ ${exchangeRate}`);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    }

    // Simular sincronização de saldo (em produção, usar API da exchange)
    let balance = wallet.balance || 0;
    
    // Se tiver exchange configurada, buscar saldo real
    if (wallet.exchange && wallet.exchange.is_active && wallet.exchange.api_key_encrypted) {
      console.log(`Would fetch real balance from ${wallet.exchange.exchange_name}`);
      // Implementar integração real com API da exchange aqui
      // balance = await fetchBalanceFromExchange(wallet.exchange, wallet.wallet_address, wallet.coin_type);
    }

    const balanceBRL = balance * exchangeRate;

    // Atualizar carteira
    const { error: updateError } = await supabaseClient
      .from('crypto_wallets')
      .update({
        balance,
        balance_brl: balanceBRL,
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', walletId);

    if (updateError) throw updateError;

    // Registrar no audit log
    await supabaseClient
      .from('audit_logs')
      .insert({
        clinic_id: wallet.clinic_id,
        action: 'CRYPTO_WALLET_SYNCED',
        details: {
          wallet_id: walletId,
          wallet_name: wallet.wallet_name,
          coin_type: wallet.coin_type,
          balance,
          balance_brl: balanceBRL,
          exchange_rate: exchangeRate,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        wallet_id: walletId,
        balance,
        balance_brl: balanceBRL,
        exchange_rate: exchangeRate,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in sync-crypto-wallet function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
