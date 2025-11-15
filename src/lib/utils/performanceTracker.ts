/**
 * Performance Tracker Class
 * Monitora performance de componentes e operações
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'component' | 'operation' | 'api';
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private thresholds = {
    component: 100, // 100ms
    operation: 200,
    api: 1000,
  };
  private maxMetrics = 100;

  /**
   * Mede tempo de execução de uma função
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetric['type'] = 'operation',
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata,
      });

      if (duration > this.thresholds[type]) {
        console.warn(
          `[PerformanceTracker] Slow ${type} detected: ${name} took ${duration.toFixed(2)}ms (threshold: ${this.thresholds[type]}ms)`,
          metadata
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata: { ...metadata, error: true },
      });
      throw error;
    }
  }

  /**
   * Marca início de medição
   */
  start(name: string): (type?: PerformanceMetric['type'], metadata?: Record<string, any>) => void {
    const startTime = performance.now();
    
    return (type: PerformanceMetric['type'] = 'operation', metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata,
      });

      if (duration > this.thresholds[type]) {
        console.warn(
          `[PerformanceTracker] Slow ${type} detected: ${name} took ${duration.toFixed(2)}ms`,
          metadata
        );
      }
    };
  }

  /**
   * Registra métrica
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Limitar tamanho do array
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Obtém métricas filtradas
   */
  getMetrics(filter?: {
    type?: PerformanceMetric['type'];
    minDuration?: number;
    limit?: number;
  }): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (filter?.type) {
      filtered = filtered.filter(m => m.type === filter.type);
    }

    if (filter?.minDuration) {
      filtered = filtered.filter(m => m.duration >= filter.minDuration);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * Obtém estatísticas
   */
  getStats(type?: PerformanceMetric['type']): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const metrics = type ? this.metrics.filter(m => m.type === type) : this.metrics;
    
    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Limpa métricas
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Configura thresholds
   */
  setThreshold(type: PerformanceMetric['type'], value: number): void {
    this.thresholds[type] = value;
  }

  /**
   * Gera relatório
   */
  getReport(): string {
    const stats = {
      component: this.getStats('component'),
      operation: this.getStats('operation'),
      api: this.getStats('api'),
    };

    return `
=== Performance Report ===
Total Metrics: ${this.metrics.length}

Components:
  Count: ${stats.component.count}
  Avg: ${stats.component.avg.toFixed(2)}ms
  P95: ${stats.component.p95.toFixed(2)}ms
  
Operations:
  Count: ${stats.operation.count}
  Avg: ${stats.operation.avg.toFixed(2)}ms
  P95: ${stats.operation.p95.toFixed(2)}ms
  
API Calls:
  Count: ${stats.api.count}
  Avg: ${stats.api.avg.toFixed(2)}ms
  P95: ${stats.api.p95.toFixed(2)}ms

Slow Operations (>threshold):
${this.metrics.filter(m => m.duration > this.thresholds[m.type]).map(m => `  ${m.name}: ${m.duration.toFixed(2)}ms`).join('\n')}
`;
  }
}

// Singleton instance
export const performanceTracker = new PerformanceTracker();

// Hook para React components
import { useEffect } from 'react';

export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const end = performanceTracker.start(`${componentName}:mount`);
    
    return () => {
      end('component', { phase: 'unmount' });
    };
  }, [componentName]);
}
