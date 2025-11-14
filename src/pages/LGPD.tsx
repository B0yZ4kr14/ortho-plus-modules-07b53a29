import { Shield, FileCheck, Download, UserX, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function LGPD() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            LGPD - Conformidade e Segurança
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão de consentimentos, solicitações de dados e conformidade com LGPD
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total de consentimentos válidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exportações Realizadas</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exclusões Solicitadas</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Direito ao esquecimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="consents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações de Dados</TabsTrigger>
          <TabsTrigger value="exports">Exportações</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consentimentos LGPD</CardTitle>
              <CardDescription>
                Gerenciar termos de consentimento e aceitações dos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum consentimento registrado ainda.</p>
                <p className="text-sm mt-2">
                  Os consentimentos serão exibidos aqui quando pacientes aceitarem os termos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Dados</CardTitle>
              <CardDescription>
                Gerenciar solicitações de acesso, portabilidade, retificação e exclusão de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma solicitação pendente.</p>
                <p className="text-sm mt-2">
                  Solicitações de titulares de dados serão listadas aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportações de Dados</CardTitle>
              <CardDescription>
                Histórico de exportações realizadas para atender solicitações de portabilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma exportação realizada.</p>
                <p className="text-sm mt-2">
                  Exportações de dados de pacientes serão listadas aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs LGPD</CardTitle>
              <CardDescription>
                Registro de todas as ações relacionadas a dados pessoais e LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log de auditoria registrado.</p>
                <p className="text-sm mt-2">
                  Todas as ações críticas de LGPD serão auditadas aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Alert */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Conformidade LGPD Ativa</p>
              <p className="text-sm text-muted-foreground">
                Este módulo garante conformidade com a Lei Geral de Proteção de Dados (LGPD).
                Todos os consentimentos, solicitações e exportações são registrados e auditados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
