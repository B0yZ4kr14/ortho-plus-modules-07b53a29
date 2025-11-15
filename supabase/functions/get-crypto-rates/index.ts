import { corsHeaders } from '../_shared/cors.ts'

console.log('get-crypto-rates function started')

interface CryptoRate {
  symbol: string
  name: string
  price_brl: number
  price_usd: number
  change_24h: number
  volume_24h: number
  market_cap: number
  last_updated: string
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE']

async function fetchCoinGeckoRates(): Promise<CryptoRate[]> {
  try {
    const ids = 'bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin'
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl,usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    )
    
    if (!response.ok) {
      throw new Error('CoinGecko API error')
    }

    const data = await response.json()
    
    const cryptoMap: Record<string, string> = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      tether: 'USDT',
      binancecoin: 'BNB',
      solana: 'SOL',
      ripple: 'XRP',
      cardano: 'ADA',
      dogecoin: 'DOGE'
    }

    const nameMap: Record<string, string> = {
      bitcoin: 'Bitcoin',
      ethereum: 'Ethereum',
      tether: 'Tether',
      binancecoin: 'BNB',
      solana: 'Solana',
      ripple: 'XRP',
      cardano: 'Cardano',
      dogecoin: 'Dogecoin'
    }

    const rates: CryptoRate[] = []
    
    for (const [id, symbol] of Object.entries(cryptoMap)) {
      if (data[id]) {
        rates.push({
          symbol,
          name: nameMap[id],
          price_brl: data[id].brl || 0,
          price_usd: data[id].usd || 0,
          change_24h: data[id].brl_24h_change || 0,
          volume_24h: data[id].brl_24h_vol || 0,
          market_cap: data[id].brl_market_cap || 0,
          last_updated: new Date().toISOString()
        })
      }
    }

    return rates
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error)
    throw error
  }
}

function generateMockRates(): CryptoRate[] {
  const baseRates: Record<string, { price: number, name: string }> = {
    BTC: { price: 350000, name: 'Bitcoin' },
    ETH: { price: 12000, name: 'Ethereum' },
    USDT: { price: 5.50, name: 'Tether' },
    BNB: { price: 1500, name: 'BNB' },
    SOL: { price: 600, name: 'Solana' },
    XRP: { price: 3.20, name: 'XRP' },
    ADA: { price: 2.80, name: 'Cardano' },
    DOGE: { price: 0.45, name: 'Dogecoin' }
  }

  return CRYPTO_SYMBOLS.map(symbol => {
    const base = baseRates[symbol]
    const variance = (Math.random() - 0.5) * 0.1 // ±5%
    const price = base.price * (1 + variance)
    
    return {
      symbol,
      name: base.name,
      price_brl: price,
      price_usd: price / 5.5,
      change_24h: (Math.random() - 0.5) * 10, // -5% to +5%
      volume_24h: Math.random() * 1000000000,
      market_cap: Math.random() * 10000000000,
      last_updated: new Date().toISOString()
    }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let rates: CryptoRate[]

    try {
      // Tentar API real primeiro
      rates = await fetchCoinGeckoRates()
      console.log('Successfully fetched rates from CoinGecko')
    } catch (error) {
      // Fallback para dados mock
      console.warn('Failed to fetch from CoinGecko, using mock data:', error)
      rates = generateMockRates()
    }

    return new Response(
      JSON.stringify({
        success: true,
        rates,
        source: rates.length > 0 ? 'coingecko' : 'mock',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-crypto-rates:', error)
    
    // Retornar dados mock em caso de erro total
    const mockRates = generateMockRates()
    
    return new Response(
      JSON.stringify({
        success: true,
        rates: mockRates,
        source: 'mock',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
