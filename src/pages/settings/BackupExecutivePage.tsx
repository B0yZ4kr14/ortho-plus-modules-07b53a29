import { PageHeader } from '@/components/shared/PageHeader';
import { BackupDashboard } from '@/components/settings/BackupDashboard';
import { Database } from 'lucide-react';

export default function BackupExecutivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Database}
        title="Dashboard de Backups"
        description="Visão completa da saúde e confiabilidade do sistema de backups"
      />
      <BackupDashboard />
    </div>
  );
}
