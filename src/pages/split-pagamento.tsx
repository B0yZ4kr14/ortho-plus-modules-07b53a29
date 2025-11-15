import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Split, Settings, History, TrendingUp } from "lucide-react";
import { SplitConfigForm } from "@/modules/split-pagamento/presentation/components/SplitConfigForm";
import { SplitHistory } from "@/modules/split-pagamento/presentation/components/SplitHistory";
import { SplitDashboard } from "@/modules/split-pagamento/presentation/components/SplitDashboard";
import { useSplitConfig } from "@/modules/split-pagamento/application/hooks/useSplitConfig";

export default function SplitPagamentoPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { config, transactions, isLoading } = useSplitConfig();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Split de Pagamento</h1>
          <p className="text-muted-foreground">
            Divisão automática de receitas e otimização tributária
          </p>
        </div>
        <Button>
          <Split className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SplitDashboard />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <SplitConfigForm />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SplitHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
