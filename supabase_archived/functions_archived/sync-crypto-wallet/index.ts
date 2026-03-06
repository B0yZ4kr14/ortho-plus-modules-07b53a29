import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Buscar taxa de câmbio com cache (5min)
const getCoinGeckoId = (coinType: string): string => {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    USDC: 'usd-coin',
  };
  return mapping[coinType] || coinType.toLowerCase();
};

const fetchExchangeRateWithCache = async (
  supabaseClient: any,
  coinType: string
): Promise<number> => {
  // 1. Tentar buscar do cache (< 5min)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: cachedRate } = await supabaseClient
    .from('crypto_exchange_rates')
    .select('rate_brl')
    .eq('coin_type', coinType)
    .gte('timestamp', fiveMinutesAgo)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (cachedRate) {
    console.log(`Using cached rate for ${coinType}: R$ ${cachedRate.rate_brl}`);
    return cachedRate.rate_brl;
  }

  // 2. Cache expirado/inexistente, buscar da API CoinGecko
  try {
    const coinId = getCoinGeckoId(coinType);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl`
    );

    if (response.ok) {
      const data = await response.json();
      const rate = data[coinId]?.brl;

      if (rate) {
        // Salvar no cache
        await supabaseClient
          .from('crypto_exchange_rates')
          .insert({
            coin_type: coinType,
            rate_brl: rate,
            source: 'COINGECKO',
          });

        console.log(`Fetched and cached rate for ${coinType}: R$ ${rate}`);
        return rate;
      }
    }
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
  }

  // 3. Fallback para taxa simulada
  const fallbackRates: Record<string, number> = {
    BTC: 350000,
    ETH: 18000,
    USDT: 5.2,
    BNB: 2200,
    USDC: 5.2,
  };
  console.warn(`Using fallback rate for ${coinType}`);
  return fallbackRates[coinType] || 0;
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

    // Buscar taxa de câmbio atual com cache otimizado
    let exchangeRate = await fetchExchangeRateWithCache(supabaseClient, wallet.coin_type);

    // Buscar saldo real da exchange
    let balance = wallet.balance || 0;
    
    if (wallet.exchange && wallet.exchange.is_active && wallet.exchange.api_key_encrypted) {
      console.log(`Fetching real balance from ${wallet.exchange.exchange_name}`);
      
      try {
        if (wallet.exchange.exchange_name === 'BINANCE') {
          // Integração com Binance API
          const binanceApiKey = wallet.exchange.api_key_encrypted; // Em produção, descriptografar
          const binanceResponse = await fetch(
            'https://api.binance.com/api/v3/account',
            {
              headers: {
                'X-MBX-APIKEY': binanceApiKey,
              },
            }
          );
          
          if (binanceResponse.ok) {
            const accountData = await binanceResponse.json();
            const assetBalance = accountData.balances.find(
              (b: any) => b.asset === wallet.coin_type
            );
            if (assetBalance) {
              balance = parseFloat(assetBalance.free) + parseFloat(assetBalance.locked);
              console.log(`Real balance from Binance: ${balance} ${wallet.coin_type}`);
            }
          }
        } else if (wallet.exchange.exchange_name === 'COINBASE') {
          // Integração com Coinbase API
          const coinbaseApiKey = wallet.exchange.api_key_encrypted;
          const coinbaseResponse = await fetch(
            `https://api.coinbase.com/v2/accounts`,
            {
              headers: {
                'Authorization': `Bearer ${coinbaseApiKey}`,
                'CB-VERSION': '2024-01-01',
              },
            }
          );
          
          if (coinbaseResponse.ok) {
            const accountData = await coinbaseResponse.json();
            const cryptoAccount = accountData.data.find(
              (acc: any) => acc.currency === wallet.coin_type
            );
            if (cryptoAccount) {
              balance = parseFloat(cryptoAccount.balance.amount);
              console.log(`Real balance from Coinbase: ${balance} ${wallet.coin_type}`);
            }
          }
        } else {
          // Para outras exchanges, usar valor atual
          console.log(`Exchange ${wallet.exchange.exchange_name} not implemented yet`);
        }
      } catch (error) {
        console.error(`Error fetching balance from ${wallet.exchange.exchange_name}:`, error);
        // Manter saldo atual em caso de erro
      }
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
