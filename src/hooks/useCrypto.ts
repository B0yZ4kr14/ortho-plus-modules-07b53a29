/**
 * Hook para operações Crypto
 * Gerencia exchanges, wallets offline e transações
 */

import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface CryptoWallet {
  id: string;
  clinic_id: string;
  wallet_address: string;
  coin_type: string;
  wallet_name: string;
  balance: number;
  balance_brl: number;
  is_active: boolean;
}

export interface CryptoExchange {
  id: string;
  clinic_id: string;
  exchange_name: string;
  is_active: boolean;
  supported_coins: string[];
  auto_convert_to_brl: boolean;
}

export interface OfflineWallet {
  id: string;
  clinic_id: string;
  wallet_name: string;
  hardware_type: string;
  derivation_path: string;
  last_used_index: number;
  is_active: boolean;
  is_verified: boolean;
  supported_coins: string[];
}

export function useCrypto() {
  const { clinicId } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [exchanges, setExchanges] = useState<CryptoExchange[]>([]);
  const [offlineWallets, setOfflineWallets] = useState<OfflineWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadCryptoData();
    }
  }, [clinicId]);

  const loadCryptoData = async () => {
    try {
      setLoading(true);

      const data = await apiClient.get<{
        wallets: CryptoWallet[];
        exchanges: CryptoExchange[];
        offline: OfflineWallet[];
      }>("/crypto_config/dashboard");

      setWallets(data.wallets || []);
      setExchanges(data.exchanges || []);
      setOfflineWallets(data.offline || []);
    } catch (error) {
      console.error("Error loading crypto data:", error);
      toast.error("Erro ao carregar dados crypto");
    } finally {
      setLoading(false);
    }
  };

  const createExchange = async (exchangeData: Partial<CryptoExchange>) => {
    try {
      await apiClient.post("/crypto_config/exchange", {
        ...exchangeData,
        clinic_id: clinicId,
      });

      toast.success("Exchange configurada com sucesso!");
      await loadCryptoData();
    } catch (error: any) {
      console.error("Error creating exchange:", error);
      toast.error("Erro ao configurar exchange");
      throw error;
    }
  };

  const createWallet = async (walletData: Partial<CryptoWallet>) => {
    try {
      await apiClient.post("/crypto_config/wallet", {
        ...walletData,
        clinic_id: clinicId,
      });

      toast.success("Wallet criada com sucesso!");
      await loadCryptoData();
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      toast.error("Erro ao criar wallet");
      throw error;
    }
  };

  const createOfflineWallet = async (walletData: {
    wallet_name: string;
    hardware_type: string;
    xpub: string;
    derivation_path: string;
    supported_coins: string[];
  }) => {
    try {
      // Call backend to manage offline wallet
      const data = await apiClient.post("/crypto_config/offline-wallet", {
        action: "create",
        clinic_id: clinicId,
        ...walletData,
      });

      toast.success("Wallet offline configurada com sucesso!");
      await loadCryptoData();
      return data;
    } catch (error: any) {
      console.error("Error creating offline wallet:", error);
      toast.error("Erro ao configurar wallet offline");
      throw error;
    }
  };

  const generatePaymentAddress = async (
    offlineWalletId: string,
    amount: number,
  ) => {
    try {
      const data = await apiClient.post("/crypto_config/payment-address", {
        offline_wallet_id: offlineWalletId,
        amount,
      });

      return data;
    } catch (error: any) {
      console.error("Error generating payment address:", error);
      toast.error("Erro ao gerar endereço de pagamento");
      throw error;
    }
  };

  return {
    wallets,
    exchanges,
    offlineWallets,
    loading,
    createExchange,
    createWallet,
    createOfflineWallet,
    generatePaymentAddress,
    reloadData: loadCryptoData,
  };
}
