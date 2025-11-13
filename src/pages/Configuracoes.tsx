import { useState } from 'react';
import { Settings, Package, Users, Database, Shield, Bell, Download, Upload } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ModulesSimple from './settings/ModulesSimple';
import DatabaseBackupTab from '@/components/settings/DatabaseBackupTab';
import { BackupStatsDashboard } from '@/components/settings/BackupStatsDashboard';
import { UserManagementTab } from '@/components/settings/UserManagementTab';
import { ModulePermissionsManager } from '@/components/settings/ModulePermissionsManager';
import { PermissionTemplates } from '@/components/settings/PermissionTemplates';
import { PermissionAuditLogs } from '@/components/settings/PermissionAuditLogs';
import { DataMigrationWizard } from '@/components/settings/DataMigrationWizard';

export default function Configuracoes() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('modules');
  const [showExportWizard, setShowExportWizard] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

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
      id: 'permissions',
      label: 'Permissões',
      icon: Shield,
      description: 'Gerenciar permissões de acesso por módulo'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários e permissões'
    },
    {
      id: 'database',
      label: 'Banco de Dados',
      icon: Database,
      description: 'Configurações de backup e dados'
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
          <ModulesSimple />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionTemplates />
          <ModulePermissionsManager />
          <PermissionAuditLogs />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migração de Dados</CardTitle>
              <CardDescription>
                Exporte ou importe dados completos da clínica entre instalações do Ortho+
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowExportWizard(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button 
                  onClick={() => setShowImportWizard(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <BackupStatsDashboard />
          <DatabaseBackupTab />
        </TabsContent>

        <DataMigrationWizard 
          open={showExportWizard}
          onClose={() => setShowExportWizard(false)}
          mode="export"
        />
        
        <DataMigrationWizard 
          open={showImportWizard}
          onClose={() => setShowImportWizard(false)}
          mode="import"
        />

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
