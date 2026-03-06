/**
 * useTransactionsUnified Hook
 * Legacy unifier updated to directly use the REST API
 */

import { useTransactionsAPI } from "./useTransactionsAPI";

export function useTransactionsUnified() {
  return useTransactionsAPI();
}

export { useTransactionsUnified as useTransactions };
