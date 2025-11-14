/**
 * DI Container Public API
 */

import { container as diContainer } from './Container';

export { Container, container } from './Container';
export { SERVICE_KEYS } from './ServiceKeys';
export { bootstrapContainer } from './bootstrap';

// Helper para uso nos componentes React
export function useService<T>(key: string): T {
  return diContainer.resolve<T>(key);
}
