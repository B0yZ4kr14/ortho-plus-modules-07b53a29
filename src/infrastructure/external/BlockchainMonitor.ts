/**
 * FASE 3 - SPRINT 3: Blockchain Monitor
 * 
 * Monitora endereços Bitcoin/Crypto na blockchain para detectar pagamentos recebidos.
 * Usa APIs públicas (Blockstream, BlockCypher) ou nó próprio.
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface BlockchainTransaction {
  txHash: string;
  address: string;
  amount: number; // em unidades da cripto (BTC, ETH, etc)
  confirmations: number;
  blockHeight?: number;
  timestamp: Date;
}

export interface MonitorConfig {
  address: string;
  expectedAmount: number;
  cryptocurrency: 'BTC' | 'ETH' | 'USDT' | 'BNB';
  transactionId: string; // ID da crypto_transactions
  onConfirmed: (tx: BlockchainTransaction) => void;
  onError?: (error: Error) => void;
}

export class BlockchainMonitor {
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  private readonly POLLING_INTERVAL = 30000; // 30 segundos
  private readonly MIN_CONFIRMATIONS = 1; // Mínimo para considerar confirmado

  /**
   * Inicia monitoramento de um endereço
   */
  async watchAddress(config: MonitorConfig): Promise<void> {
    logger.info(`[BlockchainMonitor] Starting watch for ${config.address} (${config.cryptocurrency})`);

    // Verificar se já está sendo monitorado
    if (this.activeMonitors.has(config.address)) {
      logger.warn(`[BlockchainMonitor] Address ${config.address} already being monitored`);
      return;
    }

    // Iniciar polling
    const intervalId = setInterval(async () => {
      try {
        const tx = await this.checkAddressBalance(config);
        
        if (tx && tx.confirmations >= this.MIN_CONFIRMATIONS) {
          logger.info(`[BlockchainMonitor] Payment confirmed for ${config.address}`, { tx });
          
          // Parar monitoramento
          this.stopWatching(config.address);
          
          // Callback de confirmação
          config.onConfirmed(tx);
        }
      } catch (error) {
        logger.error(`[BlockchainMonitor] Error checking address ${config.address}`, error);
        if (config.onError) {
          config.onError(error as Error);
        }
      }
    }, this.POLLING_INTERVAL);

    this.activeMonitors.set(config.address, intervalId);

    // Timeout: parar após 2 horas
    setTimeout(() => {
      this.stopWatching(config.address);
      logger.info(`[BlockchainMonitor] Timeout expired for ${config.address}`);
    }, 2 * 60 * 60 * 1000);
  }

  /**
   * Para de monitorar um endereço
   */
  stopWatching(address: string): void {
    const intervalId = this.activeMonitors.get(address);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeMonitors.delete(address);
      logger.info(`[BlockchainMonitor] Stopped watching ${address}`);
    }
  }

  /**
   * Verifica saldo e transações de um endereço
   */
  private async checkAddressBalance(
    config: MonitorConfig
  ): Promise<BlockchainTransaction | null> {
    switch (config.cryptocurrency) {
      case 'BTC':
        return await this.checkBitcoinAddress(config);
      case 'ETH':
        return await this.checkEthereumAddress(config);
      case 'USDT':
        return await this.checkUSDTAddress(config);
      default:
        throw new Error(`Cryptocurrency ${config.cryptocurrency} not supported`);
    }
  }

  /**
   * Verifica endereço Bitcoin usando Blockstream API
   * Documentação: https://github.com/Blockstream/esplora/blob/master/API.md
   */
  private async checkBitcoinAddress(
    config: MonitorConfig
  ): Promise<BlockchainTransaction | null> {
    try {
      // Blockstream API (mainnet)
      const baseUrl = 'https://blockstream.info/api';
      
      // 1. Buscar informações do endereço
      const addressResponse = await fetch(`${baseUrl}/address/${config.address}`);
      if (!addressResponse.ok) {
        throw new Error(`Blockstream API error: ${addressResponse.status}`);
      }
      const addressData = await addressResponse.json();

      // 2. Calcular saldo recebido
      const fundedAmount = addressData.chain_stats.funded_txo_sum || 0;
      const spentAmount = addressData.chain_stats.spent_txo_sum || 0;
      const balanceSatoshis = fundedAmount - spentAmount;
      const balanceBTC = balanceSatoshis / 100000000; // Satoshis para BTC

      // 3. Se não há saldo, retornar null
      if (balanceBTC < config.expectedAmount * 0.95) {
        // Tolerância de 5% para taxas
        return null;
      }

      // 4. Buscar última transação recebida
      const txsResponse = await fetch(`${baseUrl}/address/${config.address}/txs`);
      const txs = await txsResponse.json();

      if (!txs || txs.length === 0) {
        return null;
      }

      // Pegar a primeira tx (mais recente)
      const latestTx = txs[0];

      // 5. Verificar confirmações
      const currentBlockHeight = await this.getCurrentBlockHeight();
      const confirmations = latestTx.status.confirmed
        ? currentBlockHeight - latestTx.status.block_height + 1
        : 0;

      return {
        txHash: latestTx.txid,
        address: config.address,
        amount: balanceBTC,
        confirmations,
        blockHeight: latestTx.status.block_height,
        timestamp: new Date(latestTx.status.block_time * 1000),
      };
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking Bitcoin address:', error);
      throw error;
    }
  }

  /**
   * Verifica endereço Ethereum usando Etherscan API (requer API key em produção)
   * Alternativa: Infura, Alchemy
   */
  private async checkEthereumAddress(
    config: MonitorConfig
  ): Promise<BlockchainTransaction | null> {
    try {
      // Mock: Em produção, usar Etherscan ou Infura
      // const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${config.address}`);
      
      // Por enquanto, retornar null (não implementado)
      console.warn('[BlockchainMonitor] Ethereum monitoring not fully implemented');
      return null;
    } catch (error) {
      console.error('[BlockchainMonitor] Error checking Ethereum address:', error);
      throw error;
    }
  }

  /**
   * Verifica endereço USDT (Tether - ERC20 no Ethereum ou TRC20 no Tron)
   */
  private async checkUSDTAddress(
    config: MonitorConfig
  ): Promise<BlockchainTransaction | null> {
    // USDT pode ser ERC20 (Ethereum) ou TRC20 (Tron)
    // Por padrão, assumir ERC20
    return await this.checkEthereumAddress(config);
  }

  /**
   * Busca altura do bloco atual (Bitcoin)
   */
  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch('https://blockstream.info/api/blocks/tip/height');
      const height = await response.text();
      return parseInt(height, 10);
    } catch (error) {
      console.error('[BlockchainMonitor] Error fetching block height:', error);
      return 0;
    }
  }

  /**
   * Para todos os monitoramentos ativos
   */
  stopAll(): void {
    this.activeMonitors.forEach((intervalId, address) => {
      clearInterval(intervalId);
      console.log(`[BlockchainMonitor] Stopped watching ${address}`);
    });
    this.activeMonitors.clear();
  }
}

// Export singleton instance
export const blockchainMonitor = new BlockchainMonitor();
