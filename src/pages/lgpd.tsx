import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, FileText, History, Settings } from "lucide-react";
import { LGPDRequests } from "@/modules/lgpd/presentation/components/LGPDRequests";
import { LGPDConsents } from "@/modules/lgpd/presentation/components/LGPDConsents";
import { LGPDAuditTrail } from "@/modules/lgpd/presentation/components/LGPDAuditTrail";

export default function LGPDPage() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LGPD - Conformidade</h1>
          <p className="text-muted-foreground">
            Gestão de privacidade e proteção de dados
          </p>
        </div>
        <Button>
          <Shield className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            <FileText className="mr-2 h-4 w-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="consents">
            <Shield className="mr-2 h-4 w-4" />
            Consentimentos
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="mr-2 h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <LGPDRequests />
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <LGPDConsents />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <LGPDAuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
}
