import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, FileText, Users } from "lucide-react";
import { TeleodontoSessionList } from "@/modules/teleodonto/presentation/components/TeleodontoSessionList";
import { TeleodontoScheduler } from "@/modules/teleodonto/presentation/components/TeleodontoScheduler";
import { TeleodontoDashboard } from "@/modules/teleodonto/presentation/components/TeleodontoDashboard";

export default function TeleodontoPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teleodontologia</h1>
          <p className="text-muted-foreground">
            Consultas remotas e atendimento online
          </p>
        </div>
        <Button>
          <Video className="mr-2 h-4 w-4" />
          Nova Sessão
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Users className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Video className="mr-2 h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TeleodontoDashboard />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <TeleodontoSessionList />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <TeleodontoScheduler />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Teleodontologia</CardTitle>
              <CardDescription>
                Análise de sessões e performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
