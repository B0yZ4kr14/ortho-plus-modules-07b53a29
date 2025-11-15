import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings, History, TrendingDown } from "lucide-react";
import { InadimplenciaList } from "@/modules/inadimplencia/presentation/components/InadimplenciaList";
import { CobrancaAutomation } from "@/modules/inadimplencia/presentation/components/CobrancaAutomation";
import { InadimplenciaDashboard } from "@/modules/inadimplencia/presentation/components/InadimplenciaDashboard";

export default function InadimplenciaPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Inadimplência</h1>
          <p className="text-muted-foreground">
            Gestão e cobrança automatizada de débitos
          </p>
        </div>
        <Button>
          <AlertCircle className="mr-2 h-4 w-4" />
          Nova Cobrança
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <TrendingDown className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list">
            <AlertCircle className="mr-2 h-4 w-4" />
            Inadimplentes
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="mr-2 h-4 w-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <InadimplenciaDashboard />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <InadimplenciaList />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <CobrancaAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
