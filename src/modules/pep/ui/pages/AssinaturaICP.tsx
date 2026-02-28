import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileSignature, 
  Key, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Upload,
  Download,
  Send,
  FileText,
  User,
  Calendar,
  Lock
} from 'lucide-react';

export default function AssinaturaICP() {
  const { hasModuleAccess } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!hasModuleAccess('ASSINATURA_ICP')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p>Você não tem acesso a este módulo.</p>
              <p className="text-sm mt-2">Entre em contato com o administrador para solicitar acesso.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinatura Digital ICP-Brasil</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de certificados digitais e assinaturas qualificadas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Certificado
          </Button>
          <Button>
            <FileSignature className="h-4 w-4 mr-2" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Ativos</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 expiram em 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docs Assinados (Mês)</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+15%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 com prazo próximo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Todas assinaturas válidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Certificados por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Certificados por Tipo</CardTitle>
                <CardDescription>Distribuição dos certificados digitais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50">e-CPF A1</Badge>
                    <span className="text-sm">3 certificados</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Válidos</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50">e-CPF A3</Badge>
                    <span className="text-sm">2 certificados</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Válidos</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-purple-50">e-CNPJ A1</Badge>
                    <span className="text-sm">1 certificado</span>
                  </div>
                  <span className="text-sm text-yellow-600">Expira em breve</span>
                </div>
              </CardContent>
            </Card>

            {/* Documentos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Assinados Recentemente</CardTitle>
                <CardDescription>Últimas assinaturas realizadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Contrato - João Silva', type: 'Contrato', date: 'Hoje, 14:30', signers: 2 },
                  { name: 'Termo de Consentimento - Maria', type: 'Termo', date: 'Hoje, 11:20', signers: 1 },
                  { name: 'Orçamento - Carlos Souza', type: 'Orçamento', date: 'Ontem, 16:45', signers: 2 },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{doc.signers} assin.</span>
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Solicitações Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>Documentos aguardando sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Contrato de Tratamento - Ana Lima', requester: 'Dr. Roberto', date: 'Enviado há 2 dias', expires: '28 dias' },
                  { name: 'Termo de Consentimento LGPD', requester: 'Sistema', date: 'Enviado há 5 dias', expires: '25 dias' },
                ].map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                        <FileSignature className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-sm text-muted-foreground">Solicitado por: {request.requester}</p>
                        <p className="text-xs text-muted-foreground">{request.date} • Expira em {request.expires}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">Visualizar</Button>
                      <Button size="sm">
                        <FileSignature className="h-4 w-4 mr-2" />
                        Assinar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Meus Certificados Digitais</CardTitle>
              <CardDescription>Gerenciamento de certificados ICP-Brasil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'e-CPF A1', name: 'João Silva', serial: '1234567890ABCDEF', issuer: 'AC Serasa', validUntil: '15/08/2026', status: 'active' },
                  { type: 'e-CPF A3', name: 'João Silva', serial: 'FEDCBA0987654321', issuer: 'AC Certisign', validUntil: '22/12/2025', status: 'active' },
                  { type: 'e-CNPJ A1', name: 'Clínica Ortho+', serial: 'ABCD1234EFGH5678', issuer: 'AC Soluti', validUntil: '10/01/2026', status: 'expiring' },
                ].map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Key className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{cert.type}</p>
                          {cert.status === 'active' ? (
                            <Badge variant="default" className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Ativo</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center space-x-1 bg-yellow-50">
                              <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              <span>Expira em breve</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Serial: {cert.serial} • Emissor: {cert.issuer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Válido até: {cert.validUntil}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">Ver Detalhes</Button>
                      {cert.status === 'expiring' && (
                        <Button size="sm">Renovar</Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Novo Certificado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Assinados</CardTitle>
              <CardDescription>Histórico de documentos com assinatura digital</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Lista de documentos assinados será exibida aqui</p>
                <p className="text-sm mt-2">Filtros por tipo, data, status e signatários</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Assinatura</CardTitle>
              <CardDescription>Gerenciar solicitações enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestão de solicitações de assinatura</p>
                <p className="text-sm mt-2">Enviar, acompanhar e lembrar signatários</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Validação de Assinaturas</CardTitle>
              <CardDescription>Verificar autenticidade e validade de assinaturas digitais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg border-dashed">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-2">Validar Documento Assinado</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Arraste um documento assinado ou clique para selecionar
                      </p>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Documento
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Validações Realizadas</h4>
                  {[
                    { doc: 'Contrato_Silva_2025.pdf', result: 'Válido', date: 'Hoje, 15:30', details: 'Todas as assinaturas verificadas' },
                    { doc: 'Termo_Consentimento.pdf', result: 'Válido', date: 'Ontem, 10:20', details: '1 assinatura verificada' },
                  ].map((validation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{validation.doc}</p>
                          <p className="text-xs text-muted-foreground">{validation.details} • {validation.date}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        {validation.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
