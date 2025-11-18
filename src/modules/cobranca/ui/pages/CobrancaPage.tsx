import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send,
  FileText,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function CobrancaPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Cobrança e Inadimplência"
        description="Gestão de cobranças, controle de inadimplência e automação de comunicação"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.840,00</div>
            <p className="text-xs text-muted-foreground">
              32 faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ 8.240,00</div>
            <p className="text-xs text-muted-foreground">
              18 faturas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ 7.600,00</div>
            <p className="text-xs text-muted-foreground">
              14 faturas próximas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Recuperação</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inadimplentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inadimplentes">Inadimplentes</TabsTrigger>
          <TabsTrigger value="comunicacao">Comunicação Automática</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Cobranças</TabsTrigger>
        </TabsList>

        <TabsContent value="inadimplentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Inadimplentes</CardTitle>
              <CardDescription>
                Lista de clientes com faturas vencidas e ações de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Buscar por paciente ou CPF..." className="max-w-sm" />
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Cobrança em Lote
                  </Button>
                </div>

                {/* TODO: Implementar lista dinâmica com dados reais do Supabase */}
                <div className="border rounded-lg divide-y">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 flex items-center justify-between hover:bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-medium">Paciente {item}</p>
                        <p className="text-sm text-muted-foreground">CPF: 000.000.000-00</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="destructive">Vencido há 15 dias</Badge>
                          <Badge variant="outline">R$ 450,00</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          E-mail
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Fatura
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comunicação Automatizada</CardTitle>
              <CardDescription>
                Configure regras de envio automático de lembretes e cobranças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Funcionalidade em desenvolvimento - Integração com WhatsApp Business API e e-mail
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
              <CardDescription>
                Registro de todas as ações de cobrança enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Funcionalidade em desenvolvimento - Audit log de comunicações enviadas
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
