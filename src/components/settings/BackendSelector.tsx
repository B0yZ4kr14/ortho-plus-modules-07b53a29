/**
 * BACKEND SELECTOR V5.0
 * Status do backend (somente Ubuntu Server Local)
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Wifi, WifiOff, Clock } from "lucide-react";

interface BackendConfig {
  type: "ubuntu-server";
  url: string;
  status: "online" | "offline" | "checking";
  latency: number | null;
}

export function BackendSelector() {
  const [backend, setBackend] = useState<BackendConfig>({
    type: "ubuntu-server",
    url: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.201:3000",
    status: "checking",
    latency: null,
  });

  // Verificar status de conexão
  useEffect(() => {
    const checkBackendStatus = async (): Promise<BackendConfig> => {
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // pinging the health endpoint
        const response = await fetch(`${backend.url}/health`, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;

        return {
          ...backend,
          status: response.ok ? "online" : "offline",
          latency,
        };
      } catch (error) {
        return {
          ...backend,
          status: "offline",
          latency: null,
        };
      }
    };

    const checkStatus = async () => {
      const status = await checkBackendStatus();
      setBackend(status);
    };

    checkStatus();

    // Recheck a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: BackendConfig["status"]) => {
    const variants = {
      online: { variant: "default" as const, icon: Wifi, text: "Online" },
      offline: {
        variant: "destructive" as const,
        icon: WifiOff,
        text: "Offline",
      },
      checking: {
        variant: "outline" as const,
        icon: Clock,
        text: "Verificando...",
      },
    };

    const { variant, icon: Icon, text } = variants[status];

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Servidor Local</CardTitle>
        <CardDescription>
          A aplicação está conectada ao servidor local (Ubuntu Server) usando a
          nova infraestrutura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4 rounded-lg border border-primary p-4 bg-primary/5">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Server className="h-5 w-5 text-primary" />
                OrthoPlus Backend (Express)
              </div>
              {getStatusBadge(backend.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Servidor PostgreSQL e API Node.js local/on-premises. Controle
              total da sua infraestrutura.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>URL: {backend.url}</span>
              {backend.latency !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {backend.latency}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
