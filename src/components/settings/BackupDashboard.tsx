import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, LineChart, Clock, Shield, Settings, FileText, TrendingUp } from 'lucide-react';
import { BackupStatsTab } from './backup-tabs/BackupStatsTab';
import { BackupPostgreSQLTab } from './backup-tabs/BackupPostgreSQLTab';
import { BackupExecutiveTab } from './backup-tabs/BackupExecutiveTab';
import { BackupTimelineTab } from './backup-tabs/BackupTimelineTab';
import { BackupReplicationTab } from './backup-tabs/BackupReplicationTab';
import { BackupRetentionTab } from './backup-tabs/BackupRetentionTab';
import { BackupExportTab } from './backup-tabs/BackupExportTab';

export function BackupDashboard() {
  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-6">
        <TabsTrigger value="stats" className="gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger value="postgresql" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">PostgreSQL</span>
        </TabsTrigger>
        <TabsTrigger value="executive" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Executivo</span>
        </TabsTrigger>
        <TabsTrigger value="timeline" className="gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="replication" className="gap-2">
          <LineChart className="h-4 w-4" />
          <span className="hidden sm:inline">Replicação</span>
        </TabsTrigger>
        <TabsTrigger value="retention" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Retenção</span>
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Exportação</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-6">
        <BackupStatsTab />
      </TabsContent>

      <TabsContent value="postgresql" className="space-y-6">
        <BackupPostgreSQLTab />
      </TabsContent>

      <TabsContent value="executive" className="space-y-6">
        <BackupExecutiveTab />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <BackupTimelineTab />
      </TabsContent>

      <TabsContent value="replication" className="space-y-6">
        <BackupReplicationTab />
      </TabsContent>

      <TabsContent value="retention" className="space-y-6">
        <BackupRetentionTab />
      </TabsContent>

      <TabsContent value="export" className="space-y-6">
        <BackupExportTab />
      </TabsContent>
    </Tabs>
  );
}
