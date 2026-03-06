import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { fetchExchangeRateWithCache } from "@/lib/utils/crypto-cache.utils";
import { useEffect, useState } from "react";
import { toast as sonnerToast } from "sonner";
import type {
  CryptoTransactionComplete,
  CryptoWallet,
  ExchangeConfig,
} from "../types/crypto.types";

export const useCrypto = (clinicId: string) => {
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransactionComplete[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    if (!clinicId) {
      logger.debug("[useCrypto] No clinicId, skipping data load");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [exchangesData, walletsData, transactionsData] = await Promise.all([
        apiClient.get<ExchangeConfig[]>(
          `/crypto/exchanges?clinic_id=${clinicId}`,
        ),
        apiClient.get<CryptoWallet[]>(`/crypto/wallets?clinic_id=${clinicId}`),
        apiClient.get<CryptoTransactionComplete[]>(
          `/crypto/transactions?clinic_id=${clinicId}`,
        ),
      ]);

      setExchanges(exchangesData || []);
      setWallets(walletsData || []);
      setTransactions(transactionsData || []);

      logger.debug("[useCrypto] Data loaded successfully", {
        exchanges: exchangesData?.length || 0,
        wallets: walletsData?.length || 0,
        transactions: transactionsData?.length || 0,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("[useCrypto] Error loading crypto data", error);
      toast({
        title: "Erro ao carregar dados",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Realtime subscriptions removed — use reload() for manual refresh
  }, [clinicId]);

  const createExchangeConfig = async (data: Partial<ExchangeConfig>) => {
    try {
      const newConfig = await apiClient.post<ExchangeConfig>(
        "/crypto/exchanges",
        { ...data, clinic_id: clinicId },
      );

      toast({
        title: "Exchange configurada",
        description: "A exchange foi configurada com sucesso.",
      });

      await loadData();
      return newConfig;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error creating exchange config:", error);
      toast({
        title: "Erro ao configurar exchange",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createWallet = async (data: Partial<CryptoWallet>) => {
    try {
      const newWallet = await apiClient.post<CryptoWallet>("/crypto/wallets", {
        ...data,
        clinic_id: clinicId,
      });

      toast({
        title: "Carteira criada",
        description: "A carteira foi criada com sucesso.",
      });

      await loadData();
      return newWallet;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error creating wallet:", error);
      toast({
        title: "Erro ao criar carteira",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const syncWalletBalance = async (walletId: string) => {
    try {
      const data = await apiClient.post("/crypto/wallets/sync", { walletId });

      toast({
        title: "Saldo sincronizado",
        description: "O saldo da carteira foi atualizado com sucesso.",
      });

      await loadData();
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error syncing wallet:", error);
      toast({
        title: "Erro ao sincronizar saldo",
        description: msg,
        variant: "destructive",
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
    if (!clinicId) throw new Error("Clinic ID required");

    const wallet = wallets.find((w) => w.id === data.wallet_id);
    if (!wallet) throw new Error("Wallet not found");

    const exchange = exchanges.find((e) => e.id === wallet.exchange_config_id);
    const processingFeePercentage = exchange?.processing_fee_percentage || 0;

    const exchangeRate = await fetchExchangeRateWithCache(wallet.coin_type);
    const amountBrl = data.amount_crypto * exchangeRate;
    const processingFeeBrl = (amountBrl * processingFeePercentage) / 100;
    const netAmountBrl = amountBrl - processingFeeBrl;

    const transaction = await apiClient.post<CryptoTransactionComplete>(
      "/crypto/transactions",
      {
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
        tipo: "RECEBIMENTO",
        status: "PENDENTE",
        confirmations: 0,
        required_confirmations: 3,
        to_address: wallet.wallet_address,
      },
    );

    const feeMessage =
      processingFeePercentage > 0
        ? ` (Taxa de ${processingFeePercentage}%: R$ ${processingFeeBrl.toFixed(2)})`
        : "";
    sonnerToast.success(
      `Solicitação de pagamento criada! Aguardando confirmação...${feeMessage}`,
    );
    await loadData();
    return transaction;
  };

  const convertCryptoToBRL = async (transactionId: string) => {
    try {
      const data = await apiClient.post("/crypto/convert", { transactionId });

      toast({
        title: "Conversão iniciada",
        description: "A conversão para BRL foi iniciada com sucesso.",
      });

      await loadData();
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error converting crypto:", error);
      toast({
        title: "Erro ao converter",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getDashboardData = () => {
    const totalBTC = transactions
      .filter((t) => t.coin_type === "BTC" && t.status === "CONFIRMADO")
      .reduce((sum, t) => sum + (t.amount_crypto || 0), 0);

    const totalBRL = transactions
      .filter((t) => t.status === "CONFIRMADO")
      .reduce((sum, t) => sum + (t.amount_brl || 0), 0);

    const pendingTransactions = transactions.filter(
      (t) => t.status === "PENDENTE",
    ).length;
    const confirmedToday = transactions.filter(
      (t) =>
        t.status === "CONFIRMADO" &&
        new Date(t.created_at).toDateString() === new Date().toDateString(),
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
