/**
 * Performance Monitoring Utilities
 * Ferramentas para monitorar e otimizar performance da aplicação
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

import { logger } from './logger';

// Web Vitals Monitoring
export function reportWebVitals(metric: any) {
  // Log metrics para analytics (only in dev)
  logger.info('Web Vitals', { metric });
  
  // Integração com analytics (Google Analytics, etc)
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// Performance Observer para Long Tasks
export function observeLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.warn(`Long Task detected`, {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Browser não suporta longtask
    }
  }
}

// Measure Component Render Time
export function measureRender(componentName: string, callback: () => void) {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // > 60fps threshold
    logger.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
  }
}

// Resource Loading Monitor
export function monitorResourceLoading() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Alerta para recursos lentos (> 1s)
          if (resourceEntry.duration > 1000) {
            logger.warn(`Slow resource`, {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              type: resourceEntry.initiatorType,
            });
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}

// Memory Usage Monitor
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    return {
      usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%',
    };
  }
  
  return null;
}

// Image Loading Optimization
export function optimizeImageLoading() {
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Cache Performance Metrics
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
}

const cacheMetrics: Map<string, CacheMetrics> = new Map();

export function trackCacheHit(cacheName: string) {
  const metrics = cacheMetrics.get(cacheName) || { hits: 0, misses: 0, hitRate: 0 };
  metrics.hits++;
  metrics.hitRate = (metrics.hits / (metrics.hits + metrics.misses)) * 100;
  cacheMetrics.set(cacheName, metrics);
}

export function trackCacheMiss(cacheName: string) {
  const metrics = cacheMetrics.get(cacheName) || { hits: 0, misses: 0, hitRate: 0 };
  metrics.misses++;
  metrics.hitRate = (metrics.hits / (metrics.hits + metrics.misses)) * 100;
  cacheMetrics.set(cacheName, metrics);
}

export function getCacheMetrics(cacheName: string): CacheMetrics | undefined {
  return cacheMetrics.get(cacheName);
}

export function getAllCacheMetrics(): Map<string, CacheMetrics> {
  return new Map(cacheMetrics);
}

// Performance Budget Check
export interface PerformanceBudget {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  tbt: number; // Total Blocking Time (ms)
}

const DEFAULT_BUDGET: PerformanceBudget = {
  fcp: 1500,
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  tbt: 200,
};

export function checkPerformanceBudget(
  metrics: Partial<PerformanceBudget>,
  budget: PerformanceBudget = DEFAULT_BUDGET
): boolean {
  const violations: string[] = [];
  
  if (metrics.fcp && metrics.fcp > budget.fcp) {
    violations.push(`FCP: ${metrics.fcp}ms > ${budget.fcp}ms`);
  }
  
  if (metrics.lcp && metrics.lcp > budget.lcp) {
    violations.push(`LCP: ${metrics.lcp}ms > ${budget.lcp}ms`);
  }
  
  if (metrics.fid && metrics.fid > budget.fid) {
    violations.push(`FID: ${metrics.fid}ms > ${budget.fid}ms`);
  }
  
  if (metrics.cls && metrics.cls > budget.cls) {
    violations.push(`CLS: ${metrics.cls} > ${budget.cls}`);
  }
  
  if (metrics.tbt && metrics.tbt > budget.tbt) {
    violations.push(`TBT: ${metrics.tbt}ms > ${budget.tbt}ms`);
  }
  
  if (violations.length > 0) {
    logger.warn('Performance Budget Violations', { violations });
    return false;
  }
  
  return true;
}

// Initialize Performance Monitoring
export function initPerformanceMonitoring() {
  observeLongTasks();
  monitorResourceLoading();
  optimizeImageLoading();
  
  // Log memory usage periodically (dev only)
  if (import.meta.env.DEV) {
    setInterval(() => {
      const memory = monitorMemoryUsage();
      if (memory) {
        logger.info('Memory Usage', memory);
      }
    }, 30000); // Every 30 seconds
  }
}
