import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { monitorMemoryUsage, getAllCacheMetrics } from '@/lib/performance';
import { Activity, Database, Gauge, Zap } from 'lucide-react';

/**
 * Performance Monitor Component
 * Exibe métricas de performance em tempo real (DEV only)
 */
export function PerformanceMonitor() {
  const [memory, setMemory] = useState<ReturnType<typeof monitorMemoryUsage>>(null);
  const [cacheMetrics, setCacheMetrics] = useState(getAllCacheMetrics());
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    // Só mostrar em DEV
    if (!import.meta.env.DEV) return;

    // Update memory metrics
    const memoryInterval = setInterval(() => {
      setMemory(monitorMemoryUsage());
      setCacheMetrics(getAllCacheMetrics());
    }, 2000);

    // Measure FPS
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // Só renderizar em DEV
  if (!import.meta.env.DEV) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (usage: string) => {
    const percent = parseFloat(usage);
    if (percent < 60) return 'success';
    if (percent < 80) return 'warning';
    return 'destructive';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-xs">
      {/* FPS Monitor */}
      <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">FPS:</span>
            <Badge variant="outline" className={getFPSColor(fps)}>
              {fps}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Memory Monitor */}
      {memory && (
        <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Used:</span>
              <span className="font-mono">{memory.usedJSHeapSize}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono">{memory.totalJSHeapSize}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Usage:</span>
              <Badge variant={getMemoryColor(memory.usage)}>
                {memory.usage}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Metrics */}
      {cacheMetrics.size > 0 && (
        <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from(cacheMetrics.entries()).map(([name, metrics]) => (
              <div key={name} className="space-y-1">
                <div className="text-xs font-semibold">{name}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <Badge variant="outline">
                    {metrics.hitRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          <Activity className="h-3 w-3 mr-1" />
          DEV MODE
        </Badge>
      </div>
    </div>
  );
}
