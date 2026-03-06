/**
 * useInventory Hooks
 * Gerencia operações de inventário através da REST API
 */

import { useInventoryAPI } from "./useInventoryAPI";

export function useInventory() {
  return useInventoryAPI();
}

export { useInventory as useInventoryUnified };
