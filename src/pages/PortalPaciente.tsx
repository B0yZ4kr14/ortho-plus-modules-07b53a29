import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Calendar, FileText, CreditCard, Bell, Settings } from 'lucide-react';

export default function PortalPacientePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Portal do Paciente"
        description="Área de autoatendimento e gestão de informações pessoais"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Cadastrados</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Com acesso ao portal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Online</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Enviados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Documentos digitais</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades do Portal</CardTitle>
            <CardDescription>O que os pacientes podem fazer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Agendamento Online</p>
                <p className="text-sm text-muted-foreground">Marcar consultas 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Acesso ao Prontuário</p>
                <p className="text-sm text-muted-foreground">Visualizar histórico médico</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Pagamentos Online</p>
                <p className="text-sm text-muted-foreground">Consultar e pagar débitos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">Lembretes de consultas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Portal</CardTitle>
            <CardDescription>Personalize a experiência dos pacientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Personalizar Branding
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Configurar Notificações
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Regras de Agendamento
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Métodos de Pagamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
