import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface ExchangeConfig {
  id: string;
  clinic_id: string;
  exchange_name: string;
  api_key_encrypted: string;
  is_active: boolean;
  created_at: string;
}

interface Wallet {
  id: string;
  clinic_id: string;
  wallet_type: string;
  address: string;
  xpub?: string;
  label: string;
  created_at: string;
}

interface Portfolio {
  total_value_usd: number;
  assets: Array<{
    symbol: string;
    amount: number;
    value_usd: number;
  }>;
}

export const useCryptoConfig = () => {
  const queryClient = useQueryClient();

  const { data: exchanges = [], isLoading: isLoadingExchanges } = useQuery({
    queryKey: ['crypto-exchanges'],
    queryFn: async () => {
      return await apiClient.get<ExchangeConfig[]>('/crypto-config/exchanges');
    },
  });

  const { data: wallets = [], isLoading: isLoadingWallets } = useQuery({
    queryKey: ['crypto-wallets'],
    queryFn: async () => {
      return await apiClient.get<Wallet[]>('/crypto-config/wallets');
    },
  });

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['crypto-portfolio'],
    queryFn: async () => {
      return await apiClient.get<Portfolio>('/crypto-config/portfolio');
    },
  });

  const conectarExchange = useMutation({
    mutationFn: async (data: { exchange_name: string; api_key: string; api_secret: string }) => {
      return await apiClient.post<ExchangeConfig>('/crypto-config/exchanges/connect', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-exchanges'] });
      toast.success('Exchange conectada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao conectar exchange');
    },
  });

  const adicionarCarteira = useMutation({
    mutationFn: async (data: { wallet_type: string; address?: string; xpub?: string; label: string }) => {
      return await apiClient.post<Wallet>('/crypto-config/wallets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-wallets'] });
      toast.success('Carteira adicionada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao adicionar carteira');
    },
  });

  const configurarDCA = useMutation({
    mutationFn: async (data: {
      exchange_id: string;
      asset: string;
      amount: number;
      frequency: string;
    }) => {
      return await apiClient.post('/crypto-config/dca', data);
    },
    onSuccess: () => {
      toast.success('Estratégia DCA configurada!');
    },
    onError: () => {
      toast.error('Erro ao configurar DCA');
    },
  });

  return {
    exchanges,
    isLoadingExchanges,
    wallets,
    isLoadingWallets,
    portfolio,
    isLoadingPortfolio,
    conectarExchange: conectarExchange.mutate,
    adicionarCarteira: adicionarCarteira.mutate,
    configurarDCA: configurarDCA.mutate,
    isConectandoExchange: conectarExchange.isPending,
  };
};
