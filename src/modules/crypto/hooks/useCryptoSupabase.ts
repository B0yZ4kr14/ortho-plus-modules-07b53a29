import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import type { ExchangeConfig, CryptoWallet, CryptoTransactionComplete } from '../types/crypto.types';
import { fetchExchangeRateWithCache } from '@/lib/utils/crypto-cache.utils';
import { logger } from '@/lib/logger';

export const useCryptoSupabase = (clinicId: string) => {
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransactionComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    if (!clinicId) {
      logger.debug('[CryptoSupabase] No clinicId, skipping data load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load exchange configs
      const { data: exchangesData, error: exchangesError } = await supabase
        .from('crypto_exchange_config')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (exchangesError) {
        logger.error('[CryptoSupabase] Error loading exchanges', exchangesError);
        throw exchangesError;
      }

      // Load wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (walletsError) {
        logger.error('[CryptoSupabase] Error loading wallets', walletsError);
        throw walletsError;
      }

      // Load transactions with related data using native joins
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('crypto_transactions')
        .select(`
          *,
          prontuario:prontuarios!patient_id(patient_name),
          wallet:crypto_wallets(wallet_name, coin_type),
          exchange:crypto_exchange_config(exchange_name, processing_fee_percentage)
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        logger.error('[CryptoSupabase] Error loading transactions', transactionsError);
        throw transactionsError;
      }

      // Map transactions with processing_fee_percentage from exchange
      const mappedTransactions = (transactionsData || []).map((tx: any) => ({
        ...tx,
        patient_name: tx.prontuario?.patient_name || null,
        wallet_name: tx.wallet?.wallet_name || null,
        exchange_name: tx.exchange?.exchange_name || null,
        processing_fee_percentage: tx.exchange?.processing_fee_percentage || 0,
      }));

      setExchanges(exchangesData || []);
      setWallets(walletsData || []);
      setTransactions(mappedTransactions);
      
      logger.debug('[CryptoSupabase] Data loaded successfully', {
        exchanges: exchangesData?.length || 0,
        wallets: walletsData?.length || 0,
        transactions: mappedTransactions?.length || 0,
      });
    } catch (error: any) {
      logger.error('[CryptoSupabase] Error loading crypto data', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sempre tentar carregar uma vez; se não houver clinicId o loadData encerra o loading rapidamente
    loadData();

    if (!clinicId) {
      return; // sem subscriptions sem clínica selecionada
    }

    // Setup realtime subscriptions
    const exchangesChannel = supabase
      .channel('crypto-exchanges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_exchange_config',
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          console.log('Exchanges changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    const walletsChannel = supabase
      .channel('crypto-wallets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_wallets',
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          console.log('Wallets changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('crypto-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_transactions',
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          console.log('Crypto transactions changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(exchangesChannel);
      supabase.removeChannel(walletsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [clinicId]);

  const createExchangeConfig = async (data: Partial<ExchangeConfig>) => {
    try {
      const { data: newConfig, error } = await supabase
        .from('crypto_exchange_config')
        .insert([{ ...data, clinic_id: clinicId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Exchange configurada',
        description: 'A exchange foi configurada com sucesso.',
      });

      return newConfig;
    } catch (error: any) {
      console.error('Error creating exchange config:', error);
      toast({
        title: 'Erro ao configurar exchange',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createWallet = async (data: Partial<CryptoWallet>) => {
    try {
      const { data: newWallet, error } = await supabase
        .from('crypto_wallets')
        .insert([{ ...data, clinic_id: clinicId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Carteira criada',
        description: 'A carteira foi criada com sucesso.',
      });

      return newWallet;
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast({
        title: 'Erro ao criar carteira',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const syncWalletBalance = async (walletId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-crypto-wallet', {
        body: { walletId },
      });

      if (error) throw error;

      toast({
        title: 'Saldo sincronizado',
        description: 'O saldo da carteira foi atualizado com sucesso.',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error syncing wallet:', error);
      toast({
        title: 'Erro ao sincronizar saldo',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createPaymentRequest = async (data: {
    wallet_id: string;
    amount_crypto: number;
    patient_id?: string;
    conta_receber_id?: string;
  }) => {
    if (!clinicId) throw new Error('Clinic ID required');

    const wallet = wallets.find(w => w.id === data.wallet_id);
    if (!wallet) throw new Error('Wallet not found');

    // Buscar configuração da exchange para obter taxa de processamento
    const exchange = exchanges.find(e => e.id === wallet.exchange_config_id);
    const processingFeePercentage = exchange?.processing_fee_percentage || 0;

    const exchangeRate = await fetchExchangeRateWithCache(wallet.coin_type);
    const amountBrl = data.amount_crypto * exchangeRate;
    const processingFeeBrl = (amountBrl * processingFeePercentage) / 100;
    const netAmountBrl = amountBrl - processingFeeBrl;

    const { data: transaction, error } = await supabase
      .from('crypto_transactions')
      .insert({
        clinic_id: clinicId,
        exchange_config_id: wallet.exchange_config_id,
        wallet_id: data.wallet_id,
        patient_id: data.patient_id,
        conta_receber_id: data.conta_receber_id,
        coin_type: wallet.coin_type,
        amount_crypto: data.amount_crypto,
        amount_brl: amountBrl,
        exchange_rate: exchangeRate,
        processing_fee_brl: processingFeeBrl,
        net_amount_brl: netAmountBrl,
        tipo: 'RECEBIMENTO',
        status: 'PENDENTE',
        confirmations: 0,
        required_confirmations: 3,
        to_address: wallet.wallet_address,
      })
      .select()
      .single();

    if (error) throw error;

    const feeMessage = processingFeePercentage > 0 
      ? ` (Taxa de ${processingFeePercentage}%: R$ ${processingFeeBrl.toFixed(2)})`
      : '';
    sonnerToast.success(`Solicitação de pagamento criada! Aguardando confirmação...${feeMessage}`);
    await loadData();
    return transaction;
  };

  const convertCryptoToBRL = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('convert-crypto-to-brl', {
        body: { transactionId },
      });

      if (error) throw error;

      toast({
        title: 'Conversão iniciada',
        description: 'A conversão para BRL foi iniciada com sucesso.',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error converting crypto:', error);
      toast({
        title: 'Erro ao converter',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getDashboardData = () => {
    const totalBTC = transactions
      .filter(t => t.coin_type === 'BTC' && t.status === 'CONFIRMADO')
      .reduce((sum, t) => sum + (t.amount_crypto || 0), 0);

    const totalBRL = transactions
      .filter(t => t.status === 'CONFIRMADO')
      .reduce((sum, t) => sum + (t.amount_brl || 0), 0);

    const pendingTransactions = transactions.filter(t => t.status === 'PENDENTE').length;
    const confirmedToday = transactions.filter(t => 
      t.status === 'CONFIRMADO' && 
      new Date(t.created_at).toDateString() === new Date().toDateString()
    ).length;

    return {
      totalBTC,
      totalBRL,
      pendingTransactions,
      confirmedToday,
    };
  };

  return {
    exchanges,
    wallets,
    transactions,
    loading,
    createExchangeConfig,
    createWallet,
    syncWalletBalance,
    convertCryptoToBRL,
    getDashboardData,
    createPaymentRequest,
    reload: loadData,
  };
};
