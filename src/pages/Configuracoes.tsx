import { useState } from 'react';
import { Settings, Package, Users, Database, Shield, Bell } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ModulesAdmin from './settings/ModulesAdmin';
import { DatabaseBackupTab } from '@/components/settings/DatabaseBackupTab';
import { BackupStatsDashboard } from '@/components/settings/BackupStatsDashboard';

export default function Configuracoes() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('modules');

  // Apenas ADMINs podem acessar configurações
  if (!hasRole('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  const configSections = [
    {
      id: 'modules',
      label: 'Módulos',
      icon: Package,
      description: 'Gerenciar módulos ativos do sistema'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários e permissões',
      comingSoon: true
    },
    {
      id: 'database',
      label: 'Banco de Dados',
      icon: Database,
      description: 'Configurações de backup e dados'
    },
    {
      id: 'security',
      label: 'Segurança',
      icon: Shield,
      description: 'Configurações de segurança e auditoria',
      comingSoon: true
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      description: 'Configurar alertas e notificações',
      comingSoon: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Configurações Administrativas" 
        icon={Settings}
        description="Gerencie todos os aspectos do sistema Ortho +"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {configSections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              disabled={section.comingSoon}
              className="relative"
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.label}
              {section.comingSoon && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Em Breve
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <ModulesAdmin />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Adicione, edite ou remova usuários do sistema e gerencie suas permissões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Em Desenvolvimento</p>
                <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <BackupStatsDashboard />
          <DatabaseBackupTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Auditoria</CardTitle>
              <CardDescription>
                Configure políticas de segurança, logs de auditoria e conformidade LGPD.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Em Desenvolvimento</p>
                <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure alertas por email, SMS e notificações push para eventos importantes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Em Desenvolvimento</p>
                <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
