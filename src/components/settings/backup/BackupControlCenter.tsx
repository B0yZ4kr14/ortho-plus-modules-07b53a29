import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, RefreshCw, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackupWizard } from './BackupWizard';
import { RestoreWizard } from './RestoreWizard';
import { BackupSettingsTab } from './BackupSettingsTab';
import { BackupHistoryTab } from './BackupHistoryTab';
import { BackupLogsTab } from './BackupLogsTab';

export function BackupControlCenter() {
  const [isBackupWizardOpen, setIsBackupWizardOpen] = useState(false);
  const [isRestoreWizardOpen, setIsRestoreWizardOpen] = useState(false);

  // Mock stats - substituir por dados reais
  const stats = {
    totalBackups: 48,
    storageUsed: '12.3 GB',
    lastBackup: '15/11/2025 18:30',
    successRate: '98.2%',
  };

  return (
    <div className="space-y-6">
      {/* CTAs Principais */}
      <div className="flex gap-4">
        <Button 
          size="lg" 
          className="flex-1"
          onClick={() => setIsBackupWizardOpen(true)}
        >
          <HardDrive className="mr-2 h-5 w-5" />
          Backup Agora
        </Button>
        <Button 
          size="lg" 
          variant="secondary"
          className="flex-1"
          onClick={() => setIsRestoreWizardOpen(true)}
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Restaurar
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBackups}</div>
            <p className="text-xs text-muted-foreground">Backups realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">De 50 GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">{stats.lastBackup}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline - Últimos 10 backups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '15/11 18:30', type: 'Full', status: 'success', size: '2.3 GB' },
              { date: '15/11 12:00', type: 'Incremental', status: 'success', size: '156 MB' },
              { date: '14/11 18:30', type: 'Full', status: 'success', size: '2.2 GB' },
              { date: '14/11 12:00', type: 'Incremental', status: 'failed', size: '-' },
              { date: '13/11 18:30', type: 'Full', status: 'success', size: '2.1 GB' },
            ].map((backup, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {backup.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{backup.date} - {backup.type}</p>
                    <p className="text-xs text-muted-foreground">{backup.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <BackupSettingsTab />
        </TabsContent>
        <TabsContent value="history">
          <BackupHistoryTab />
        </TabsContent>
        <TabsContent value="logs">
          <BackupLogsTab />
        </TabsContent>
      </Tabs>

      {/* Wizards */}
      <BackupWizard 
        open={isBackupWizardOpen} 
        onOpenChange={setIsBackupWizardOpen} 
      />
      <RestoreWizard 
        open={isRestoreWizardOpen} 
        onOpenChange={setIsRestoreWizardOpen} 
      />
    </div>
  );
}
