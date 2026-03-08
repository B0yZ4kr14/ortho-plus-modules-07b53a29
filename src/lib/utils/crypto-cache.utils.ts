// Cache de cotações de criptomoedas para reduzir chamadas à API externa

interface CachedRate {
  rate: number;
  timestamp: number;
}

interface CacheStore {
  [coinType: string]: CachedRate;
}

// Cache válido por 5 minutos
const CACHE_DURATION_MS = 5 * 60 * 1000;
const CACHE_KEY = 'crypto_rates_cache';

// Helper function to get coin ID for CoinGecko API
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

// Fallback rates (simulados) caso API falhe
const FALLBACK_RATES: Record<string, number> = {
  BTC: 350000,
  ETH: 18000,
  USDT: 5.2,
  BNB: 2200,
  USDC: 5.2,
};

/**
 * Busca cotação do cache local (localStorage)
 */
const getCachedRate = (coinType: string): number | null => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const cacheStore: CacheStore = JSON.parse(cache);
    const cached = cacheStore[coinType];

    if (!cached) return null;

    // Verificar se cache ainda é válido
    const isValid = Date.now() - cached.timestamp < CACHE_DURATION_MS;
    if (!isValid) return null;    return cached.rate;
  } catch (error) {
    console.error('[CryptoCache] Error reading cache:', error);
    return null;
  }
};

/**
 * Salva cotação no cache local
 */
const setCachedRate = (coinType: string, rate: number): void => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    const cacheStore: CacheStore = cache ? JSON.parse(cache) : {};

    cacheStore[coinType] = {
      rate,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheStore));  } catch (error) {
    console.error('[CryptoCache] Error writing cache:', error);
  }
};

/**
 * Busca cotação da API externa (CoinGecko)
 */
const fetchRateFromAPI = async (coinType: string): Promise<number> => {
  try {
    const coinId = getCoinGeckoId(coinType);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const rate = data[coinId]?.brl;

    if (!rate) {
      throw new Error('Rate not found in API response');
    }    return rate;
  } catch (error) {
    console.error(`[CryptoCache] Error fetching ${coinType} rate from API:`, error);
    throw error;
  }
};

/**
 * Busca cotação com cache automático
 * 
 * Ordem de tentativa:
 * 1. Cache local (localStorage) - se válido (< 5min)
 * 2. API CoinGecko - se cache expirado ou inexistente
 * 3. Fallback - valores simulados se API falhar
 */
export const fetchExchangeRateWithCache = async (coinType: string): Promise<number> => {
  // 1. Tentar cache local primeiro
  const cachedRate = getCachedRate(coinType);
  if (cachedRate !== null) {
    return cachedRate;
  }

  // 2. Cache expirado/inexistente, buscar da API
  try {
    const rate = await fetchRateFromAPI(coinType);
    setCachedRate(coinType, rate);
    return rate;
  } catch (error) {
    // 3. API falhou, usar fallback
    console.warn(`[CryptoCache] Using fallback rate for ${coinType}`);
    const fallbackRate = FALLBACK_RATES[coinType] || 0;
    return fallbackRate;
  }
};

/**
 * Limpa cache de cotações (útil para testes ou forçar refresh)
 */
export const clearCryptoCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);  } catch (error) {
    console.error('[CryptoCache] Error clearing cache:', error);
  }
};

/**
 * Pré-carrega cotações de múltiplas moedas em paralelo
 */
export const preloadExchangeRates = async (coinTypes: string[]): Promise<void> => {
  await Promise.all(
    coinTypes.map((coinType) => fetchExchangeRateWithCache(coinType))
  );
};
