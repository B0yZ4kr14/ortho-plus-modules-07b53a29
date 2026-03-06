import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect } from "react";

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

/**
 * Hook para monitorar Web Vitals (FCP, LCP, FID, CLS, TTFB)
 * e enviar para o banco de dados para análise RUM (Real User Monitoring)
 */
export function useWebVitals(enabled: boolean = true) {
  const { user, clinicId } = useAuth();

  useEffect(() => {
    if (!enabled || !user || !clinicId) return;

    const reportMetric = async (metric: WebVitalsMetric) => {
      try {
        await apiClient.post("/analytics/rum-metrics", {
          clinic_id: clinicId,
          user_id: user.id,
          metric_name: metric.name,
          metric_value: metric.value,
          rating: metric.rating,
          page_url: window.location.pathname,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error("[WebVitals] Error reporting metric:", error);
      }
    };

    // Observer para FCP (First Contentful Paint)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            const value = entry.startTime;
            reportMetric({
              name: "FCP",
              value,
              rating:
                value < 1800
                  ? "good"
                  : value < 3000
                    ? "needs-improvement"
                    : "poor",
              delta: value,
              id: entry.entryType,
            });
          }
        }
      });
      observer.observe({ entryTypes: ["paint"] });
    };

    // Observer para LCP (Largest Contentful Paint)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.startTime;

        reportMetric({
          name: "LCP",
          value,
          rating:
            value < 2500 ? "good" : value < 4000 ? "needs-improvement" : "poor",
          delta: value,
          id: lastEntry.entryType,
        });
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    };

    // Observer para CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        reportMetric({
          name: "CLS",
          value: clsValue,
          rating:
            clsValue < 0.1
              ? "good"
              : clsValue < 0.25
                ? "needs-improvement"
                : "poor",
          delta: clsValue,
          id: "layout-shift",
        });
      });
      observer.observe({ entryTypes: ["layout-shift"] });
    };

    // Observer para FID (First Input Delay)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        const value =
          (firstInput as any).processingStart - firstInput.startTime;

        reportMetric({
          name: "FID",
          value,
          rating:
            value < 100 ? "good" : value < 300 ? "needs-improvement" : "poor",
          delta: value,
          id: firstInput.entryType,
        });
      });
      observer.observe({ entryTypes: ["first-input"] });
    };

    // TTFB (Time to First Byte)
    const observeTTFB = () => {
      const navEntry = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const value = navEntry.responseStart - navEntry.requestStart;
        reportMetric({
          name: "TTFB",
          value,
          rating:
            value < 800 ? "good" : value < 1800 ? "needs-improvement" : "poor",
          delta: value,
          id: "navigation",
        });
      }
    };

    // Iniciar observers
    if ("PerformanceObserver" in window) {
      try {
        observeFCP();
        observeLCP();
        observeCLS();
        observeFID();
        observeTTFB();
      } catch (error) {
        console.error("[WebVitals] Error setting up observers:", error);
      }
    }
  }, [enabled, user, clinicId]);
}
